import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import type { AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { LeaderboardService } from './leaderboard.service';
import { StatsService } from './stats.service';

@ApiTags('Statistiques')
@ApiCookieAuth('lg_access')
@Controller()
export class StatsController {
  constructor(
    private readonly stats: StatsService,
    private readonly leaderboard: LeaderboardService,
  ) {}

  @Get('me/stats')
  @ApiOperation({
    summary: 'Mes statistiques, mon niveau, ma série de jours et ma ligue',
  })
  @ApiQuery({ name: 'tz', required: false })
  overview(
    @CurrentUser() user: AuthenticatedUser,
    @Query('tz', new DefaultValuePipe('Europe/Paris')) tz: string,
  ) {
    return this.stats.overview(user.id, tz);
  }

  @Get('me/activity')
  @ApiOperation({ summary: 'Mes exercices réussis par jour' })
  @ApiQuery({ name: 'days', required: false })
  @ApiQuery({ name: 'tz', required: false })
  activity(
    @CurrentUser() user: AuthenticatedUser,
    @Query('days', new DefaultValuePipe(7), ParseIntPipe) days: number,
    @Query('tz', new DefaultValuePipe('Europe/Paris')) tz: string,
  ) {
    return this.stats.activity(user.id, Math.min(Math.max(days, 1), 90), tz);
  }

  @Get('me/completed-series')
  @ApiOperation({ summary: 'Mes séries terminées, par niveau' })
  completedSeries(@CurrentUser() user: AuthenticatedUser) {
    return this.stats.completedSeriesByLevel(user.id);
  }

  @Get('leaderboard/week')
  @ApiOperation({ summary: 'Les dix meilleurs de la semaine' })
  weekly(@CurrentUser() user: AuthenticatedUser) {
    return this.leaderboard.weekly(user.id);
  }

  @Get('leaderboard/league')
  @ApiOperation({
    summary: 'Ma ligue de la semaine, avec zones de montée et de descente',
  })
  league(@CurrentUser() user: AuthenticatedUser) {
    return this.leaderboard.league(user.id);
  }
}
