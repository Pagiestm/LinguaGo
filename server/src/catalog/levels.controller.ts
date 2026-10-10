import { Controller, Get, Param, ParseEnumPipe, Query } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import type { AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { LevelCode, SeriesType } from '../generated/prisma/enums';
import { CatalogService } from './catalog.service';
import { winnablePoints } from './level-progress';

@ApiTags('Niveaux')
@Controller('levels')
export class LevelsController {
  constructor(private readonly catalog: CatalogService) {}

  @Public()
  @Get('public')
  @ApiOperation({ summary: 'Les niveaux et leur volume, sans compte' })
  async publicLevels() {
    const levels = await this.catalog.levelSummaries();
    return levels.map((level) => ({
      ...level,
      winnablePoints: winnablePoints(level),
    }));
  }

  @Get()
  @ApiCookieAuth('lg_access')
  @ApiOperation({ summary: 'Les niveaux avec ma progression' })
  levels(@CurrentUser() user: AuthenticatedUser) {
    return this.catalog.levelsForUser(user.id);
  }

  @Get(':code/series')
  @ApiCookieAuth('lg_access')
  @ApiOperation({ summary: "Les séries d'un niveau, avec ma progression" })
  @ApiQuery({ name: 'type', enum: SeriesType, required: false })
  series(
    @CurrentUser() user: AuthenticatedUser,
    @Param('code', new ParseEnumPipe(LevelCode)) code: LevelCode,
    @Query('type', new ParseEnumPipe(SeriesType, { optional: true }))
    type?: SeriesType,
  ) {
    return this.catalog.seriesByLevel(user.id, code, type ?? 'DEFAULT');
  }
}
