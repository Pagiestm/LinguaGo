import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(40)
  pseudo?: string;

  @IsOptional()
  @IsInt()
  avatarId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(200)
  dailyGoal?: number;
}
