import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CatalogService } from './catalog.service';

@ApiTags('Séries')
@ApiCookieAuth('lg_access')
@Controller('series')
export class SeriesController {
  constructor(private readonly catalog: CatalogService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Une série et ses exercices, sans les réponses' })
  detail(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.catalog.seriesDetail(user.id, id);
  }
}
