import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AchievementsModule } from './achievements/achievements.module';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { AvatarsModule } from './avatars/avatars.module';
import { CatalogModule } from './catalog/catalog.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { AuthGuard } from './common/guards/auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { HealthModule } from './health/health.module';
import { MailModule } from './mail/mail.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProgressModule } from './progress/progress.module';
import { ReviewsModule } from './reviews/reviews.module';
import { StatsModule } from './stats/stats.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    PrismaModule,
    MailModule,
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 120 }]),
    HealthModule,
    AuthModule,
    UsersModule,
    AvatarsModule,
    CatalogModule,
    AdminModule,
    ProgressModule,
    ReviewsModule,
    AchievementsModule,
    StatsModule,
    NotificationsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
