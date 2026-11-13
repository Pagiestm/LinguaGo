import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { LEAGUE_TIME_ZONE } from './leagues.constants';
import { LeaguesService } from './leagues.service';

@Injectable()
export class LeaguesCron implements OnApplicationBootstrap {
  private readonly logger = new Logger(LeaguesCron.name);

  constructor(private readonly leagues: LeaguesService) {}

  onApplicationBootstrap() {
    void this.rotate();
  }

  @Cron('10 0 * * 1', { name: 'leagues', timeZone: LEAGUE_TIME_ZONE })
  async rotate() {
    try {
      const result = await this.leagues.rotate();
      if (result)
        this.logger.log(
          `Ligues de la semaine : ${result.promoted} promotion(s), ${result.relegated} relégation(s)`,
        );
    } catch (error) {
      this.logger.error(`Rotation des ligues interrompue : ${String(error)}`);
    }
  }
}
