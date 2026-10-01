import {
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
export class UpdateProductDto {
  @IsOptional()
  @IsString({ message: 'O nome deve ser um texto' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'O SKU deve ser um texto' })
  sku?: string;

  @IsOptional()
  @IsString({ message: 'A categoria deve ser um texto' })
  category?: string;

  @IsOptional()
  @IsNumber({}, { message: 'O preço deve ser um número' })
  @IsPositive({ message: 'O preço deve ser maior que zero' })
  price?: number;

  @IsOptional()
  @IsNumber({}, { message: 'O estoque mínimo deve ser um número' })
  @Min(0, { message: 'O estoque mínimo não pode ser negativo' })
  minStock?: number;
}
