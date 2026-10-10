import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { PASSWORD_RULE } from './register.dto';

export class ForgotPasswordDto {
  @IsEmail()
  @MaxLength(120)
  email: string;
}

export class ResetPasswordDto {
  @IsString()
  @MinLength(20)
  @MaxLength(200)
  token: string;

  @IsString()
  @MaxLength(128)
  @Matches(PASSWORD_RULE, {
    message:
      'Le mot de passe doit faire au moins 10 caractères avec une majuscule, un chiffre et un caractère spécial',
  })
  password: string;
}
