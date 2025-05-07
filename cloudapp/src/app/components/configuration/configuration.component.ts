import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  AlertService,
  CloudAppConfigService,
} from '@exlibris/exl-cloudapp-angular-lib';
import { TranslateService } from '@ngx-translate/core';
import { Configuration } from '../../types/configuration.type';
import { UserDetailsChecked } from '../../types/userDetailsChecked';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss'],
})
export class ConfigurationComponent implements OnInit {
  loading: boolean;
  saving: boolean;
  dirty: boolean;
  config: Configuration;

  allowedUsers: Set<UserDetailsChecked> = new Set<UserDetailsChecked>();
  allowedUsersSelection: UserDetailsChecked[] = [];

  allowedRolesSelection: number[] = [0];

  constructor(
    private configService: CloudAppConfigService,
    private router: Router,
    private translate: TranslateService,
    private alert: AlertService
  ) {}

  ngOnInit(): void {
    this.configService.get().subscribe((config) => {
      this.config = config;
      this.allowedUsers = new Set<UserDetailsChecked>(this.config.allowedUsers);
      if (this.config.allowedRoles?.length > 0) {
        this.allowedRolesSelection = this.config.allowedRoles;
      }
    });
  }

  addAllowedUser(user: UserDetailsChecked): void {
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

  save(): void {
    this.saving = true;
    if (this.allowedRolesSelection.length == 0) {
      this.allowedRolesSelection = [0];
    }
    let config: Configuration = {
      allowedRoles: this.allowedRolesSelection,
      allowedUsers: Array.from(this.allowedUsers),
    };
    this.configService.set(config).subscribe(() => {
      this.saving = false;
      this.dirty = false;
    });
  }

  back(): void {
    if (!this.dirty) {
      this.router.navigate(['/']);
      return;
    }
    let confirmMsg = this.translate.instant('config.confirmUnsaved');
    if (confirm(confirmMsg)) {
      this.router.navigate(['/']);
    }
  }

  selectAllowedUsers($event: UserDetailsChecked[]): void {
    this.allowedUsersSelection = $event;
  }

  selectAllowedRole($event: number[]): void {
    this.dirty = true;
  }

  removeAllowedUsers(): void {
    this.allowedUsersSelection.forEach((user) =>
      this.allowedUsers.delete(user)
    );
    this.deselectAll();
    this.dirty = true;
  }

  deselectAll(): void {
    this.allowedUsersSelection = [];
  }

  removeConfig(): void {
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

  private isAlreadyAllowed(user: UserDetailsChecked): boolean {
    return Array.from(this.allowedUsers).some(
      (userInList) => userInList.primary_id == user.primary_id
    );
  }
}
