import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class FindProductsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'A página deve ser um número inteiro' })
  @Min(1, { message: 'A página mínima é 1' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'O limite deve ser um número inteiro' })
  @Min(1, { message: 'O limite mínimo é 1' })
  @Max(100, { message: 'O limite máximo por página é 100' })
  limit?: number = 10;

  @IsOptional()
  @IsString({ message: 'A busca deve ser um texto' })
  search?: string;

  @IsOptional()
  @IsString({ message: 'A categoria deve ser um texto' })
  category?: string;
}
