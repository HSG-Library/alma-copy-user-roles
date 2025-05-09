import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  AlertService,
  CloudAppConfigService,
} from '@exlibris/exl-cloudapp-angular-lib';
import { TranslateService } from '@ngx-translate/core';
import { Configuration } from '../../types/configuration.type';
import { UserDetailsChecked } from '../../types/userDetailsChecked';
import { finalize, tap } from 'rxjs/operators';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss'],
})
export class ConfigurationComponent implements OnInit {
  public loading: boolean;
  public saving: boolean;
  public dirty: boolean;
  public config: Configuration;

  public allowedUsers: Set<UserDetailsChecked> = new Set<UserDetailsChecked>();
  public allowedUsersSelection: UserDetailsChecked[] = [];
  public checkScope: boolean = false;
  public allowedRolesSelection: number[] = [0];

  public constructor(
    private configService: CloudAppConfigService,
    private router: Router,
    private translate: TranslateService,
    private alert: AlertService
  ) {}

  public ngOnInit(): void {
    this.loading = true;
    this.configService
      .get()
      .pipe(
        tap((config) => {
          this.config = config;
          this.allowedUsers = new Set<UserDetailsChecked>(
            this.config.allowedUsers
          );
          if (this.config.allowedRoles?.length) {
            this.allowedRolesSelection = this.config.allowedRoles;
          }
          if (this.config.checkScope) {
            this.checkScope = this.config.checkScope;
          }
        }),
        finalize(() => (this.loading = false))
      )
      .subscribe();
  }

  public addAllowedUser(user: UserDetailsChecked): void {
    if (this.isAlreadyAllowed(user)) {
      let alertMsg = this.translate.instant('config.userAlreadyInList', {
        user: `${user.first_name} ${user.last_name}`,
      });
      this.alert.info(alertMsg);
      return;
    }
    this.allowedUsers.add(user);
    this.dirty = true;
  }

  public save(): void {
    this.saving = true;
    if (this.allowedRolesSelection.length == 0) {
      this.allowedRolesSelection = [0];
    }
    let config: Configuration = {
      allowedRoles: this.allowedRolesSelection,
      allowedUsers: Array.from(this.allowedUsers),
      checkScope: this.checkScope,
    };
    this.configService.set(config).subscribe(() => {
      this.saving = false;
      this.dirty = false;
    });
  }

  public back(): void {
    if (!this.dirty) {
      this.router.navigate(['/']);
      return;
    }
    let confirmMsg = this.translate.instant('config.confirmUnsaved');
    if (confirm(confirmMsg)) {
      this.router.navigate(['/']);
    }
  }

  public selectAllowedUsers($event: UserDetailsChecked[]): void {
    this.allowedUsersSelection = $event;
  }

  public selectAllowedRole($event: number[]): void {
    this.dirty = true;
  }

  public removeAllowedUsers(): void {
    this.allowedUsersSelection.forEach((user) =>
      this.allowedUsers.delete(user)
    );
    this.deselectAll();
    this.dirty = true;
  }

  public deselectAll(): void {
    this.allowedUsersSelection = [];
  }

  public removeConfig(): void {
    let confirmMsg = this.translate.instant('config.confirmRemoveConfig');
    if (confirm(confirmMsg)) {
      this.loading = true;
      this.configService.remove().subscribe(() => {
        this.loading = false;
        this.dirty = false;
        this.back();
      });
    }
  }

  public setCheckScope($event: boolean): void {
    this.checkScope = $event;
    this.dirty = true;
  }

  private isAlreadyAllowed(user: UserDetailsChecked): boolean {
    return Array.from(this.allowedUsers).some(
      (userInList) => userInList.primary_id == user.primary_id
    );
  }
}
