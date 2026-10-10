import { Controller, Get } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ReviewsService } from './reviews.service';

@ApiTags('Révisions')
@ApiCookieAuth('lg_access')
@Controller('me')
export class ReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @Get('reviews')
  @ApiOperation({
    summary: 'Mes révisions : combien sont dues, et la suivante',
  })
  summary(@CurrentUser() user: AuthenticatedUser) {
    return this.reviews.summary(user.id);
  }

  @Get('reviews/session')
  @ApiOperation({ summary: 'Une série virtuelle avec mes révisions dues' })
  session(@CurrentUser() user: AuthenticatedUser) {
    return this.reviews.session(user.id);
  }

  @Get('daily')
  @ApiOperation({
    summary: 'La session du jour : révisions dues puis nouveaux exercices',
  })
  daily(@CurrentUser() user: AuthenticatedUser) {
    return this.reviews.daily(user.id);
  }
}
