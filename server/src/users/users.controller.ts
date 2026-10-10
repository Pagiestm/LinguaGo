import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Patch,
  Res,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { clearAuthCookies } from '../auth/cookies';
import type { AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';

@ApiTags('Compte')
@ApiCookieAuth('lg_access')
@Controller('users/me')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Mon profil' })
  profile(@CurrentUser() user: AuthenticatedUser) {
    return this.users.getProfile(user.id);
  }

  @Patch()
  @ApiOperation({
    summary: 'Modifier mon pseudo, mon avatar ou mon objectif quotidien',
  })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.users.updateProfile(user.id, dto);
  }

  @Patch('password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Changer mon mot de passe' })
  changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.users.changePassword(user.id, dto);
  }

  @Patch('first-login')
  @ApiOperation({ summary: "Marquer l'accueil de première connexion comme vu" })
  completeFirstLogin(@CurrentUser() user: AuthenticatedUser) {
    return this.users.completeFirstLogin(user.id);
  }

  @Get('export')
  @Header('Content-Disposition', 'attachment; filename="linguago-export.json"')
  @ApiOperation({ summary: 'Télécharger toutes mes données au format JSON' })
  exportData(@CurrentUser() user: AuthenticatedUser) {
    return this.users.exportData(user.id);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer mon compte et toutes mes données' })
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.users.deleteAccount(user.id);
    clearAuthCookies(res);
  }
}
