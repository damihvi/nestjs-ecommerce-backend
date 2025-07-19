export interface CreateUserDto {
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  password: string;
  phone?: string;
  address?: string;
}

export interface UpdateUserDto {
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  isActive?: boolean;
}

export interface LoginDto {
  email: string;
  password: string;
}
