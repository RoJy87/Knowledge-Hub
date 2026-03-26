import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Clean and normalize user input for search queries
   */
  cleanSearchQuery(query: string): string {
    return query.trim().toLowerCase();
  }

  /**
   * Get user with selected relations
   */
  async getUserWithRelations(userId: string, relations: string[] = []) {
    const include: Record<string, boolean> = {};
    
    for (const relation of relations) {
      include[relation] = true;
    }

    return this.user.findUnique({
      where: { id: userId },
      include,
    });
  }
}
