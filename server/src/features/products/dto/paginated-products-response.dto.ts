import { ProductResponseDto } from './product-response.dto';

export class PaginationMetaDto {
  totalItems!: number;
  itemCount!: number;
  itemsPerPage!: number;
  totalPages!: number;
  currentPage!: number;
}

export class PaginatedProductsResponseDto {
  data!: ProductResponseDto[];
  meta!: PaginationMetaDto;
}
