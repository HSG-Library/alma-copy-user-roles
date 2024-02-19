import { UserRoleParameter } from './userRoleParameter.type'
import { ResponseValue } from './responseValue.type'

export type UserRole = {
	status: ResponseValue
	scope: ResponseValue
	role_type: ResponseValue
	parameter: UserRoleParameter[]
}
