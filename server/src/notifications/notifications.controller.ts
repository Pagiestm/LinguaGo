import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import {
  SnoozeNotificationDto,
  UpdateNotificationDto,
  UpsertNotificationDto,
} from './dto/notification.dto';
import { NotificationsService } from './notifications.service';
import { PushService } from './push.service';

@ApiTags('Notifications')
@Controller()
export class NotificationsController {
  constructor(
    private readonly notifications: NotificationsService,
    private readonly push: PushService,
  ) {}

  @Public()
  @Get('push/public-key')
  @ApiOperation({
    summary:
      'La clé publique VAPID, ou null si les notifications sont désactivées',
  })
  publicKey() {
    return { publicKey: this.push.publicKey };
  }

  @Get('me/notification')
  @ApiCookieAuth('lg_access')
  @ApiOperation({ summary: 'Mes réglages de rappel' })
  get(@CurrentUser() user: AuthenticatedUser) {
    return this.notifications.get(user.id);
  }

  @Put('me/notification')
  @ApiCookieAuth('lg_access')
  @ApiOperation({
    summary: 'Enregistrer mon abonnement push et mes réglages de rappel',
  })
  upsert(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpsertNotificationDto,
  ) {
    return this.notifications.upsert(user.id, dto);
  }

  @Patch('me/notification')
  @ApiCookieAuth('lg_access')
  @ApiOperation({ summary: 'Modifier mes réglages de rappel' })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateNotificationDto,
  ) {
    return this.notifications.update(user.id, dto);
  }

  @Post('me/notification/snooze')
  @ApiCookieAuth('lg_access')
  @ApiOperation({
    summary: 'Reporter le prochain rappel, d’une heure par défaut',
  })
  snooze(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SnoozeNotificationDto,
  ) {
    return this.notifications.snooze(user.id, dto);
  }

  @Post('me/notification/test')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiCookieAuth('lg_access')
  @ApiOperation({ summary: 'Recevoir une notification de test immédiatement' })
  test(@CurrentUser() user: AuthenticatedUser) {
    return this.notifications.sendTest(user.id);
  }

  @Delete('me/notification')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiCookieAuth('lg_access')
  @ApiOperation({ summary: 'Supprimer mon abonnement et mes rappels' })
  remove(@CurrentUser() user: AuthenticatedUser) {
    return this.notifications.remove(user.id);
  }
}
