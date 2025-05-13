import { UserRole } from './userRole.type';

export type UserRoleWithAvailability = UserRole & {
  disabled: boolean;
};
