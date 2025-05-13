import { DestroyRef, Injectable } from '@angular/core';
import {
  CloudAppConfigService,
  CloudAppEventsService,
  CloudAppRestService,
  HttpMethod,
  Request,
} from '@exlibris/exl-cloudapp-angular-lib';
import { Observable, of } from 'rxjs';
import { flatMap, map, mergeMap, shareReplay, switchMap } from 'rxjs/operators';
import { Configuration } from '../types/configuration.type';
import { UserDetails } from '../types/userDetails.type';
import { UserService } from './user.service';
import { AppConfig } from '../app.config';
import { LibraryListResponse } from '../types/libraryListResponse.type';
import { Library } from '../types/library.type';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { merge } from 'lodash';

@Injectable({
  providedIn: 'root',
})
export class RoleScopeService {
  private libraryList: Observable<LibraryListResponse> | null = null;

  public constructor(
    private eventsService: CloudAppEventsService,
    private configService: CloudAppConfigService,
    private restService: CloudAppRestService,
    private userService: UserService,
    private destroyRef: DestroyRef
  ) {}

  /**
   * Checks if role scope should be checked based on the configuration and if the user has the required role.
   *
   * The following conditions are checked:
   * - the configuration has the `checkScope` property set to true
   * - the user does not have the General Administrator (26) role
   * - the user has not the User Administrator (50) role
   * - the user has the User Manager (21) role and the role is scoped to a library
   */
  public shouldCheckRoleScope(): Observable<boolean> {
    return this.configService.get().pipe(
      takeUntilDestroyed(this.destroyRef),
      switchMap((config: Configuration) => {
        if (config.checkScope) {
          return this.checkForRoleCombination();
        }
        return of(false);
      })
    );
  }

  public getAllowedScopes(): Observable<string[]> {
    return this.eventsService.getInitData().pipe(
      takeUntilDestroyed(this.destroyRef),
      map((initData) => initData.user.primaryId),
      mergeMap((primaryUserId) =>
        this.userService.getUserDetails(primaryUserId)
      ),
      map((userDetails: UserDetails) =>
        userDetails.user_role
          .filter((role) => role.role_type.value === '21')
          .map((role) => role.scope.value)
      )
    );
  }

  /**
   * Checks if the user has a role that is not allowed to be combined with other roles.
   *
   * The following conditions are checked:
   * - the user has the General Administrator role (26)
   * - the user has the User Administrator (50) role
   * - the user has the User Manager (21) role and the role is scoped to a library
   */
  private checkForRoleCombination(): Observable<boolean> {
    return this.eventsService.getInitData().pipe(
      takeUntilDestroyed(this.destroyRef),
      map((initData) => initData.user.primaryId),
      mergeMap((primaryUserId) =>
        this.userService.getUserDetails(primaryUserId)
      ),
      switchMap((userDetails: UserDetails) => {
        const hasGeneralAdministratorRole = userDetails.user_role.some(
          (role) => role.role_type.value === '26'
        );
        if (hasGeneralAdministratorRole) {
          return of(false);
        }
        const hasUserAdministratorRole = userDetails.user_role.some(
          (role) => role.role_type.value === '50'
        );
        if (hasUserAdministratorRole) {
          return of(false);
        }
        const hasUserManagerRole = userDetails.user_role.some(
          (role) => role.role_type.value === '21'
        );
        if (!hasUserManagerRole) {
          return of(false);
        }

        const userManagerScopes: string[] = userDetails.user_role
          .filter((role) => role.role_type.value === '21')
          .map((role) => role.scope.value);

        return this.isScopedToLibrary(userManagerScopes);
      })
    );
  }

  private isScopedToLibrary(scopes: string[]): Observable<boolean> {
    return this.getLibraryList().pipe(
      takeUntilDestroyed(this.destroyRef),
      map((libraryList: LibraryListResponse) => libraryList.library),
      map((libraries: Library[]) =>
        libraries.map((library: Library) => library.code)
      ),
      map((libraryCodes: string[]) =>
        libraryCodes.some((library: string) => scopes.includes(library))
      )
    );
  }

  private getLibraryList(): Observable<LibraryListResponse> {
    if (!this.libraryList) {
      const request: Request = {
        url: '/conf/libraries',
        method: HttpMethod.GET,
        headers: AppConfig.httpHeader,
      };
      this.libraryList = this.restService
        .call(request)
        .pipe(takeUntilDestroyed(this.destroyRef), shareReplay(1));
    }
    return this.libraryList;
  }
}
