export interface CreateOrderDto {
  userId: string;
  items: OrderItemDto[];
  notes?: string;
}

export interface OrderItemDto {
  productId: string;
  quantity: number;
}

export interface UpdateOrderDto {
  status?: string;
  notes?: string;
}
