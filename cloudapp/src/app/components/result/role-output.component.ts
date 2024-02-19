import { Component, Input } from '@angular/core'
import { UserRole } from '../../types/userRole.type'

@Component({
	selector: 'app-role-output',
	templateUrl: './role-output.component.html',
	styleUrls: ['./role-output.component.scss'],
})
export class RoleOutputComponet {
	@Input()
	userRole: UserRole
}
