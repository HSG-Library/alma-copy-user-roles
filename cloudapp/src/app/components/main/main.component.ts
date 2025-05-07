import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  AlertService,
  CloudAppEventsService,
  Entity,
  EntityType,
} from '@exlibris/exl-cloudapp-angular-lib';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ValidationInfo } from '../../models/validationInfo';
import { UserService } from '../../services/user.service';
import { UserAccessService } from '../../services/userAccess.service';
import { UserRolesService } from '../../services/userRoles.service';
import { CompareResult } from '../../types/compareResult.type';
import { CopyResult } from '../../types/copyResult.type';
import { UserDetailsChecked } from '../../types/userDetailsChecked';
import { UserRole } from '../../types/userRole.type';
import { ValidationDialog } from '../validation-dialog/validation-dialog.component';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent implements OnInit, OnDestroy {
  public loading: boolean = false;
  public checkingUser: boolean = false;
  public isUserAllowed: boolean = false;

  public permissionError: string;

  public currentUserEntity: Entity;
  public replaceExistingRoles: boolean = false;
  public sourceUserOptions: UserDetailsChecked[];
  public sourceUser: UserDetailsChecked;

  public copyResult: CopyResult;
  public compareResult: CompareResult;
  public resultsExpanded: boolean;

  public resetEventSubject = new Subject<void>();

  private entities$: Observable<Entity[]> = this.eventsService.entities$;
  private selectedRoles: UserRole[];

  public constructor(
    private dialog: MatDialog,
    private eventsService: CloudAppEventsService,
    private alert: AlertService,
    private translate: TranslateService,
    private userService: UserService,
    private userRoleService: UserRolesService,
    private userAccessService: UserAccessService
  ) {}

  public ngOnInit(): void {
    this.entities$.subscribe((entities) =>
      this.selectUserFromCurrentPage(entities)
    );
    this.checkingUser = true;
    this.loading = true;
    this.userAccessService.isUserAllowed().subscribe(
      (allowed) => {
        this.isUserAllowed = allowed;
        this.checkingUser = false;
        this.loading = false;
      },
      (error) => {
        let alertMsg = this.translate.instant('main.error.permissionCheck', {
          status: error.status,
        });
        this.alert.error(alertMsg, { autoClose: true });
        console.error('Error while checking permissions in ngOnInit()', error);
        this.permissionError = `Permission denied: ${error.message}`;
        this.loading = false;
      }
    );
  }

  public ngOnDestroy(): void {}

  public selectUserFromCurrentPage(entities: Entity[]): void {
    if (entities.length == 1) {
      let singleEntity = entities[0];
      if (singleEntity.type === EntityType.USER) {
        this.currentUserEntity = singleEntity;
        return;
      }
    }
    this.currentUserEntity = null;
  }

  public selectSourceUser(user: UserDetailsChecked): void {
    this.loading = true;
    this.userRoleService.validate(user).subscribe(
      (validationInfo: ValidationInfo) => {
        user.rolesChecked = true;
        if (validationInfo.valid) {
          this.sourceUser = user;
          user.rolesValid = true;
        } else {
          this.sourceUser = null;
          user.rolesValid = false;
          let dialogRef = this.dialog.open(ValidationDialog, {
            autoFocus: false,
            data: validationInfo,
          });
          dialogRef.afterClosed().subscribe((data) => {
            if (data) {
              this.sourceUser = user;
            }
          });
        }
      },
      (error) => {
        let alertMsg = this.translate.instant('main.error.validationAlert', {
          status: error.status,
        });
        this.alert.error(alertMsg, { autoClose: true });
        console.error('Error while validating in selectSourceUser()', error);
      },
      () => {
        this.loading = false;
      }
    );
  }

  public copyUserRoles(): void {
    this.loading = true;
    this.resetResults();
    this.userService
      .getUserDetailsFromEntity(this.currentUserEntity)
      .subscribe((userDetails) => {
        this.userRoleService
          .copy(
            this.sourceUser,
            this.selectedRoles,
            userDetails,
            this.replaceExistingRoles
          )
          .subscribe(
            (copyResult: CopyResult) => {
              console.log(copyResult);
              this.copyResult = copyResult;
              this.loading = false;
              this.eventsService
                .refreshPage()
                .subscribe(() =>
                  this.alert.success(
                    this.translate.instant('main.successAlert'),
                    { autoClose: true, delay: 5000 }
                  )
                );
            },
            (error) => {
              this.loading = false;
              let alertMsg = this.translate.instant(
                'main.error.copyUserRolesAlert',
                {
                  status: error.status,
                }
              );
              this.alert.error(alertMsg, { autoClose: true });
              console.error('Error in copyUserRoles()', error);
            }
          );
      });
  }

  public compareUserRoles(): void {
    this.loading = true;
    this.resetResults();
    this.userService
      .getUserDetailsFromEntity(this.currentUserEntity)
      .pipe(
        switchMap((userDetails) => {
          return this.userRoleService.compare(this.sourceUser, userDetails);
        })
      )
      .subscribe((compareResult: CompareResult) => {
        this.compareResult = compareResult;
        this.loading = false;
      });
  }

  public selectSourceRoles(userRoles: UserRole[]): void {
    this.selectedRoles = userRoles;
  }

  public resetResults(): void {
    this.copyResult = null;
    this.compareResult = null;
    this.resultsExpanded = false;
  }

  public reset(): void {
    this.sourceUser = null;
    this.resetEventSubject.next();
    this.resetResults();
  }
}
