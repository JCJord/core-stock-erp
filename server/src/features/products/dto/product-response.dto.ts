export class ProductResponseDto {
  id!: string;
  name!: string;
  sku!: string;
  category!: string;
  price!: number;
  currentStock!: number;
  minStock!: number;
  isCritical!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}
