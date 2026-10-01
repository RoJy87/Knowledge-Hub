# Архитектурный План: Knowledge Hub

## 1. Резюме

Knowledge Hub — это full-stack приложение для управления знаниями команды с возможностью создания статей, проектов, комментариев, тегов и избранного. Архитектура построена на основе модульного монолита с чётким разделением ответственности между backend (NestJS) и frontend (Vue 3). Приложение поддерживает аутентификацию через JWT, real-time уведомления через WebSocket, и полностью контейнеризировано с помощью Docker.

---

## 2. Архитектурный Обзор

### 2.1 Общая Архитектура

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    Vue 3 Frontend                        │    │
│  │  (Vite + Pinia + Vue Router + Tailwind + Tiptap)        │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST + WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API Layer                                │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    NestJS Backend                        │    │
│  │  (Modules + Guards + Interceptors + WebSocket Gateway)  │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Prisma ORM
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Data Layer                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   PostgreSQL Database                   │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Компоненты Системы

| Компонент | Технология | Назначение |
|-----------|------------|------------|
| Frontend | Vue 3 + Vite | Пользовательский интерфейс |
| State Management | Pinia | Глобальное состояние приложения |
| Routing | Vue Router | Навигация между страницами |
| UI Framework | Tailwind CSS | Стилизация компонентов |
| Rich Text Editor | Tiptap | Редактирование статей |
| Backend | NestJS | API сервер, бизнес-логика |
| ORM | Prisma | Работа с базой данных |
| Database | PostgreSQL | Хранение данных |
| Auth | JWT + bcrypt | Аутентификация и авторизация |
| Real-time | WebSocket | Уведомления и активность |
| API Docs | Swagger | Документация API |
| Containerization | Docker | Развёртывание приложения |

### 2.3 Поток Данных

```
User Action → Vue Component → Pinia Store → Axios → NestJS Controller
                                                      ↓
                                               Service Layer
                                                      ↓
                                                 Prisma
                                                      ↓
                                                PostgreSQL
                                                      ↓
                                                 Response
                                                      ↓
User Interface ← Component Render ← Store Update ← Axios Response
```

---

## 3. Структура Проекта

### 3.1 Общая Структура

```
docspace/
├── backend/                          # NestJS backend
│   ├── src/
│   │   ├── main.ts                   # Точка входа
│   │   ├── app.module.ts             # Корневой модуль
│   │   ├── common/                   # Общие утилиты
│   │   │   ├── decorators/           # Кастомные декораторы
│   │   │   │   ├── current-user.decorator.ts
│   │   │   │   └── public.decorator.ts
│   │   │   ├── filters/              # Глобальные фильтры
│   │   │   │   └── http-exception.filter.ts
│   │   │   ├── guards/               # Guards
│   │   │   │   ├── jwt-auth.guard.ts
│   │   │   │   └── roles.guard.ts
│   │   │   ├── interceptors/         # Интерсепторы
│   │   │   │   ├── logging.interceptor.ts
│   │   │   │   └── transform.interceptor.ts
│   │   │   └── pipes/                # Pipes
│   │   │       └── parse-int.pipe.ts
│   │   ├── config/                   # Конфигурация
│   │   │   ├── database.config.ts
│   │   │   ├── jwt.config.ts
│   │   │   └── app.config.ts
│   │   ├── modules/                  # Бизнес-модули
│   │   │   ├── auth/                 # Аутентификация
│   │   │   ├── users/                # Пользователи
│   │   │   ├── projects/             # Проекты
│   │   │   ├── articles/             # Статьи
│   │   │   ├── comments/             # Комментарии
│   │   │   ├── tags/                 # Теги
│   │   │   ├── favorites/            # Избранное
│   │   │   └── activity/             # Активность
│   │   └── prisma/                   # Prisma схема
│   │       └── schema.prisma
│   ├── prisma/
│   │   ├── migrations/               # Миграции БД
│   │   └── seed.ts                   # Seed данные
│   ├── test/                         # E2E тесты
│   ├── .env                          # Переменные окружения
│   ├── .env.example
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── nest-cli.json
│   ├── package.json
│   ├── tsconfig.build.json
│   └── tsconfig.json
│
├── frontend/                         # Vue 3 frontend (текущий проект)
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   ├── src/
│   │   ├── main.ts                   # Точка входа
│   │   ├── App.vue                   # Корневой компонент
│   │   ├── components/               # Переиспользуемые компоненты
│   │   │   ├── common/               # Базовые компоненты
│   │   │   │   ├── Button.vue
│   │   │   │   ├── Input.vue
│   │   │   │   ├── Modal.vue
│   │   │   │   ├── Spinner.vue
│   │   │   │   ├── Toast.vue
│   │   │   │   └── ConfirmDialog.vue
│   │   │   ├── layout/               # Layout компоненты
│   │   │   │   ├── Header.vue
│   │   │   │   ├── Sidebar.vue
│   │   │   │   ├── Footer.vue
│   │   │   │   └── MainLayout.vue
│   │   │   ├── articles/             # Компоненты статей
│   │   │   │   ├── ArticleCard.vue
│   │   │   │   ├── ArticleList.vue
│   │   │   │   ├── ArticleEditor.vue
│   │   │   │   └── ArticlePreview.vue
│   │   │   ├── comments/             # Компоненты комментариев
│   │   │   │   ├── CommentList.vue
│   │   │   │   ├── CommentItem.vue
│   │   │   │   └── CommentForm.vue
│   │   │   ├── projects/             # Компоненты проектов
│   │   │   │   ├── ProjectCard.vue
│   │   │   │   ├── ProjectList.vue
│   │   │   │   └── ProjectForm.vue
│   │   │   ├── tags/                 # Компоненты тегов
│   │   │   │   ├── TagInput.vue
│   │   │   │   └── TagList.vue
│   │   │   └── users/                # Компоненты пользователей
│   │   │       ├── UserAvatar.vue
│   │   │       └── UserSelect.vue
│   │   ├── composables/              # Composition API
│   │   │   ├── useAuth.ts
│   │   │   ├── useArticles.ts
│   │   │   ├── useProjects.ts
│   │   │   ├── useComments.ts
│   │   │   ├── useTags.ts
│   │   │   ├── useFavorites.ts
│   │   │   ├── useActivity.ts
│   │   │   └── useToast.ts
│   │   ├── stores/                   # Pinia stores
│   │   │   ├── auth.store.ts
│   │   │   ├── articles.store.ts
│   │   │   ├── projects.store.ts
│   │   │   ├── comments.store.ts
│   │   │   ├── tags.store.ts
│   │   │   ├── favorites.store.ts
│   │   │   ├── activity.store.ts
│   │   │   └── ui.store.ts
│   │   ├── views/                    # Страницы (route views)
│   │   │   ├── auth/
│   │   │   │   ├── LoginView.vue
│   │   │   │   └── RegisterView.vue
│   │   │   ├── articles/
│   │   │   │   ├── ArticlesListView.vue
│   │   │   │   ├── ArticleDetailView.vue
│   │   │   │   ├── ArticleCreateView.vue
│   │   │   │   └── ArticleEditView.vue
│   │   │   ├── projects/
│   │   │   │   ├── ProjectsListView.vue
│   │   │   │   ├── ProjectDetailView.vue
│   │   │   │   └── ProjectCreateView.vue
│   │   │   ├── tags/
│   │   │   │   └── TagsListView.vue
│   │   │   ├── users/
│   │   │   │   ├── ProfileView.vue
│   │   │   │   └── SettingsView.vue
│   │   │   ├── favorites/
│   │   │   │   └── FavoritesView.vue
│   │   │   ├── activity/
│   │   │   │   └── ActivityView.vue
│   │   │   └── HomeView.vue
│   │   ├── router/                   # Vue Router
│   │   │   ├── index.ts
│   │   │   ├── routes.ts
│   │   │   └── guards.ts
│   │   ├── api/                      # API клиенты
│   │   │   ├── axios.ts              # Axios instance
│   │   │   ├── auth.api.ts
│   │   │   ├── articles.api.ts
│   │   │   ├── projects.api.ts
│   │   │   ├── comments.api.ts
│   │   │   ├── tags.api.ts
│   │   │   ├── favorites.api.ts
│   │   │   └── activity.api.ts
│   │   ├── types/                    # TypeScript типы
│   │   │   ├── models.ts
│   │   │   ├── api.ts
│   │   │   └── forms.ts
│   │   ├── utils/                    # Утилиты
│   │   │   ├── formatters.ts
│   │   │   ├── validators.ts
│   │   │   └── constants.ts
│   │   ├── assets/                   # Статические ресурсы
│   │   │   ├── styles/
│   │   │   │   ├── tailwind.css
│   │   │   │   ├── variables.css
│   │   │   │   └── components.css
│   │   │   └── images/
│   │   └── plugins/                  # Плагины
│   │       ├── tiptap.ts
│   │       └── vee-validate.ts
│   ├── tests/                        # Frontend тесты
│   │   ├── unit/
│   │   └── e2e/
│   ├── .env                          # Переменные окружения
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
│
├── docs/                             # Документация
│   ├── api/                          # API документация
│   ├── architecture/                 # Архитектурные диаграммы
│   └── guides/                       # Руководства
│
├── .gitignore
├── docker-compose.yml                # Root docker-compose
├── README.md
└── KNOWLEDGE_HUB_PLAN.md             # Этот документ
```

