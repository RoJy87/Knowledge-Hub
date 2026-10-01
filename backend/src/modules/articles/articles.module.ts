import { Module } from '@nestjs/common';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { ActivityModule } from '../activity/activity.module';

@Module({
  imports: [PrismaModule, ActivityModule],
  controllers: [ArticlesController],
  providers: [ArticlesService],
  exports: [ArticlesService],
})
export class ArticlesModule {}
