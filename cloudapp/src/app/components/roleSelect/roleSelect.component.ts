import { Component, EventEmitter, Input, Output } from '@angular/core'
import { UserRoleAreaService } from '../../services/userRoleAreaService'
import { UserDetailsChecked } from '../../types/userDetailsChecked'
import { UserRole } from '../../types/userRole.type'

@Component({
	selector: 'app-role-select',
	templateUrl: './roleSelect.component.html',
	styleUrls: ['./roleSelect.component.scss'],
})
export class RoleSelectComponent {

	private _user: UserDetailsChecked

	@Input()
	set user(value: UserDetailsChecked) {
		//set newly selected user
		this._user = value
		// reset selected roles and mapped roles
		this.selectedRoles = new Set()
		this.mappedRoles = new Map<string, UserRole[]>()
		// map roles
		this.mapRoles()
	}

	get user(): UserDetailsChecked {
		return this._user
	}

	areas: string[]
	mappedRoles: Map<string, UserRole[]>

	@Output()
	rolesSelectedOutput: EventEmitter<UserRole[]> = new EventEmitter<UserRole[]>()

	private selectedRoles: Set<UserRole> = new Set()

	constructor(
		private userRoleAreaService: UserRoleAreaService,
	) { }

	mapRoles(): void {
		if (!this._user) {
			return
		}
		this.userRoleAreaService.getRoleTypeDefinitionMapping().subscribe(mapping => {
			this._user.user_role.forEach(role => {
				const area = mapping.get(role.role_type.value)
				if (area) {
					if (this.mappedRoles.has(area)) {
						this.mappedRoles.get(area).push(role)
					} else {
						this.mappedRoles.set(area, [role])
					}
					this.selectedRoles.add(role)
				}
			})
			this.areas = Array.from(this.mappedRoles.keys())
			this.emitSelectedRoles()
		})
	}

	areaCompleteCheked(area: string): boolean {
		const roles = this.mappedRoles.get(area)
		if (roles) {
			return roles.every(role => this.roleChecked(role))
		}
		return false
	}

	someChecked(area: string): boolean {
		const roles = this.mappedRoles.get(area)
		if (roles) {
			return roles.some(role => this.roleChecked(role)) && (!roles.every(role => this.roleChecked(role)))
		}
		return false
	}

	checkArea(area: string): void {
		if (this.areaCompleteCheked(area)) {
			this.mappedRoles.get(area).forEach(role => {
				if (this.selectedRoles.has(role)) {
					this.selectedRoles.delete(role)
				}
			})
		} else {
			this.mappedRoles.get(area).forEach(role => {
				this.selectedRoles.add(role)
			})
		}
		this.emitSelectedRoles()
	}

	roleChecked(role: UserRole): boolean {
		return this.selectedRoles.has(role)
	}

	selectRole(role: UserRole): void {
		if (this.roleChecked(role)) {
			if (this.selectedRoles.has(role)) {
				this.selectedRoles.delete(role)
			}
		} else {
			this.selectedRoles.add(role)
		}
		this.emitSelectedRoles()
	}

	anyChecked(): boolean {
		return this.selectedRoles.size > 0
	}

	allChecked(): boolean {
		return this.selectedRoles.size === this._user.user_role.length
	}

	selectAll(event: Event): void {
		if (event) {
			event.stopPropagation()
		}
		this.mappedRoles.forEach(roles => {
			roles.forEach(role => {
				this.selectedRoles.add(role)
			})
		})
		this.emitSelectedRoles()
	}

	deselectAll(event: Event): void {
		event.stopPropagation()
		this.selectedRoles = new Set()
		this.emitSelectedRoles()
	}

	private emitSelectedRoles(): void {
		this.rolesSelectedOutput.emit(Array.from(this.selectedRoles))
	}
}