---

## 4. Компоненты и Ответственность

### 4.1 Backend Модули

| Модуль | Ответственность | Ключевые файлы |
|--------|-----------------|----------------|
| **Auth** | JWT аутентификация, регистрация, refresh токены | `auth.controller.ts`, `auth.service.ts`, `jwt.strategy.ts`, `auth.guard.ts` |
| **Users** | Управление пользователями, профили | `users.controller.ts`, `users.service.ts`, `user.entity.ts` |
| **Projects** | CRUD проектов, участники | `projects.controller.ts`, `projects.service.ts`, `project.entity.ts` |
| **Articles** | CRUD статей, версии, статусы | `articles.controller.ts`, `articles.service.ts`, `article.entity.ts` |
| **Comments** | Комментарии к статьям, древовидная структура | `comments.controller.ts`, `comments.service.ts`, `comment.entity.ts` |
| **Tags** | Теги, категоризация | `tags.controller.ts`, `tags.service.ts`, `tag.entity.ts` |
| **Favorites** | Избранные статьи | `favorites.controller.ts`, `favorites.service.ts` |
| **Activity** | Лог активности, уведомления | `activity.gateway.ts`, `activity.service.ts`, `activity.entity.ts` |

### 4.2 Frontend Компоненты

| Категория | Компоненты | Назначение |
|-----------|------------|------------|
| **Layout** | `Header`, `Sidebar`, `Footer`, `MainLayout` | Базовая структура приложения |
| **Common** | `Button`, `Input`, `Modal`, `Spinner`, `Toast` | Переиспользуемые UI элементы |
| **Articles** | `ArticleCard`, `ArticleList`, `ArticleEditor`, `ArticlePreview` | Отображение и редактирование статей |
| **Comments** | `CommentList`, `CommentItem`, `CommentForm` | Система комментариев |
| **Projects** | `ProjectCard`, `ProjectList`, `ProjectForm` | Управление проектами |
| **Tags** | `TagInput`, `TagList` | Работа с тегами |
| **Users** | `UserAvatar`, `UserSelect` | Компоненты пользователей |

### 4.3 Stores (Pinia)

