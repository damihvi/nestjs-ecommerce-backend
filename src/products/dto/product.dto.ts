export interface CreateProductDto {
  name: string;
  description?: string;
  price: number;
  stock?: number;
  categoryId: string;
  imageUrl?: string;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  categoryId?: string;
  imageUrl?: string;
  isActive?: boolean;
}
