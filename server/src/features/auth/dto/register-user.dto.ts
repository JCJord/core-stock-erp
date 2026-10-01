import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
export class RegisterUserDto {
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @IsString({ message: 'Nome deve ser um texto' })
  name!: string;

  @IsEmail({}, { message: 'Informe um e-mail válido' })
  email!: string;

  @MinLength(6, { message: 'A senha deve conter no mínimo 6 caracteres' })
  password!: string;
}