| Store | State | Actions | Getters |
|-------|-------|---------|---------|
| `auth` | user, token, isAuthenticated | login, register, logout, refreshToken | currentUser, isAdmin |
| `articles` | articles, currentArticle, loading | fetchArticles, fetchArticle, createArticle, updateArticle, deleteArticle | publishedArticles, draftArticles |
| `projects` | projects, currentProject | fetchProjects, fetchProject, createProject, updateProject | userProjects |
| `comments` | comments, loading | fetchComments, addComment, deleteComment | articleComments |
| `tags` | tags, loading | fetchTags, createTag, deleteTag | popularTags |
| `favorites` | favorites, loading | toggleFavorite, fetchFavorites | isFavorite |
| `activity` | activities, onlineUsers | fetchActivity, subscribeToActivity | recentActivity |
| `ui` | sidebarOpen, theme, toasts | toggleSidebar, setTheme, addToast | currentTheme |

---

## 5. Prisma Схема

```prisma
// backend/src/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ==================== USERS ====================

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  firstName String
  lastName  String
  avatar    String?
  bio       String?
  role      Role     @default(USER)
  isActive  Boolean  @default(true)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations
  articles       Article[]       @relation("Author")
  comments       Comment[]
  favorites      Favorite[]
  activities     Activity[]
  projectMembers ProjectMember[]
  createdProjects Project[]      @relation("ProjectCreator")
  
  @@index([email])
  @@index([role])
}

enum Role {
  USER
  ADMIN
  MODERATOR
}

// ==================== PROJECTS ====================

model Project {
  id          String   @id @default(uuid())
  name        String
  description String?
  slug        String   @unique
  color       String?  @default("#3B82F6")
  isActive    Boolean  @default(true)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  creatorId   String
  creator     User     @relation("ProjectCreator", fields: [creatorId], references: [id])
  members     ProjectMember[]
  articles    Article[]
  
  @@index([slug])
  @@index([creatorId])
}

model ProjectMember {
  id        String  @id @default(uuid())
  role      MemberRole @default(MEMBER)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations
  userId    String
  user      User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  projectId String
  project   Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  @@unique([userId, projectId])
  @@index([projectId])
}

enum MemberRole {
  MEMBER
  EDITOR
  ADMIN
}

// ==================== ARTICLES ====================

model Article {
  id        String   @id @default(uuid())
  title     String
  slug      String   @unique
  content   String   @db.Text
  excerpt   String?
  coverImage String?
  status    ArticleStatus @default(DRAFT)
  viewCount Int      @default(0)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  publishedAt DateTime?
  
  // Relations
  authorId  String
  author    User     @relation("Author", fields: [authorId], references: [id])
  projectId String?
  project   Project? @relation(fields: [projectId], references: [id])
  
  comments    Comment[]
  tags        ArticleTag[]
  favorites   Favorite[]
  versions    ArticleVersion[]
  activities  Activity[]
  
  @@index([authorId])
  @@index([projectId])
  @@index([status])
  @@index([publishedAt])
}

enum ArticleStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

model ArticleVersion {
  id        String   @id @default(uuid())
  version   Int
  content   String   @db.Text
  changeLog String?
  
  createdAt DateTime @default(now())
  
  // Relations
  articleId String
  article   Article @relation(fields: [articleId], references: [id], onDelete: Cascade)
  
  @@unique([articleId, version])
  @@index([articleId])
}

// ==================== COMMENTS ====================

model Comment {
  id        String   @id @default(uuid())
  content   String   @db.Text
  isEdited  Boolean  @default(false)
  isDeleted Boolean  @default(false)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations
  authorId  String
  author    User    @relation(fields: [authorId], references: [id])
  articleId String
  article   Article @relation(fields: [articleId], references: [id], onDelete: Cascade)
  parentId  String?
  parent    Comment? @relation("CommentReplies", fields: [parentId], references: [id])
  replies   Comment[] @relation("CommentReplies")
  
  @@index([articleId])
  @@index([authorId])
  @@index([parentId])
}

// ==================== TAGS ====================

model Tag {
  id        String   @id @default(uuid())
  name      String   @unique
  slug      String   @unique
  color     String?  @default("#6B7280")
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations
  articles  ArticleTag[]
  
  @@index([slug])
}

model ArticleTag {
  id        String  @id @default(uuid())
  
  createdAt DateTime @default(now())
  
  // Relations
  articleId String
  article   Article @relation(fields: [articleId], references: [id], onDelete: Cascade)
  tagId     String
  tag       Tag     @relation(fields: [tagId], references: [id], onDelete: Cascade)
  
  @@unique([articleId, tagId])
  @@index([tagId])
}

// ==================== FAVORITES ====================

model Favorite {
  id        String   @id @default(uuid())
  
  createdAt DateTime @default(now())
  
  // Relations
  userId    String
  user      User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  articleId String
  article   Article @relation(fields: [articleId], references: [id], onDelete: Cascade)
  
  @@unique([userId, articleId])
  @@index([userId])
  @@index([articleId])
}

// ==================== ACTIVITY ====================

model Activity {
  id        String   @id @default(uuid())
  type      ActivityType
  metadata  Json?
  
  createdAt DateTime @default(now())
  
  // Relations
  userId    String
  user      User    @relation(fields: [userId], references: [id])
  articleId String?
  article   Article? @relation(fields: [articleId], references: [id])
  
  @@index([userId])
  @@index([type])
  @@index([createdAt])
}

enum ActivityType {
  ARTICLE_CREATED
  ARTICLE_UPDATED
  ARTICLE_PUBLISHED
  ARTICLE_DELETED
  COMMENT_CREATED
  COMMENT_DELETED
  PROJECT_CREATED
  PROJECT_UPDATED
  USER_JOINED
  USER_LEFT
  FAVORITE_ADDED
  FAVORITE_REMOVED
}
```

---

## 6. План Реализации по Этапам

### Этап 1: Backend Foundation — NestJS + Prisma + PostgreSQL + Auth

