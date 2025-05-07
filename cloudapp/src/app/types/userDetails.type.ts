import { ResponseValue } from './responseValue.type';
import { UserBase } from './userBase';
import { UserRole } from './userRole.type';

export type UserDetails = UserBase & {
  user_group: ResponseValue;
  user_role: UserRole[];
};
