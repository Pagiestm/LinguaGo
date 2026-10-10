import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export const PASSWORD_RULE = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,}$/;

export class RegisterDto {
  @IsString()
  @MinLength(2)
  @MaxLength(40)
  pseudo: string;

  @IsEmail()
  @MaxLength(120)
  email: string;

  @IsString()
  @MaxLength(128)
  @Matches(PASSWORD_RULE, {
    message:
      'Le mot de passe doit faire au moins 10 caractères avec une majuscule, un chiffre et un caractère spécial',
  })
  password: string;
}