**Цель:** Настроить backend инфраструктуру, базу данных и систему аутентификации.

#### Задачи:

- [ ] **1.1** Создать структуру backend директории
  ```
  backend/
  ├── src/
  │   ├── main.ts
  │   ├── app.module.ts
  │   ├── common/
  │   ├── config/
  │   └── modules/auth/
  ├── prisma/
  │   └── schema.prisma
  ├── test/
  ├── .env
  ├── Dockerfile
  └── package.json
  ```

- [ ] **1.2** Настроить NestJS проект
  - Установить зависимости: `@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express`, `@nestjs/config`, `@nestjs/jwt`, `@nestjs/passport`, `@nestjs/swagger`
  - Настроить `nest-cli.json`
  - Настроить `tsconfig.json`

- [ ] **1.3** Настроить Prisma
  - Установить: `prisma`, `@prisma/client`
  - Создать `schema.prisma` с моделями User
  - Создать миграцию: `prisma migrate dev --name init`
  - Настроить PrismaService

- [ ] **1.4** Настроить PostgreSQL через Docker
  - Создать `docker-compose.yml` для PostgreSQL
  - Настроить переменные окружения в `.env`

- [ ] **1.5** Реализовать Auth модуль
  - `auth.controller.ts` — endpoints: POST /auth/register, POST /auth/login, POST /auth/refresh, POST /auth/logout
  - `auth.service.ts` — логика регистрации, логина, генерации токенов
  - `jwt.strategy.ts` — Passport JWT стратегия
  - `auth.guard.ts` — Guard для защиты routes
  - `dto/register.dto.ts`, `dto/login.dto.ts`, `dto/auth-response.dto.ts`

- [ ] **1.6** Настроить Swagger документацию
  - Настроить `SwaggerModule` в `main.ts`
  - Добавить декораторы `@ApiTags`, `@ApiOperation` к контроллерам

- [ ] **1.7** Добавить глобальные фильтры и интерсепторы
  - `http-exception.filter.ts` — обработка ошибок
  - `logging.interceptor.ts` — логирование запросов
  - `transform.interceptor.ts` — унификация ответов

#### Файлы для создания:

```
backend/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── common/
│   │   ├── filters/http-exception.filter.ts
│   │   ├── guards/jwt-auth.guard.ts
│   │   ├── interceptors/logging.interceptor.ts
│   │   ├── interceptors/transform.interceptor.ts
│   │   └── decorators/current-user.decorator.ts
│   ├── config/
│   │   ├── database.config.ts
│   │   └── jwt.config.ts
│   ├── prisma/
│   │   ├── prisma.service.ts
│   │   └── schema.prisma
│   └── modules/
│       └── auth/
│           ├── auth.module.ts
│           ├── auth.controller.ts
│           ├── auth.service.ts
│           ├── strategies/jwt.strategy.ts
│           ├── guards/auth.guard.ts
│           └── dto/
│               ├── register.dto.ts
│               ├── login.dto.ts
│               ├── refresh-token.dto.ts
│               └── auth-response.dto.ts
├── prisma/migrations/
├── test/auth.e2e-spec.ts
├── .env
├── .env.example
├── docker-compose.yml
├── Dockerfile
├── nest-cli.json
├── package.json
└── tsconfig.json
```

#### Критерии завершения:
- [ ] PostgreSQL запущен в Docker
- [ ] Prisma миграции работают
- [ ] Регистрация пользователя работает (POST /auth/register)
- [ ] Логин возвращает JWT токены (POST /auth/login)
- [ ] Refresh токена работает (POST /auth/refresh)
- [ ] Swagger доступен по адресу `/api`
- [ ] Покрыто unit тестами на 80%

---

### Этап 2: Users и Projects Модули

**Цель:** Реализовать управление пользователями и проектами.

#### Задачи:

- [ ] **2.1** Реализовать Users модуль
  - `users.controller.ts` — GET /users, GET /users/:id, PATCH /users/:id, DELETE /users/:id
  - `users.service.ts` — CRUD операции
  - `dto/update-user.dto.ts`, `dto/user-response.dto.ts`
  - Добавить загрузку аватара (multer)

- [ ] **2.2** Реализовать Projects модуль
  - `projects.controller.ts` — CRUD + управление участниками
  - `projects.service.ts` — бизнес-логика
  - `dto/create-project.dto.ts`, `dto/update-project.dto.ts`
  - `dto/project-member.dto.ts`

- [ ] **2.3** Добавить генерацию slug для проектов
  - Создать utility функцию `generateSlug()`
  - Использовать в сервисе перед сохранением

- [ ] **2.4** Добавить Roles Guard
  - `roles.guard.ts` — проверка роли пользователя
  - Декоратор `@Roles('ADMIN')`

#### Файлы для создания:

```
backend/src/modules/
├── users/
│   ├── users.module.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── dto/
│       ├── update-user.dto.ts
│       ├── user-response.dto.ts
│       └── avatar-upload.dto.ts
└── projects/
    ├── projects.module.ts
    ├── projects.controller.ts
    ├── projects.service.ts
    └── dto/
        ├── create-project.dto.ts
        ├── update-project.dto.ts
        ├── project-response.dto.ts
        └── project-member.dto.ts
```

#### Критерии завершения:
- [ ] CRUD пользователей работает
- [ ] Загрузка аватара работает
- [ ] CRUD проектов работает
- [ ] Добавление/удаление участников проекта работает
- [ ] Ролевая защита работает

---

### Этап 3: Articles и Comments Модули

**Цель:** Реализовать систему статей с версиями и древовидные комментарии.

#### Задачи:

- [ ] **3.1** Реализовать Articles модуль
  - `articles.controller.ts` — CRUD + статусы + публикация
  - `articles.service.ts` — логика с версиями
  - `dto/create-article.dto.ts`, `dto/update-article.dto.ts`
  - `article-version.service.ts` — управление версиями

