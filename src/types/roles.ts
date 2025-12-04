// types/roles.ts
export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user'
}

export type Role = UserRole.ADMIN | UserRole.MANAGER | UserRole.USER;

