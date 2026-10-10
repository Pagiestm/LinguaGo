import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Santé')
@Public()
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Le serveur répond' })
  live() {
    return { status: 'ok', uptime: Math.round(process.uptime()) };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Le serveur répond et la base est joignable' })
  async ready() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', database: 'ok' };
    } catch {
      throw new ServiceUnavailableException('Base de données injoignable');
    }
  }
}
