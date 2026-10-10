import { Controller, DefaultValuePipe, Get, Query } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import type { AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AchievementsService } from './achievements.service';

@ApiTags('Succès')
@ApiCookieAuth('lg_access')
@Controller('me/achievements')
export class AchievementsController {
  constructor(private readonly achievements: AchievementsService) {}

  @Get()
  @ApiOperation({ summary: 'Mes succès, débloqués ou non' })
  @ApiQuery({ name: 'tz', required: false })
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query('tz', new DefaultValuePipe('Europe/Paris')) tz: string,
  ) {
    return this.achievements.list(user.id, tz);
  }
}
