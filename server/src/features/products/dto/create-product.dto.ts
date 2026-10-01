import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsPositive,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty({ message: 'O nome do produto é obrigatório' })
  @IsString({ message: 'O nome deve ser um texto' })
  name!: string;

  @IsNotEmpty({ message: 'O SKU é obrigatório' })
  @IsString({ message: 'O SKU deve ser um texto' })
  sku!: string;

  @IsNotEmpty({ message: 'A categoria é obrigatória' })
  @IsString({ message: 'A categoria deve ser um texto' })
  category!: string;

  @IsNotEmpty({ message: 'O preço é obrigatório' })
  @IsNumber({}, { message: 'O preço deve ser um número' })
  @IsPositive({ message: 'O preço deve ser maior que zero' })
  price!: number;

  @IsOptional()
  @IsNumber({}, { message: 'O estoque inicial deve ser um número' })
  @Min(0, { message: 'O estoque não pode ser negativo' })
  currentStock?: number;

  @IsOptional()
  @IsNumber({}, { message: 'O estoque mínimo deve ser um número' })
  @Min(0, { message: 'O estoque mínimo não pode ser negativo' })
  minStock?: number;
}
