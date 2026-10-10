import { IsString, Matches, MaxLength } from 'class-validator';
import { PASSWORD_RULE } from '../../auth/dto/register.dto';

export class ChangePasswordDto {
  @IsString()
  @MaxLength(128)
  currentPassword: string;

  @IsString()
  @MaxLength(128)
  @Matches(PASSWORD_RULE, {
    message:
      'Le mot de passe doit faire au moins 10 caractères avec une majuscule, un chiffre et un caractère spécial',
  })
  newPassword: string;
}
