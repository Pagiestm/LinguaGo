import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import {
  ExerciseType,
  LevelCode,
  SeriesType,
} from '../../generated/prisma/enums';

export class ExerciseInputDto {
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  question: string;

  @IsString()
  @MinLength(1)
  @MaxLength(500)
  answer: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8)
  @IsString({ each: true })
  choices?: string[];

  @IsEnum(ExerciseType)
  type: ExerciseType;
}

export class CreateSeriesDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsEnum(LevelCode)
  levelCode: LevelCode;

  @IsOptional()
  @IsEnum(SeriesType)
  type?: SeriesType;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @ValidateNested({ each: true })
  @Type(() => ExerciseInputDto)
  exercises?: ExerciseInputDto[];
}

export class UpdateSeriesDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsEnum(LevelCode)
  levelCode?: LevelCode;

  @IsOptional()
  @IsEnum(SeriesType)
  type?: SeriesType;
}

export class UpdateExerciseDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  question?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  answer?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8)
  @IsString({ each: true })
  choices?: string[];

  @IsOptional()
  @IsEnum(ExerciseType)
  type?: ExerciseType;
}
