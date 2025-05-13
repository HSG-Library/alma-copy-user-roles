import {
  Component,
  Output,
  EventEmitter,
  Input,
  OnInit,
  OnDestroy,
  DestroyRef,
} from '@angular/core';
import { AlertService } from '@exlibris/exl-cloudapp-angular-lib';
import { TranslateService } from '@ngx-translate/core';
import {
  catchError,
  EMPTY,
  finalize,
  map,
  Observable,
  Subscription,
  tap,
} from 'rxjs';
import { AppConfig } from '../../app.config';
import { UserService } from '../../services/user.service';
import { UserListResponse } from '../../types/userListResponse.type';
import { UserDetailsChecked } from '../../types/userDetailsChecked';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-find-user',
  templateUrl: './find-user.component.html',
})
export class FindUserComponent implements OnInit, OnDestroy {
  public loading: boolean = false;
  public searchTerm: string = '';
  public resultEntities: UserDetailsChecked[] = [];
  public resultCount: number = -1;
  public userOptions: UserDetailsChecked[] = [];
  public pageSize: number = AppConfig.pageSize;

  @Input()
  public resetEventObservable$!: Observable<void>;
  public resetEventSubscription!: Subscription;

  @Output()
  public selectedUserOutput = new EventEmitter<UserDetailsChecked>();

  public constructor(
    private userService: UserService,
    private translate: TranslateService,
    private alert: AlertService,
    private destroyRef: DestroyRef
  ) {}

  public ngOnInit(): void {
    this.resetEventSubscription = this.resetEventObservable$?.subscribe(() =>
      this.reset()
    );
  }

  public ngOnDestroy(): void {
    this.resetEventSubscription?.unsubscribe();
  }

  public findUser(): void {
    if (this.searchTerm && this.searchTerm.length >= 2) {
      this.loading = true;
      this.userService
        .findUser(this.searchTerm.trim())
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          tap((userResponse) => {
            this.resultCount = userResponse.total_record_count;
            this.resultEntities = userResponse.user;
            if (userResponse.total_record_count <= 0) {
              return;
            }
            this.enrichResult(userResponse);
          }),
          catchError((error) => {
            let alertMsg = this.translate.instant(
              'findUser.error.findUserAlert',
              {
                status: error.status,
              }
            );
            this.alert.error(alertMsg, { autoClose: true });
            console.error('Error in findUser()', error);
            this.loading = false;
            return EMPTY;
          })
        )
        .subscribe();
    }
  }

  public selectUser(event: UserDetailsChecked[]) {
    let user: UserDetailsChecked = event[0];
    this.userOptions = [];
    this.selectedUserOutput.emit(user);
  }

  private enrichResult(userResponse: UserListResponse) {
    userResponse.user.forEach((user) => {
      this.userService
        .getUserDetails(user.primary_id)
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          map(
            (userDetails) =>
              (this.resultEntities = this.resultEntities.map((u) => {
                if (u.primary_id === userDetails.primary_id) {
                  u.user_group = userDetails.user_group;
                  u.user_role = userDetails.user_role;
                }
                return u;
              }))
          ),
          catchError((error) => {
            let alertMsg = this.translate.instant(
              'findUser.error.userDetailAlert',
              {
                primaryId: user.primary_id,
                status: error.status,
              }
            );
            this.alert.error(alertMsg, { autoClose: true });
            console.error('Error in findUser()', error);
            return EMPTY;
          }),
          finalize(() => (this.loading = false))
        )
        .subscribe();
    });
  }

  private reset() {
    this.searchTerm = '';
    this.resultCount = -1;
    this.resultEntities = [];
  }
}
