import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UserRoleAreaService } from '../../services/userRoleAreaService';
import { UserDetailsChecked } from '../../types/userDetailsChecked';
import { UserRole } from '../../types/userRole.type';
import { UserRolesService } from '../../services/userRoles.service';

@Component({
  selector: 'app-role-select',
  templateUrl: './roleSelect.component.html',
  styleUrls: ['./roleSelect.component.scss'],
})
export class RoleSelectComponent {
  private _user: UserDetailsChecked;

  @Input()
  set user(value: UserDetailsChecked) {
    //set newly selected user
    this._user = value;
    // reset selected roles and mapped roles
    this.selectedRoles = new Set();
    this.mappedRoles = new Map<string, UserRole[]>();
    // map roles
    this.mapRoles();
  }

  get user(): UserDetailsChecked {
    return this._user;
  }

  areas: string[];
  mappedRoles: Map<string, UserRole[]>;

  @Output()
  rolesSelectedOutput: EventEmitter<UserRole[]> = new EventEmitter<
    UserRole[]
  >();

  selectedRoles: Set<UserRole> = new Set();

  public constructor(
    private userRoleAreaService: UserRoleAreaService,
    private userRoleService: UserRolesService
  ) {}

  public mapRoles(): void {
    if (!this._user) {
      return;
    }
    this.userRoleAreaService
      .getRoleTypeDefinitionMapping()
      .subscribe((mapping) => {
        const roles = this.userRoleService.normalizeRolesList(
          this._user.user_role
        );
        roles.forEach((role) => {
          const area = mapping.get(role.role_type.value);
          if (area) {
            if (this.mappedRoles.has(area)) {
              this.mappedRoles.get(area).push(role);
            } else {
              this.mappedRoles.set(area, [role]);
            }
            this.selectedRoles.add(role);
          }
        });
        this.areas = Array.from(this.mappedRoles.keys()).sort();
        this.emitSelectedRoles();
      });
  }

  public areaCompleteChecked(area: string): boolean {
    const roles = this.mappedRoles.get(area);
    if (roles) {
      return roles.every((role) => this.roleChecked(role));
    }
    return false;
  }

  public someChecked(area: string): boolean {
    const roles = this.mappedRoles.get(area);
    if (roles) {
      return (
        roles.some((role) => this.roleChecked(role)) &&
        !roles.every((role) => this.roleChecked(role))
      );
    }
    return false;
  }

  public checkArea(area: string): void {
    if (this.areaCompleteChecked(area)) {
      this.mappedRoles.get(area).forEach((role) => {
        if (this.selectedRoles.has(role)) {
          this.selectedRoles.delete(role);
        }
      });
    } else {
      this.mappedRoles.get(area).forEach((role) => {
        this.selectedRoles.add(role);
      });
    }
    this.emitSelectedRoles();
  }

  public roleChecked(role: UserRole): boolean {
    return this.selectedRoles.has(role);
  }

  public selectRole(role: UserRole): void {
    if (this.roleChecked(role)) {
      if (this.selectedRoles.has(role)) {
        this.selectedRoles.delete(role);
      }
    } else {
      this.selectedRoles.add(role);
    }
    this.emitSelectedRoles();
  }

  public anyChecked(): boolean {
    return this.selectedRoles.size > 0;
  }

  public allChecked(): boolean {
    return this.selectedRoles.size === this._user.user_role.length;
  }

  public selectAll(event: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.mappedRoles.forEach((roles) => {
      roles.forEach((role) => {
        this.selectedRoles.add(role);
      });
    });
    this.emitSelectedRoles();
  }

  public deselectAll(event: Event): void {
    event.stopPropagation();
    this.selectedRoles = new Set();
    this.emitSelectedRoles();
  }

  private emitSelectedRoles(): void {
    this.rolesSelectedOutput.emit(Array.from(this.selectedRoles));
  }
}
