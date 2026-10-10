import { Module } from '@nestjs/common';
import { CatalogModule } from '../catalog/catalog.module';
import { ReviewsModule } from '../reviews/reviews.module';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';

@Module({
  imports: [CatalogModule, ReviewsModule],
  controllers: [ProgressController],
  providers: [ProgressService],
})
export class ProgressModule {}
