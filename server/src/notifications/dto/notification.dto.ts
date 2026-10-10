import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class PushKeysDto {
  @IsString()
  @MaxLength(200)
  p256dh: string;

  @IsString()
  @MaxLength(200)
  auth: string;
}

export class PushSubscriptionDto {
  @IsUrl({ require_tld: false })
  @MaxLength(1000)
  endpoint: string;

  @IsOptional()
  expirationTime?: number | null;

  @IsObject()
  @ValidateNested()
  @Type(() => PushKeysDto)
  keys: PushKeysDto;
}

export class UpsertNotificationDto {
  @IsObject()
  @ValidateNested()
  @Type(() => PushSubscriptionDto)
  subscription: PushSubscriptionDto;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(7)
  frequencyDays?: number;

  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: "L'heure doit être au format HH:mm",
  })
  time?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  timeZone?: string;
}

export class UpdateNotificationDto {
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(7)
  frequencyDays?: number;

  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: "L'heure doit être au format HH:mm",
  })
  time?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  timeZone?: string;
}

export class SnoozeNotificationDto {
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(1440)
  minutes?: number;
}
