import { Module } from '@nestjs/common';
import { CatalogModule } from '../catalog/catalog.module';
import { LeaderboardService } from './leaderboard.service';
import { LeaguesCron } from './leagues.cron';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';

@Module({
  imports: [CatalogModule],
  controllers: [StatsController],
  providers: [StatsService, LeaderboardService, LeaguesCron],
  exports: [StatsService],
})
export class StatsModule {}
