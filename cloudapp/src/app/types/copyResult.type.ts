import { UserDetails } from './userDetails.type';
import { UserRole } from './userRole.type';

export type CopyResult = {
  rolesSelectedToCopy: UserRole[];
  validRoles: UserRole[];
  invalidRoles: UserRole[];
  skippedDuplicateRoles: UserRole[];
  copiedRoles: UserRole[];
  targetUser: UserDetails;
};
