import { UserDetails } from './userDetails.type'
import { UserRole } from './usrRole.type'

export type CopyResult = {
	validRoles: UserRole[]
	invalidRoles: UserRole[]
	targetUser: UserDetails
}
