import { Module } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { LevelsController } from './levels.controller';
import { SeriesController } from './series.controller';

@Module({
  controllers: [LevelsController, SeriesController],
  providers: [CatalogService],
  exports: [CatalogService],
})
export class CatalogModule {}
