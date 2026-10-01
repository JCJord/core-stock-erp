import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  InternalServerErrorException,
  HttpException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../common/prisma.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterUserDto): Promise<UserResponseDto> {
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.email.toLowerCase().trim() },
      });

      if (existingUser) {
        throw new ConflictException('Já existe um usuário cadastrado com este e-mail');
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

      const createdUser = await this.prisma.user.create({
        data: {
          name: dto.name.trim(),
          email: dto.email.toLowerCase().trim(),
          password: hashedPassword,
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      });

      return createdUser;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      // Tratamento de código de violação de constraint única do Prisma (P2002)
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code: string }).code === 'P2002'
      ) {
        throw new ConflictException('Já existe um usuário cadastrado com este e-mail');
      }

      this.logger.error(
        `Falha inesperada no cadastro do usuário [${dto.email}]:`,
        error instanceof Error ? error.stack : error,
      );
      throw new InternalServerErrorException('Não foi possível realizar o cadastro no momento');
    }
  }

  async login(dto: LoginUserDto): Promise<AuthResponseDto> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: dto.email.toLowerCase().trim() },
      });

      if (!user) {
        throw new UnauthorizedException('Credenciais inválidas');
      }

      const isPasswordValid = await bcrypt.compare(dto.password, user.password);

      if (!isPasswordValid) {
        throw new UnauthorizedException('Credenciais inválidas');
      }

      const payload = { sub: user.id, email: user.email };
      const accessToken = await this.jwtService.signAsync(payload);

      return {
        accessToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      };
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `Falha inesperada no login do usuário [${dto.email}]:`,
        error instanceof Error ? error.stack : error,
      );
      throw new InternalServerErrorException('Não foi possível realizar o login no momento');
    }
  }
}
