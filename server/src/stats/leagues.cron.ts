import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { LeaderboardService } from './leaderboard.service';

@Injectable()
export class LeaguesCron {
  private readonly logger = new Logger(LeaguesCron.name);

  constructor(private readonly leaderboard: LeaderboardService) {}

  @Cron('10 0 * * 1', { name: 'leagues', timeZone: 'Europe/Paris' })
  async rotate() {
    const { promoted, relegated } = await this.leaderboard.rotateLeagues();
    this.logger.log(
      `Ligues de la semaine : ${promoted} promotion(s), ${relegated} relégation(s)`,
    );
  }
}
