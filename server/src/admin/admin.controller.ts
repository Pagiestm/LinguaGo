import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { LevelCode, SeriesType } from '../generated/prisma/enums';
import { AdminCatalogService } from './admin-catalog.service';
import {
  CreateSeriesDto,
  ExerciseInputDto,
  UpdateExerciseDto,
  UpdateSeriesDto,
} from './dto/series.dto';

@ApiTags('Administration')
@ApiCookieAuth('lg_access')
@Roles('ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminCatalogService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Compteurs globaux' })
  overview() {
    return this.admin.overview();
  }

  @Get('series')
  @ApiOperation({ summary: 'Toutes les séries, filtrables' })
  @ApiQuery({ name: 'level', enum: LevelCode, required: false })
  @ApiQuery({ name: 'type', enum: SeriesType, required: false })
  series(
    @Query('level', new ParseEnumPipe(LevelCode, { optional: true }))
    level?: LevelCode,
    @Query('type', new ParseEnumPipe(SeriesType, { optional: true }))
    type?: SeriesType,
  ) {
    return this.admin.listSeries(level, type);
  }

  @Get('series/:id')
  @ApiOperation({ summary: 'Une série avec les réponses' })
  detail(@Param('id', ParseIntPipe) id: number) {
    return this.admin.seriesWithAnswers(id);
  }

  @Post('series')
  @ApiOperation({ summary: 'Créer une série' })
  create(@Body() dto: CreateSeriesDto) {
    return this.admin.createSeries(dto);
  }

  @Patch('series/:id')
  @ApiOperation({ summary: 'Modifier une série' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSeriesDto) {
    return this.admin.updateSeries(id, dto);
  }

  @Delete('series/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer une série' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.admin.deleteSeries(id);
  }

  @Post('series/:id/exercises')
  @ApiOperation({ summary: 'Ajouter un exercice à une série' })
  addExercise(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ExerciseInputDto,
  ) {
    return this.admin.addExercise(id, dto);
  }

  @Patch('exercises/:id')
  @ApiOperation({ summary: 'Modifier un exercice' })
  updateExercise(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExerciseDto,
  ) {
    return this.admin.updateExercise(id, dto);
  }

  @Delete('exercises/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer un exercice' })
  removeExercise(@Param('id', ParseIntPipe) id: number) {
    return this.admin.deleteExercise(id);
  }
}
