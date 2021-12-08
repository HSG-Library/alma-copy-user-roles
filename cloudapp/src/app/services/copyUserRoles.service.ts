import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { UserDetails } from '../types/userDetails.type'
import { UserSummaryEnriched } from '../types/userSummaryEnriched.type'
import { UserService } from './user.service'

@Injectable({
	providedIn: 'root'
})
export class CopyUserRolesService {

	constructor(private userService: UserService) { }

	copy(sourceUser: UserSummaryEnriched, targetUser: UserDetails, replaceExistingRoles: boolean): Observable<UserDetails> {
		if (replaceExistingRoles) {
			// replace existing roles by overwriting the target roles with the source roles
			targetUser.user_role = sourceUser.user_role
		} else {
			// don't replace by combining existing roles with the new roles
			targetUser.user_role = [...targetUser.user_role, ...sourceUser.user_role]
		}
		return this.userService.updateUser(targetUser)
	}
}