- [ ] **3.2** Добавить генерацию slug для статей
  - Уникальный slug на основе title

- [ ] **3.3** Реализовать Comments модуль
  - `comments.controller.ts` — CRUD + древовидная структура
  - `comments.service.ts` — рекурсивное получение комментариев
  - `dto/create-comment.dto.ts`, `dto/comment-response.dto.ts`

- [ ] **3.4** Добавить счётчик просмотров
  - Increment viewCount при просмотре статьи

#### Файлы для создания:

```
backend/src/modules/
├── articles/
│   ├── articles.module.ts
│   ├── articles.controller.ts
│   ├── articles.service.ts
│   ├── article-version.service.ts
│   └── dto/
│       ├── create-article.dto.ts
│       ├── update-article.dto.ts
│       ├── article-response.dto.ts
│       └── article-version.dto.ts
└── comments/
    ├── comments.module.ts
    ├── comments.controller.ts
    ├── comments.service.ts
    └── dto/
        ├── create-comment.dto.ts
        ├── update-comment.dto.ts
        └── comment-response.dto.ts
```

#### Критерии завершения:
- [ ] CRUD статей работает
- [ ] Версии статей сохраняются при редактировании
- [ ] Публикация статей работает
- [ ] Древовидные комментарии работают
- [ ] Счётчик просмотров обновляется

---

### Этап 4: Tags и Favorites Модули

**Цель:** Реализовать систему тегов и избранное.

#### Задачи:

- [ ] **4.1** Реализовать Tags модуль
  - `tags.controller.ts` — CRUD тегов
  - `tags.service.ts` — логика + авто-создание тегов
  - `dto/create-tag.dto.ts`

- [ ] **4.2** Добавить связь Article-Tag (Many-to-Many)
  - `ArticleTag` модель в Prisma
  - Сервис для управления связями

- [ ] **4.3** Реализовать Favorites модуль
  - `favorites.controller.ts` — POST /favorites, DELETE /favorites/:articleId, GET /favorites
  - `favorites.service.ts` — toggle логика

#### Файлы для создания:

```
backend/src/modules/
├── tags/
│   ├── tags.module.ts
│   ├── tags.controller.ts
│   ├── tags.service.ts
│   └── dto/
│       ├── create-tag.dto.ts
│       └── tag-response.dto.ts
└── favorites/
    ├── favorites.module.ts
    ├── favorites.controller.ts
    ├── favorites.service.ts
    └── dto/
        └── favorite-response.dto.ts
```

#### Критерии завершения:
- [ ] CRUD тегов работает
- [ ] Привязка тегов к статьям работает
- [ ] Добавление в избранное работает
- [ ] Удаление из избранного работает
- [ ] Получение списка избранного работает

---

### Этап 5: Activity Модуль + WebSocket

**Цель:** Реализовать систему активности и real-time уведомления.

#### Задачи:

- [ ] **5.1** Реализовать Activity модуль
  - `activity.controller.ts` — GET /activity
  - `activity.service.ts` — логирование действий
  - `activity.entity.ts` — Prisma модель

- [ ] **5.2** Настроить WebSocket Gateway
  - `activity.gateway.ts` — WebSocket обработчик
  - Подключение клиентов к комнатам
  - Отправка событий при изменениях

- [ ] **5.3** Интегрировать с другими модулями
  - Вызов `activityService.log()` при создании/обновлении статей
  - Отправка WebSocket событий при новых комментариях

#### Файлы для создания:

```
backend/src/modules/
└── activity/
    ├── activity.module.ts
    ├── activity.gateway.ts
    ├── activity.service.ts
    └── dto/
        └── activity-response.dto.ts
```

#### Критерии завершения:
- [ ] Логирование активности работает
- [ ] WebSocket подключение работает
- [ ] Real-time уведомления приходят при новых комментариях
- [ ] API получения истории активности работает

---

### Этап 6: Frontend Setup — Vue + Router + Pinia + Auth + Pages

**Цель:** Настроить frontend инфраструктуру и базовые страницы.

#### Задачи:

- [ ] **6.1** Установить зависимости
  ```bash
  pnpm add vue-router pinia axios @vueuse/core
  pnpm add tailwindcss postcss autoprefixer
  pnpm add @tiptap/core @tiptap/starter-kit @tiptap/extension-placeholder
  pnpm add vee-validate yup
  pnpm add -D @types/node
  ```

- [ ] **6.2** Настроить Tailwind CSS
  - Создать `tailwind.config.js`
  - Создать `postcss.config.js`
  - Настроить `src/assets/styles/tailwind.css`

- [ ] **6.3** Настроить Vue Router
  - Создать `src/router/index.ts`
  - Определить routes
  - Настроить guards (auth guard)

- [ ] **6.4** Настроить Pinia
  - Создать `src/stores/auth.store.ts`
  - Создать `src/stores/ui.store.ts`

- [ ] **6.5** Создать API клиент
  - `src/api/axios.ts` — axios instance с interceptors
  - `src/api/auth.api.ts` — auth endpoints

- [ ] **6.6** Создать Layout компоненты
  - `Header.vue`, `Sidebar.vue`, `MainLayout.vue`

- [ ] **6.7** Создать Auth страницы
  - `LoginView.vue`, `RegisterView.vue`

- [ ] **6.8** Создать Common компоненты
  - `Button.vue`, `Input.vue`, `Modal.vue`, `Spinner.vue`, `Toast.vue`

#### Файлы для создания:

