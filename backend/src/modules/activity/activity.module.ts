import { Module } from '@nestjs/common';
import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';
import { ActivityGateway } from './activity.gateway';
import { PrismaModule } from '../../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [PrismaModule, JwtModule],
  controllers: [ActivityController],
  providers: [ActivityService, ActivityGateway],
  exports: [ActivityService, ActivityGateway],
})
export class ActivityModule {}
