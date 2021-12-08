import { ResponseValue } from './responseValue.type'
import { UserRole } from './usrRole.type'

export type UserDetails = {
	primary_id: string
	first_name: string
	last_name: string
	full_name: string

	recordType: ResponseValue
	user_group: ResponseValue
	user_role: UserRole[]
}
