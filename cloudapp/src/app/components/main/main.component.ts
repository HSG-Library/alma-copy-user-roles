import { Component, DestroyRef, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  AlertService,
  CloudAppEventsService,
  Entity,
  EntityType,
} from '@exlibris/exl-cloudapp-angular-lib';
import { TranslateService } from '@ngx-translate/core';
import { EMPTY, Observable, Subject } from 'rxjs';
import { catchError, finalize, switchMap, tap } from 'rxjs/operators';
import { ValidationInfo } from '../../models/validationInfo';
import { UserService } from '../../services/user.service';
import { UserAccessService } from '../../services/userAccess.service';
import { UserRolesService } from '../../services/userRoles.service';
import { CompareResult } from '../../types/compareResult.type';
import { CopyResult } from '../../types/copyResult.type';
import { UserDetailsChecked } from '../../types/userDetailsChecked';
import { UserRole } from '../../types/userRole.type';
import { ValidationDialog } from '../validation-dialog/validation-dialog.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent implements OnInit {
  public loading: boolean = false;
  public checkingUser: boolean = false;
  public isUserAllowed: boolean = false;

  public permissionError?: string;

  public currentUserEntity: Entity | null = null;
  public replaceExistingRoles: boolean = false;
  public sourceUserOptions: UserDetailsChecked[] = [];
  public sourceUser: UserDetailsChecked | null = null;

  public copyResult!: CopyResult | null;
  public compareResult!: CompareResult | null;
  public resultsExpanded: boolean = false;

  public resetEventSubject = new Subject<void>();

  private selectedRoles: UserRole[] = [];

  public constructor(
    private dialog: MatDialog,
    private eventsService: CloudAppEventsService,
    private alert: AlertService,
    private translate: TranslateService,
    private userService: UserService,
    private userRoleService: UserRolesService,
    private userAccessService: UserAccessService,
    private destroyRef: DestroyRef
  ) {}

  public ngOnInit(): void {
    this.eventsService.entities$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap((entities) => this.selectUserFromCurrentPage(entities))
      )
      .subscribe();
    this.checkingUser = true;
    this.loading = true;
    this.userAccessService
      .isUserAllowed()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap((allowed) => {
          this.isUserAllowed = allowed;
          this.checkingUser = false;
        }),
        catchError((error) => {
          let alertMsg = this.translate.instant('main.error.permissionCheck', {
            status: error.status,
          });
          this.alert.error(alertMsg, { autoClose: true });
          console.error(
            'Error while checking permissions in ngOnInit()',
            error
          );
          this.permissionError = `Permission denied: ${error.message}`;
          return EMPTY;
        }),
        finalize(() => (this.loading = false))
      )
      .subscribe();
  }

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
    this.userRoleService
      .validate(user)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap((validationInfo: ValidationInfo) => {
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
        }),
        catchError((error) => {
          let alertMsg = this.translate.instant('main.error.validationAlert', {
            status: error.status,
          });
          this.alert.error(alertMsg, { autoClose: true });
          console.error('Error while validating in selectSourceUser()', error);
          return EMPTY;
        }),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe();
  }

  public copyUserRoles(): void {
    this.loading = true;
    this.resetResults();
    this.userService
      .getUserDetailsFromEntity(this.currentUserEntity!)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((userDetails) =>
          this.userRoleService.copy(
            this.sourceUser!,
            this.selectedRoles,
            userDetails,
            this.replaceExistingRoles
          )
        ),
        tap((copyResult: CopyResult) => {
          this.copyResult = copyResult;
          this.eventsService.refreshPage().subscribe(() =>
            this.alert.success(this.translate.instant('main.successAlert'), {
              autoClose: true,
              delay: 5000,
            })
          );
        }),
        catchError((error) => {
          let alertMsg = this.translate.instant(
            'main.error.copyUserRolesAlert',
            {
              status: error.status,
            }
          );
          this.alert.error(alertMsg, { autoClose: true });
          console.error('Error in copyUserRoles()', error);
          return EMPTY;
        }),
        finalize(() => (this.loading = false))
      )
      .subscribe();
  }

  public compareUserRoles(): void {
    this.loading = true;
    this.resetResults();
    this.userService
      .getUserDetailsFromEntity(this.currentUserEntity!)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((userDetails) => {
          return this.userRoleService.compare(this.sourceUser!, userDetails);
        }),
        tap((compareResult: CompareResult) => {
          this.compareResult = compareResult;
          this.loading = false;
        })
      )
      .subscribe();
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
