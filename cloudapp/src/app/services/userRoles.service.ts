import { Injectable } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { catchError, map, mergeMap, switchMap } from 'rxjs/operators';
import { ValidationInfo } from '../models/validationInfo';
import { CompareResult } from '../types/compareResult.type';
import { CopyResult } from '../types/copyResult.type';
import { UserDetails } from '../types/userDetails.type';
import { UserDetailsChecked } from '../types/userDetailsChecked';
import { UserRole } from '../types/userRole.type';
import { ArrayHelperService } from './arrayHelper.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class UserRolesService {
  public constructor(
    private userService: UserService,
    private arrayHelper: ArrayHelperService
  ) {}

  public copy(
    sourceUser: UserDetailsChecked,
    selectedRoles: UserRole[],
    targetUser: UserDetails,
    replaceExistingRoles: boolean
  ): Observable<CopyResult> {
    let copyResult: Observable<CopyResult>;
    if (sourceUser.rolesValid) {
      copyResult = this.copyValidRoles(
        selectedRoles,
        targetUser,
        replaceExistingRoles
      );
    } else {
      copyResult = this.copyOneByOne(
        selectedRoles,
        targetUser,
        replaceExistingRoles
      );
    }

    copyResult = copyResult.pipe(
      map((copyResult) => {
        const duplicates: UserRole[] = this.arrayHelper.findDuplicates(
          sourceUser.user_role
        );
        copyResult.skippedDuplicateRoles = this.arrayHelper.intersection(
          selectedRoles,
          duplicates
        );
        return copyResult;
      })
    );

    return copyResult;
  }

  public compare(
    sourceUser: UserDetailsChecked,
    targetUser: UserDetails
  ): Observable<CompareResult> {
    let sourceRoles = this.normalizeRolesList(sourceUser.user_role);
    let targetRoles = this.normalizeRolesList(targetUser.user_role);

    let intersection: UserRole[] = this.arrayHelper.intersection(
      sourceRoles,
      targetRoles
    );
    let onlyInSource: UserRole[] = this.arrayHelper.removeItems(
      sourceRoles,
      intersection
    );
    let onlyInTarget: UserRole[] = this.arrayHelper.removeItems(
      targetRoles,
      intersection
    );
    let sourceDuplicates: UserRole[] =
      this.arrayHelper.findDuplicates(sourceRoles);
    let targetDuplicates: UserRole[] =
      this.arrayHelper.findDuplicates(targetRoles);

    let compareResult: CompareResult = {
      intersection: intersection,
      onlyInSource: onlyInSource,
      onlyInTarget: onlyInTarget,
      sourceDuplicates: sourceDuplicates,
      targetDuplicates: targetDuplicates,
    };
    return of(compareResult);
  }

  private copyValidRoles(
    selectedRoles: UserRole[],
    targetUser: UserDetails,
    replaceExistingRoles: boolean
  ): Observable<CopyResult> {
    if (replaceExistingRoles) {
      // replace existing roles by overwriting the target roles with the selected roles
      targetUser.user_role = this.normalizeRolesList(selectedRoles);
    } else {
      // don't replace by combining existing roles with the new roles
      targetUser.user_role = this.normalizeRolesList([
        ...selectedRoles,
        ...targetUser.user_role,
      ]);
    }

    // since all roles are valid, just updated the target user
    return this.userService.updateUser(targetUser).pipe(
      switchMap((userDetails) => {
        let copyResult: CopyResult = {
          rolesSelectedToCopy: selectedRoles,
          validRoles: targetUser.user_role,
          copiedRoles: selectedRoles,
          invalidRoles: [],
          skippedDuplicateRoles: [],
          targetUser: userDetails,
        };
        return of(copyResult);
      })
    );
  }

  private copyOneByOne(
    selectedRoles: UserRole[],
    targetUser: UserDetails,
    replaceExistingRoles: boolean
  ): Observable<CopyResult> {
    let roles = [];
    let backupRoles = targetUser.user_role;
    if (replaceExistingRoles) {
      // replace: just use the selected roles of the source user
      roles = this.normalizeRolesList(selectedRoles);
    } else {
      // don't replace, combine the roles of source and target user
      roles = this.normalizeRolesList([
        ...selectedRoles,
        ...targetUser.user_role,
      ]);
    }

    // since there are only 25 requests in 5sec allowed (see: https://developers.exlibrisgroup.com/cloudapps/docs/api/rest-service/)
    // we have to be reduce the calls as much as possible
    // one-by-one copy from users with over 200 roles are not possible
    // -> attempt a recursive-binary-search-style update method (🤪)
    let roleState$: Observable<RoleState> = from(
      this.evaluateRoles(roles, [], targetUser)
    );

    return roleState$.pipe(
      switchMap((roleState) => {
        targetUser.user_role = roleState.valid;
        return this.userService.updateUser(targetUser).pipe(
          switchMap((userDetails) => {
            let copyResult: CopyResult = {
              rolesSelectedToCopy: selectedRoles,
              validRoles: roleState.valid,
              invalidRoles: roleState.invalid,
              copiedRoles: this.arrayHelper.removeItems(
                selectedRoles,
                roleState.invalid
              ),
              skippedDuplicateRoles: [],
              targetUser: userDetails,
            };
            return of(copyResult);
          })
        );
      }),
      catchError((e) => {
        targetUser.user_role = backupRoles;
        return this.userService.updateUser(targetUser).pipe(
          switchMap((userDetails) => {
            let copyResult: CopyResult = {
              rolesSelectedToCopy: selectedRoles,
              validRoles: [],
              invalidRoles: [],
              copiedRoles: [],
              skippedDuplicateRoles: roles,
              targetUser: userDetails,
            };
            return of(copyResult);
          })
        );
      })
    );
  }

  private async evaluateRoles(
    roles: UserRole[],
    invalidRoles: UserRole[],
    targetUser: UserDetails
  ): Promise<RoleState> {
    let evaluatedInvalid: UserRole[] = await this.findInvalid(
      roles,
      [],
      [],
      targetUser
    );
    let remainingRoles: UserRole[] = this.arrayHelper.removeItems(
      roles,
      evaluatedInvalid
    );

    let invalid: boolean = await this.hasInvalidRole(
      remainingRoles,
      targetUser
    );
    if (invalid) {
      let newInvalidRoles: UserRole[] = [...invalidRoles, ...evaluatedInvalid];
      return await this.evaluateRoles(
        remainingRoles,
        newInvalidRoles,
        targetUser
      );
    } else {
      return {
        valid: remainingRoles,
        invalid: evaluatedInvalid,
      };
    }
  }

  /*
   * Recursive function which checks if the given roles are valid by setting the
   * reduced set of roles to the user and perform an update. If the update is successful
   * the roles are valid, if the update fail, not all roles are valid.
   *
   * If not all roles are valid, the set is split in half and tested again (recursively)
   */
  private async findInvalid(
    testRoles: UserRole[],
    remainingRoles: UserRole[],
    invalidRoles: UserRole[],
    targetUser: UserDetails
  ): Promise<UserRole[]> {
    if (testRoles.length == 0 && remainingRoles.length == 0) {
      return invalidRoles;
    }
    let invalid: boolean = await this.hasInvalidRole(testRoles, targetUser);
    if (!invalid) {
      return await this.findInvalid(
        remainingRoles,
        [],
        invalidRoles,
        targetUser
      );
    } else {
      if (testRoles.length == 1) {
        let newInvalidRoles: UserRole[] = [...invalidRoles, ...testRoles];
        return await this.findInvalid(
          remainingRoles,
          [],
          newInvalidRoles,
          targetUser
        );
      }
      let bisected: [UserRole[], UserRole[]] =
        this.arrayHelper.bisect(testRoles);
      let newRemaining: UserRole[] = [...remainingRoles, ...bisected[1]];
      return await this.findInvalid(
        bisected[0],
        newRemaining,
        invalidRoles,
        targetUser
      );
    }
  }

  private async hasInvalidRole(
    roles: UserRole[],
    targetUser: UserDetails
  ): Promise<boolean> {
    targetUser.user_role = roles;
    try {
      await this.userService.updateUser(targetUser).toPromise();
      return false;
    } catch (e) {
      return true;
    }
  }

  /*
   * Validate the roles of the source user by first getting all roles
   * and then PUTting to the same user, if there is no error, all roles
   * are valid.
   */
  public validate(sourceUser: UserDetailsChecked): Observable<ValidationInfo> {
    return this.userService.getUserDetails(sourceUser.primary_id).pipe(
      mergeMap((sourceUserDetails): Observable<ValidationInfo> => {
        let validationInfo: ValidationInfo = new ValidationInfo();
        try {
          return this.userService.updateUser(sourceUserDetails).pipe(
            mergeMap(() => {
              validationInfo.valid = true;
              return of(validationInfo);
            }),
            catchError((error) => {
              validationInfo.valid = false;
              validationInfo.message = error.message;
              validationInfo.rawError = error;
              console.error('Role validation error', error);
              return of(validationInfo);
            })
          );
        } catch (error) {
          validationInfo.valid = false;
          validationInfo.message = error.message;
          validationInfo.rawError = error;
          return of(validationInfo);
        }
      })
    );
  }

  public normalizeRolesList(roles: UserRole[]): UserRole[] {
    roles.map((role) => {
      role.parameter = role.parameter.sort((param1, param2) => {
        const type1 = param1.type.value;
        const type2 = param2.type.value;
        const value1 = param1.value?.desc || '';
        const value2 = param2.value?.desc || '';
        return (type1 + value1).localeCompare(type2 + value2);
      });
      role.parameter.map((param) => {
        param.value.desc = String(param.value?.value);
      });
    });
    return roles.sort((a, b) =>
      a.role_type.desc.localeCompare(b.role_type.desc)
    );
  }
}

type RoleState = {
  valid: UserRole[];
  invalid: UserRole[];
};
