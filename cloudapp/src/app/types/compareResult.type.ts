import { UserRole } from './userRole.type';

export type CompareResult = {
  intersection: UserRole[];
  onlyInSource: UserRole[];
  onlyInTarget: UserRole[];
  sourceDuplicates: UserRole[];
  targetDuplicates: UserRole[];
};
