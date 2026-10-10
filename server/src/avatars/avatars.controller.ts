import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Avatars')
@Controller('avatars')
export class AvatarsController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Les avatars disponibles' })
  list() {
    return this.prisma.avatar.findMany({ orderBy: { id: 'asc' } });
  }
}