```
frontend/
├── src/
│   ├── main.ts (обновить)
│   ├── App.vue (обновить)
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.vue
│   │   │   ├── Input.vue
│   │   │   ├── Modal.vue
│   │   │   ├── Spinner.vue
│   │   │   └── Toast.vue
│   │   └── layout/
│   │       ├── Header.vue
│   │       ├── Sidebar.vue
│   │       └── MainLayout.vue
│   ├── composables/
│   │   └── useAuth.ts
│   ├── stores/
│   │   ├── auth.store.ts
│   │   └── ui.store.ts
│   ├── views/
│   │   ├── auth/
│   │   │   ├── LoginView.vue
│   │   │   └── RegisterView.vue
│   │   └── HomeView.vue
│   ├── router/
│   │   ├── index.ts
│   │   ├── routes.ts
│   │   └── guards.ts
│   ├── api/
│   │   ├── axios.ts
│   │   └── auth.api.ts
│   ├── types/
│   │   ├── models.ts
│   │   └── api.ts
│   ├── utils/
│   │   └── constants.ts
│   ├── assets/
│   │   └── styles/
│   │       ├── tailwind.css
│   │       └── variables.css
│   └── plugins/
│       └── vee-validate.ts
├── tailwind.config.js
├── postcss.config.js
├── .env
└── .env.example
```

#### Критерии завершения:
- [ ] Tailwind CSS настроен и работает
- [ ] Vue Router настроен с guards
- [ ] Pinia stores работают
- [ ] Axios instance с interceptors работает
- [ ] Страницы Login/Register работают
- [ ] Layout отображается корректно

---

### Этап 7: Frontend Integration — Подключение API

**Цель:** Интегрировать frontend с backend API.

#### Задачи:

- [ ] **7.1** Создать API модули для всех сущностей
  - `articles.api.ts`, `projects.api.ts`, `comments.api.ts`, `tags.api.ts`, `favorites.api.ts`, `activity.api.ts`

- [ ] **7.2** Создать Pinia stores для всех сущностей
  - `articles.store.ts`, `projects.store.ts`, `comments.store.ts`, `tags.store.ts`, `favorites.store.ts`, `activity.store.ts`

- [ ] **7.3** Создать composables
  - `useArticles.ts`, `useProjects.ts`, `useComments.ts`, `useTags.ts`, `useFavorites.ts`, `useActivity.ts`

- [ ] **7.4** Создать страницы статей
  - `ArticlesListView.vue`, `ArticleDetailView.vue`, `ArticleCreateView.vue`, `ArticleEditView.vue`

- [ ] **7.5** Создать страницы проектов
  - `ProjectsListView.vue`, `ProjectDetailView.vue`, `ProjectCreateView.vue`

- [ ] **7.6** Создать компоненты статей
  - `ArticleCard.vue`, `ArticleList.vue`, `ArticleEditor.vue` (с Tiptap)

- [ ] **7.7** Создать компоненты комментариев
  - `CommentList.vue`, `CommentItem.vue`, `CommentForm.vue`

- [ ] **7.8** Настроить WebSocket клиент
  - Создать composable `useWebSocket.ts`
  - Подключиться к activity gateway

#### Файлы для создания:

```
frontend/src/
├── api/
│   ├── articles.api.ts
│   ├── projects.api.ts
│   ├── comments.api.ts
│   ├── tags.api.ts
│   ├── favorites.api.ts
│   └── activity.api.ts
├── stores/
│   ├── articles.store.ts
│   ├── projects.store.ts
│   ├── comments.store.ts
│   ├── tags.store.ts
│   ├── favorites.store.ts
│   └── activity.store.ts
├── composables/
│   ├── useArticles.ts
│   ├── useProjects.ts
│   ├── useComments.ts
│   ├── useTags.ts
│   ├── useFavorites.ts
│   ├── useActivity.ts
│   └── useWebSocket.ts
├── views/
│   ├── articles/
│   │   ├── ArticlesListView.vue
│   │   ├── ArticleDetailView.vue
│   │   ├── ArticleCreateView.vue
│   │   └── ArticleEditView.vue
│   ├── projects/
│   │   ├── ProjectsListView.vue
│   │   ├── ProjectDetailView.vue
│   │   └── ProjectCreateView.vue
│   ├── tags/
│   │   └── TagsListView.vue
│   ├── favorites/
│   │   └── FavoritesView.vue
│   └── activity/
│       └── ActivityView.vue
└── components/
    ├── articles/
    │   ├── ArticleCard.vue
    │   ├── ArticleList.vue
    │   ├── ArticleEditor.vue
    │   └── ArticlePreview.vue
    ├── comments/
    │   ├── CommentList.vue
    │   ├── CommentItem.vue
    │   └── CommentForm.vue
    ├── projects/
    │   ├── ProjectCard.vue
    │   ├── ProjectList.vue
    │   └── ProjectForm.vue
    ├── tags/
    │   ├── TagInput.vue
    │   └── TagList.vue
    └── users/
        ├── UserAvatar.vue
        └── UserSelect.vue
```

#### Критерии завершения:
- [ ] Все API endpoints подключены
- [ ] Все stores работают с API
- [ ] Страницы отображают данные из API
- [ ] CRUD операции работают через UI
- [ ] WebSocket уведомления работают

---

### Этап 8: UI Polish и Улучшения

**Цель:** Улучшить пользовательский интерфейс и добавить финальные штрихи.

#### Задачи:

- [ ] **8.1** Добавить валидацию форм с VeeValidate
  - Формы логина/регистрации
  - Формы создания/редактирования статей
  - Формы комментариев

- [ ] **8.2** Добавить обработку ошибок
  - Глобальный error handler
  - Toast уведомления об ошибках
  - Retry логика для API запросов

- [ ] **8.3** Добавить loading состояния
  - Skeleton loaders для списков
  - Loading спиннеры для форм

- [ ] **8.4** Добавить темную тему
  - Toggle темы в header
  - Сохранение предпочтений в localStorage

- [ ] **8.5** Добавить responsive дизайн
  - Мобильная версия sidebar
  - Адаптивные таблицы и карточки

