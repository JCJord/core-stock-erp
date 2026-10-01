export class AuthUserPayloadDto {
  id!: string;
  name!: string;
  email!: string;
}

export class AuthResponseDto {
  accessToken!: string;
  user!: AuthUserPayloadDto;
}
