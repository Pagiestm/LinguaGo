import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CatalogService } from '../catalog/catalog.service';
import type { AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AnswerDto, TimeSpentDto } from './dto/progress.dto';
import { ProgressService } from './progress.service';

@ApiTags('Progression')
@ApiCookieAuth('lg_access')
@Controller()
export class ProgressController {
  constructor(
    private readonly progress: ProgressService,
    private readonly catalog: CatalogService,
  ) {}

  @Post('exercises/:id/answer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Répondre à un exercice : la vérification et les points sont calculés ici',
  })
  answer(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AnswerDto,
  ) {
    return this.progress.answer(user.id, id, dto.answer);
  }

  @Post('series/:id/time')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Ajouter du temps passé sur une série' })
  addTime(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: TimeSpentDto,
  ) {
    return this.progress.addTimeSpent(user.id, id, dto.seconds);
  }

  @Put('series/:id/favorite')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Ajouter une série à mes favoris' })
  favorite(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.progress.addFavorite(user.id, id);
  }

  @Delete('series/:id/favorite')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Retirer une série de mes favoris' })
  unfavorite(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.progress.removeFavorite(user.id, id);
  }

  @Get('me/favorites')
  @ApiOperation({
    summary: 'Mes séries favorites, avec leurs exercices pour le hors ligne',
  })
  favorites(@CurrentUser() user: AuthenticatedUser) {
    return this.catalog.favorites(user.id);
  }
}
