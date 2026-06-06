import { User } from './user.model';
import { Branch } from './branch.model';

export type UserRole = 'OWNER' | 'ADMIN' | 'EMPLOYEE';

export interface TeamMember {
  id: string;
  user: User;
  role: UserRole;
  assignedBranches: Branch[];
  createdAt: string;
}

export interface InviteUserRequest {
  userEmail: string;
  role: UserRole;
  branchId?: string;
}