- [ ] **8.6** Добавить поиск и фильтрацию
  - Поиск по статьям
  - Фильтрация по тегам
  - Сортировка по дате/популярности

#### Критерии завершения:
- [ ] Все формы валидируются
- [ ] Ошибки отображаются в toast
- [ ] Loading состояния работают
- [ ] Темная тема переключается
- [ ] Mobile версия работает
- [ ] Поиск и фильтрация работают

---

### Этап 9: Docker и Развёртывание

**Цель:** Контейнеризировать приложение и настроить развёртывание.

#### Задачи:

- [ ] **9.1** Создать Dockerfile для backend
  - Multi-stage build
  - Production оптимизация

- [ ] **9.2** Создать Dockerfile для frontend
  - Nginx для serving static files
  - Build оптимизация

- [ ] **9.3** Настроить docker-compose.yml
  - Services: postgres, backend, frontend
  - Networks и volumes
  - Health checks

- [ ] **9.4** Настроить environment variables
  - `.env` для development
  - `.env.production` для production

- [ ] **9.5** Добавить CI/CD конфигурацию (опционально)
  - GitHub Actions workflow
  - Build и test шаги

#### Файлы для создания:

```
backend/
├── Dockerfile
└── .dockerignore

frontend/
├── Dockerfile
└── .dockerignore

docker-compose.yml
docker-compose.prod.yml
```

#### Критерии завершения:
- [ ] `docker-compose up` запускает всё приложение
- [ ] Backend доступен через контейнер
- [ ] Frontend доступен через nginx
- [ ] База данных персистентна
- [ ] Health checks работают

---

### Этап 10: Documentation и Финализация

**Цель:** Создать документацию и подготовить проект к production.

#### Задачи:

- [ ] **10.1** Обновить README.md
  - Описание проекта
  - Инструкция по запуску
  - Скриншоты

- [ ] **10.2** Создать API документацию
  - Swagger UI настроен
  - Примеры запросов/ответов

- [ ] **10.3** Создать руководство разработчика
  - Архитектурные решения
  - Стиль кода
  - Процесс добавления новых фич

- [ ] **10.4** Добавить seed данные
  - Script для тестовых данных
  - Admin пользователь по умолчанию

- [ ] **10.5** Финальное тестирование
  - E2E тесты критических путей
  - Performance тесты
  - Security check

#### Файлы для создания:

```
docs/
├── architecture.md
├── api-guide.md
└── development-guide.md

backend/prisma/seed.ts
README.md
```

#### Критерии завершения:
- [ ] README.md полный и понятный
- [ ] Swagger документация доступна
- [ ] Seed данные работают
- [ ] Все тесты проходят
- [ ] Приложение готово к production

---

## 7. Git Branching Strategy

### Веточная Модель

```
main (production)
  │
  ├── develop (integration)
  │     │
  │     ├── feature/1-backend-foundation
  │     ├── feature/2-users-projects
  │     ├── feature/3-articles-comments
  │     ├── feature/4-tags-favorites
  │     ├── feature/5-activity-websocket
  │     ├── feature/6-frontend-setup
  │     ├── feature/7-frontend-integration
  │     ├── feature/8-ui-polish
  │     ├── feature/9-docker
  │     └── feature/10-documentation
  │
  └── hotfix/*
```

### Порядок Слияния

| Шаг | Ветка | Описание | PR Title |
|-----|-------|----------|----------|
| 1 | `feature/1-backend-foundation` | Backend setup + Auth | "feat: Backend foundation with NestJS and Auth" |
| 2 | `feature/2-users-projects` | Users + Projects модули | "feat: Users and Projects modules" |
| 3 | `feature/3-articles-comments` | Articles + Comments | "feat: Articles and Comments modules" |
| 4 | `feature/4-tags-favorites` | Tags + Favorites | "feat: Tags and Favorites modules" |
| 5 | `feature/5-activity-websocket` | Activity + WebSocket | "feat: Activity tracking with WebSocket" |
| 6 | `feature/6-frontend-setup` | Vue setup + Auth pages | "feat: Frontend setup with Vue 3 and Auth" |
| 7 | `feature/7-frontend-integration` | API integration | "feat: Frontend API integration" |
| 8 | `feature/8-ui-polish` | UI improvements | "feat: UI polish and improvements" |
| 9 | `feature/9-docker` | Docker configuration | "feat: Docker containerization" |
| 10 | `feature/10-documentation` | Documentation | "docs: Complete documentation" |

### Команды Git

```bash
# Начало работы над новым этапом
git checkout develop
git pull origin develop
git checkout -b feature/N-step-name

# После завершения этапа
git add .
git commit -m "feat: описание изменений"
git push origin feature/N-step-name

# Создание PR (через GitHub UI)
# После approval:
git checkout develop
git pull origin develop
git merge feature/N-step-name
git push origin develop
```

---

## 8. Технические Детали

### 8.1 Стек Технологий

| Компонент | Технология | Версия | Обоснование |
|-----------|------------|--------|-------------|
| **Backend Runtime** | Node.js | 20 LTS | Стабильность, производительность |
| **Backend Framework** | NestJS | 10.x | Модульность, TypeScript-first, DI |
| **ORM** | Prisma | 5.x | Type-safety, миграции, developer experience |
| **Database** | PostgreSQL | 15+ | Надёжность, JSON support, full-text search |
| **Auth** | Passport + JWT | - | Стандарт индустрии, stateless |
| **API Docs** | Swagger/OpenAPI | - | Авто-документация, тестирование |
| **Frontend Framework** | Vue 3 | 3.4+ | Composition API, производительность |
| **Build Tool** | Vite | 5.x | Быстрый dev server, HMR |
| **State Management** | Pinia | 2.x | Официальный, TypeScript support |
| **Routing** | Vue Router | 4.x | Официальный, lazy loading |
| **HTTP Client** | Axios | 1.x | Interceptors, cancel requests |
| **CSS Framework** | Tailwind CSS | 3.x | Utility-first, customization |
| **Rich Text** | Tiptap | 2.x | Headless, расширяемый |
| **Form Validation** | VeeValidate + Yup | 4.x | Vue integration, schema validation |
| **Containerization** | Docker | 24+ | Переносимость, consistency |

