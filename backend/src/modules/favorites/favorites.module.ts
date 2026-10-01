import { Module } from '@nestjs/common';
import { FavoritesController } from './favorites.controller';
import { FavoritesService } from './favorites.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { ActivityModule } from '../activity/activity.module';

@Module({
  imports: [PrismaModule, ActivityModule],
  controllers: [FavoritesController],
  providers: [FavoritesService],
  exports: [FavoritesService],
})
export class FavoritesModule {}
