import {
  Injectable,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { FindProductsQueryDto } from './dto/find-products-query.dto';
import { PaginatedProductsResponseDto } from './dto/paginated-products-response.dto';
import { DashboardMetricsResponseDto } from './dto/dashboard-metrics-response.dto';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProductDto): Promise<ProductResponseDto> {
    try {
      const skuNormalized = dto.sku.trim().toUpperCase();

      const existingProduct = await this.prisma.product.findUnique({
        where: { sku: skuNormalized },
      });

      if (existingProduct) {
        throw new ConflictException(
          'Já existe um produto cadastrado com este SKU',
        );
      }

      const product = await this.prisma.product.create({
        data: {
          name: dto.name.trim(),
          sku: skuNormalized,
          category: dto.category.trim(),
          price: dto.price,
          currentStock: dto.currentStock ?? 0,
          minStock: dto.minStock ?? 0,
        },
      });

      return {
        ...product,
        isCritical: product.currentStock <= product.minStock,
      };
    } catch (error: unknown) {
      if (error instanceof HttpException) throw error;
      this.logger.error(
        'Erro ao criar produto:',
        error instanceof Error ? error.stack : error,
      );
      throw new InternalServerErrorException(
        'Não foi possível cadastrar o produto',
      );
    }
  }

  async findAll(
    query: FindProductsQueryDto,
  ): Promise<PaginatedProductsResponseDto> {
    try {
      const page = query.page && query.page > 0 ? query.page : 1;
      const limit = query.limit && query.limit > 0 ? query.limit : 10;
      const skip = (page - 1) * limit;

      const where: Prisma.ProductWhereInput = {};

      if (query.category) {
        where.category = { equals: query.category.trim(), mode: 'insensitive' };
      }

      if (query.search) {
        const term = query.search.trim();
        where.OR = [
          { name: { contains: term, mode: 'insensitive' } },
          { sku: { contains: term, mode: 'insensitive' } },
        ];
      }

      const [totalItems, products] = await this.prisma.$transaction([
        this.prisma.product.count({ where }),
        this.prisma.product.findMany({
          where,
          skip,
          take: limit,
          orderBy: { name: 'asc' },
        }),
      ]);

      const data = products.map((prod) => ({
        ...prod,
        isCritical: prod.currentStock <= prod.minStock,
      }));

      return {
        data,
        meta: {
          totalItems,
          itemCount: data.length,
          itemsPerPage: limit,
          totalPages: Math.ceil(totalItems / limit) || 1,
          currentPage: page,
        },
      };
    } catch (error: unknown) {
      if (error instanceof HttpException) throw error;
      this.logger.error(
        'Erro ao listar produtos:',
        error instanceof Error ? error.stack : error,
      );
      throw new InternalServerErrorException(
        'Não foi possível carregar os produtos',
      );
    }
  }

  async findOne(id: string): Promise<ProductResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    return {
      ...product,
      isCritical: product.currentStock <= product.minStock,
    };
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductResponseDto> {
    try {
      await this.findOne(id);

      if (dto.sku) {
        const skuNormalized = dto.sku.trim().toUpperCase();
        const existingSku = await this.prisma.product.findUnique({
          where: { sku: skuNormalized },
        });

        if (existingSku && existingSku.id !== id) {
          throw new ConflictException(
            'Já existe outro produto cadastrado com este SKU',
          );
        }
      }

      const updated = await this.prisma.product.update({
        where: { id },
        data: {
          ...(dto.name && { name: dto.name.trim() }),
          ...(dto.sku && { sku: dto.sku.trim().toUpperCase() }),
          ...(dto.category && { category: dto.category.trim() }),
          ...(dto.price !== undefined && { price: dto.price }),
          ...(dto.minStock !== undefined && { minStock: dto.minStock }),
        },
      });

      return {
        ...updated,
        isCritical: updated.currentStock <= updated.minStock,
      };
    } catch (error: unknown) {
      if (error instanceof HttpException) throw error;
      this.logger.error(
        `Erro ao atualizar produto [${id}]:`,
        error instanceof Error ? error.stack : error,
      );
      throw new InternalServerErrorException(
        'Não foi possível atualizar o produto',
      );
    }
  }

  async getDashboardMetrics(): Promise<DashboardMetricsResponseDto> {
    try {
      const products = await this.prisma.product.findMany({
        select: {
          currentStock: true,
          minStock: true,
          price: true,
        },
      });

      let totalItemsInStock = 0;
      let criticalItemsCount = 0;
      let totalStockValue = 0;

      for (const prod of products) {
        totalItemsInStock += prod.currentStock;
        totalStockValue += prod.currentStock * prod.price;

        if (prod.currentStock <= prod.minStock) {
          criticalItemsCount += 1;
        }
      }

      return {
        totalItemsInStock,
        criticalItemsCount,
        totalStockValue: Math.round(totalStockValue * 100) / 100,
      };
    } catch (error: unknown) {
      this.logger.error(
        'Erro ao calcular métricas:',
        error instanceof Error ? error.stack : error,
      );
      throw new InternalServerErrorException(
        'Não foi possível obter as métricas do estoque',
      );
    }
  }
}
