import { Module } from '@nestjs/common';
import { AdminCatalogService } from './admin-catalog.service';
import { AdminController } from './admin.controller';

@Module({
  controllers: [AdminController],
  providers: [AdminCatalogService],
})
export class AdminModule {}