### 8.2 Ключевые Интерфейсы

#### Backend DTOs

```typescript
// Auth
interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface LoginDto {
  email: string;
  password: string;
}

interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: UserResponseDto;
}

// Users
interface UserResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: Role;
  createdAt: Date;
}

// Articles
interface CreateArticleDto {
  title: string;
  content: string;
  excerpt?: string;
  projectId?: string;
  tagIds?: string[];
}

interface ArticleResponseDto {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  status: ArticleStatus;
  viewCount: number;
  author: UserResponseDto;
  project?: ProjectResponseDto;
  tags: TagResponseDto[];
  commentsCount: number;
  createdAt: Date;
  publishedAt?: Date;
}

// Comments
interface CreateCommentDto {
  content: string;
  articleId: string;
  parentId?: string;
}

// Projects
interface CreateProjectDto {
  name: string;
  description?: string;
  color?: string;
}
```

#### Frontend Types

```typescript
// models.ts
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: 'USER' | 'ADMIN' | 'MODERATOR';
  createdAt: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  viewCount: number;
  author: User;
  project?: Project;
  tags: Tag[];
  createdAt: string;
  publishedAt?: string;
}

export interface Comment {
  id: string;
  content: string;
  isEdited: boolean;
  author: User;
  replies: Comment[];
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  creator: User;
  members: ProjectMember[];
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  color: string;
}

// api.ts
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// forms.ts
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

export interface ArticleForm {
  title: string;
  content: string;
  excerpt?: string;
  projectId?: string;
  tags: string[];
  status: 'DRAFT' | 'PUBLISHED';
}
```

### 8.3 Environment Variables

#### Backend (.env)

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/knowledge_hub?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="your-refresh-secret-key"
JWT_REFRESH_EXPIRES_IN="7d"

# CORS
CORS_ORIGIN="http://localhost:5173"

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH="./uploads"
```

#### Frontend (.env)

```env
# API
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000

# App
VITE_APP_NAME="Knowledge Hub"
VITE_APP_VERSION=1.0.0
```

---

## 9. Риски и Митигация

| Риск | Вероятность | Влияние | Стратегия Митигации |
|------|-------------|---------|---------------------|
| **Сложность Prisma миграций** | Средняя | Высокое | Тестировать миграции на dev БД, использовать `prisma db seed` |
| **JWT token expiration** | Высокая | Среднее | Реализовать refresh token flow, auto-refresh в axios interceptor |
| **WebSocket connection drops** | Средняя | Среднее | Реализовать reconnection logic с exponential backoff |
| **Tiptap сложность интеграции** | Средняя | Низкое | Использовать starter kit, постепенное добавление extensions |
| **Performance при большом количестве статей** | Низкая | Высокое | Добавить pagination, индексы в БД, caching |
| **CORS issues** | Высокая | Низкое | Настроить CORS в NestJS с правильными origins |
| **Type mismatches между BE/FE** | Средняя | Среднее | Использовать shared types или OpenAPI generator |
| **Docker networking issues** | Средняя | Высокое | Использовать docker-compose networks, health checks |

---

## 10. Критерии Завершения

### Общие Критерии

- [ ] Все 10 этапов реализованы согласно спецификации
- [ ] Backend покрыт unit тестами на ≥80%
- [ ] Frontend покрыт unit тестами на ≥70%
- [ ] E2E тесты для критических user flows
- [ ] Swagger документация актуальна
- [ ] README.md содержит инструкцию по запуску
- [ ] Docker-compose запускает всё приложение одной командой
- [ ] Нет критических security vulnerabilities (npm audit)
- [ ] Приложение проходит basic performance тесты

### Критерии по Этапам

| Этап | Критерии Завершения |
|------|---------------------|
| 1 | Auth flow работает, Swagger доступен, Prisma миграции работают |
| 2 | Users CRUD работает, Projects CRUD работает, roles guard работает |
| 3 | Articles CRUD + версии работают, Comments древовидные работают |
| 4 | Tags CRUD работает, Favorites toggle работает |
| 5 | Activity logging работает, WebSocket уведомления работают |
| 6 | Vue app запускается, Router настроен, Auth страницы работают |
| 7 | Все API интегрированы, CRUD через UI работает |
| 8 | Валидация форм работает, темная тема работает, responsive OK |
| 9 | `docker-compose up` запускает всё, health checks проходят |
| 10 | Документация полная, seed данные работают, все тесты зелёные |

---

## 11. Чеклист Перед Началом Реализации

- [ ] Node.js 20 LTS установлен
- [ ] Docker Desktop установлен и запущен
- [ ] PNPM установлен (`npm install -g pnpm`)
- [ ] Git настроен
- [ ] IDE с поддержкой TypeScript (VS Code recommended)
- [ ] Расширения: Volar, ESLint, Prettier, Prisma, Docker

---

## 12. Быстрый Старт (для разработчика)

```bash
# 1. Клонировать репозиторий
git clone <repo-url>
cd docspace

# 2. Backend setup
cd backend
pnpm install
cp .env.example .env
# Edit .env with your settings
docker-compose up -d postgres
pnpm prisma migrate dev
pnpm prisma db seed
pnpm run start:dev

# 3. Frontend setup (в новом терминале)
cd frontend
pnpm install
cp .env.example .env
pnpm run dev

# 4. Открыть браузер
# Frontend: http://localhost:5173
# Backend API: http://localhost:3000
# Swagger: http://localhost:3000/api
```

---

*Документ создан: 25 марта 2026*
*Версия плана: 1.0*
*Статус: Готов к реализации*
