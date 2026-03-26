import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Hash password
  const password = await bcrypt.hash('password123', 10);

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    },
  });

  // Create regular user
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password,
      firstName: 'John',
      lastName: 'Doe',
      role: 'USER',
    },
  });

  console.log('✅ Created users:', admin.email, user.email);

  // Create tags
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { slug: 'typescript' },
      update: {},
      create: {
        name: 'TypeScript',
        slug: 'typescript',
        color: '#3178C6',
      },
    }),
    prisma.tag.upsert({
      where: { slug: 'nestjs' },
      update: {},
      create: {
        name: 'NestJS',
        slug: 'nestjs',
        color: '#E0234E',
      },
    }),
    prisma.tag.upsert({
      where: { slug: 'vue' },
      update: {},
      create: {
        name: 'Vue.js',
        slug: 'vue',
        color: '#4FC08D',
      },
    }),
    prisma.tag.upsert({
      where: { slug: 'tutorial' },
      update: {},
      create: {
        name: 'Tutorial',
        slug: 'tutorial',
        color: '#F59E0B',
      },
    }),
  ]);

  console.log('✅ Created tags:', tags.map((t) => t.name).join(', '));

  // Create project
  const project = await prisma.project.create({
    data: {
      name: 'Knowledge Base',
      description: 'Main knowledge base for the team',
      slug: 'knowledge-base',
      color: '#3B82F6',
      creatorId: admin.id,
      members: {
        create: [
          {
            userId: user.id,
            role: 'MEMBER',
          },
        ],
      },
    },
  });

  console.log('✅ Created project:', project.name);

  // Create sample article
  const article = await prisma.article.create({
    data: {
      title: 'Getting Started with Knowledge Hub',
      slug: 'getting-started-with-knowledge-hub',
      content: `# Welcome to Knowledge Hub

Knowledge Hub is a powerful knowledge management system for teams.

## Features

- Create and organize projects
- Write articles with Markdown support
- Comment and collaborate
- Tag and categorize content
- Save favorites
- Track activity

## Getting Started

1. Create a project
2. Write your first article
3. Invite team members
4. Start collaborating

Happy documenting! 📚`,
      excerpt: 'Learn how to get started with Knowledge Hub',
      status: 'PUBLISHED',
      authorId: admin.id,
      projectId: project.id,
      publishedAt: new Date(),
      tags: {
        create: tags.map((tag) => ({
          tagId: tag.id,
        })),
      },
    },
  });

  console.log('✅ Created article:', article.title);

  // Create sample activity
  await prisma.activity.create({
    data: {
      userId: admin.id,
      type: 'ARTICLE_CREATED',
      articleId: article.id,
      metadata: {
        title: article.title,
      },
    },
  });

  console.log('✅ Created activity');

  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('📧 Login credentials:');
  console.log('   Admin: admin@example.com / password123');
  console.log('   User: user@example.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
