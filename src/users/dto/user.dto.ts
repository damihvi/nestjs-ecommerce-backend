export interface CreateUserDto {
  email: string;
  name: string;
  password: string;
  phone?: string;
  address?: string;
}

export interface UpdateUserDto {
  name?: string;
  phone?: string;
  address?: string;
  isActive?: boolean;
}

export interface LoginDto {
  email: string;
  password: string;
}
