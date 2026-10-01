# Руководство разработчика Knowledge Hub

## Добавление нового модуля

### Backend

1. Создайте структуру модуля:

```bash
cd backend/src/modules
mkdir new-module
cd new-module
mkdir dto
```

2. Создайте файлы модуля:

```
new-module/
├── new-module.module.ts
├── new-module.controller.ts
├── new-module.service.ts
└── dto/
    ├── create-new.dto.ts
    ├── update-new.dto.ts
    └── new-response.dto.ts
```

3. Пример service:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NewModuleService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.newModel.findMany();
  }
}
```

4. Добавьте модуль в AppModule:

```typescript
import { NewModule } from './modules/new-module/new-module.module';

@Module({
  imports: [
    // ...
    NewModule,
  ],
})
export class AppModule {}
```

### Frontend

1. Создайте API клиент:

```typescript
// src/api/new.api.ts
import { api } from './axios';

export const newApi = {
  async getAll() {
    const response = await api.get('/new');
    return response.data;
  },
};
```

2. Создайте store:

```typescript
// src/stores/new.store.ts
import { defineStore } from 'pinia';

export const useNewStore = defineStore('new', () => {
  const items = ref([]);
  
  async function load() {
    items.value = await newApi.getAll();
  }
  
  return { items, load };
});
```

3. Создайте view:

```vue
<!-- src/views/new/NewListView.vue -->
<template>
  <MainLayout>
    <h1>New Module</h1>
  </MainLayout>
</template>
```

4. Добавьте маршрут в router:

```typescript
{
  path: '/new',
  name: 'new',
  component: () => import('@/views/new/NewListView.vue'),
  meta: { requiresAuth: true },
}
```

## Стиль кода

### TypeScript

- Используйте интерфейсы для типов объектов
- Избегайте `any`, используйте `unknown` при необходимости
- Экспортируйте типы из отдельных файлов

### Vue Components

```vue
<template>
  <div class="component-name">
    <!-- Template content -->
  </div>
</template>

<script setup lang="ts">
// Imports
import { ref } from 'vue';
import { useStore } from '@/stores/store';

// Props
const props = defineProps<{
  itemId: string;
}>();

// Emits
const emit = defineEmits<{
  (e: 'update', value: string): void;
}>();

// State
const loading = ref(false);

// Functions
async function loadData() {
  loading.value = true;
  // ...
  loading.value = false;
}
</script>

<style scoped>
.component-name {
  /* Styles */
}
</style>
```

### Backend DTOs

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateItemDto {
  @ApiProperty({ description: 'Item name' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
```

## Работа с базой данных

### Миграции

```bash
# Создать миграцию
cd backend
pnpm prisma migrate dev --name description

# Применить миграции
pnpm prisma migrate deploy

# Откатить миграцию
pnpm prisma migrate resolve --rolled-back
```

### Prisma Studio

```bash
pnpm prisma studio
```

## Тестирование

### Backend тесты

```bash
cd backend

# Unit тесты
pnpm run test

# E2E тесты
pnpm run test:e2e

# С покрытием
pnpm run test:cov
```

### Frontend тесты

```bash
cd frontend

# Запустить тесты
pnpm run test
```

## Git Workflow

### Ветки

- `main` - production версия
- `develop` - интеграционная ветка
- `feature/name` - новые функции
- `fix/name` - исправления багов

### Коммиты

```
feat: добавить новый модуль
fix: исправить ошибку авторизации
docs: обновить документацию
refactor: рефакторинг кода
test: добавить тесты
chore: обновить зависимости
```

### Pull Request процесс

1. Создать ветку от `develop`
2. Внести изменения
3. Создать PR в `develop`
4. Code review
5. Merge после approval

## Отладка

### Backend

```bash
# Debug режим
pnpm run start:debug

# Подключиться в VS Code
# Используйте launch.json конфигурацию
```

### Frontend

```bash
# Dev server с hot reload
pnpm run dev

# Vue DevTools в браузере
```

## Производительность

### Backend оптимизации

- Индексы на часто используемых полях
- Pagination для больших списков
- Кэширование с Redis

### Frontend оптимизации

- Lazy loading роутов
- Code splitting
- Memoization для вычислений

## Чеклист перед merge

- [ ] Код проходит линтинг
- [ ] Тесты проходят
- [ ] Нет console.log
- [ ] Документация обновлена
- [ ] Переменные окружения добавлены в .env.example
