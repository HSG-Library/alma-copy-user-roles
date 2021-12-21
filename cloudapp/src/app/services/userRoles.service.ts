import { Injectable } from '@angular/core'
import { Observable, of } from 'rxjs'
import { catchError, mergeMap } from 'rxjs/operators'
import { ValidationInfo } from '../models/validationInfo'
import { UserDetails } from '../types/userDetails.type'
import { UserSummaryEnriched } from '../types/userSummaryEnriched.type'
import { UserService } from './user.service'

@Injectable({
	providedIn: 'root'
})
export class UserRolesService {

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

	validate(sourceUser: UserSummaryEnriched): Observable<ValidationInfo> {
		return this.userService.getUserDetails(sourceUser.primary_id)
			.pipe(
				mergeMap(
					(sourceUserDetails): Observable<ValidationInfo> => {
						let validationInfo: ValidationInfo = new ValidationInfo()
						try {
							return this.userService.updateUser(sourceUserDetails)
								.pipe(
									mergeMap(() => {
										validationInfo.valid = true; return of(validationInfo)
									}),
									catchError(error => {
										validationInfo.valid = false
										validationInfo.message = error.message
										validationInfo.rawError = error
										console.error('Role validation error', error)
										return of(validationInfo)
									}),
								)
						} catch (error) {
							validationInfo.valid = false
							validationInfo.message = error.message
							validationInfo.rawError = error
							return of(validationInfo)
						}
					}

				)
			)
	}

}
