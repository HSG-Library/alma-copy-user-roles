import { UserRole } from './usrRole.type'

export type CompareResult = {
	intersection: UserRole[]
	onlyInSoure: UserRole[]
	onlyInTarget: UserRole[]
	sourceDuplicates: UserRole[]
	targetDuplicates: UserRole[]
}
