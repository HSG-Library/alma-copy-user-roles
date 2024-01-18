import { UserDetails } from './userDetails.type'
import { UserRole } from './userRole.type'

export type CopyResult = {
	validRoles: UserRole[]
	invalidRoles: UserRole[]
	targetUser: UserDetails
}
