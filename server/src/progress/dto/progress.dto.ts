import { IsInt, IsString, Max, MaxLength, Min } from 'class-validator';

export class AnswerDto {
  @IsString()
  @MaxLength(500)
  answer: string;
}

export class TimeSpentDto {
  @IsInt()
  @Min(1)
  @Max(3600)
  seconds: number;
}
