# Knowledge Hub

**Knowledge Hub** — это полнофункциональная full-stack платформа для управления знаниями команды, похожая на Notion или Confluence. Приложение позволяет создавать проекты, писать статьи, комментировать, управлять тегами и избранным, а также отслеживать активность.

## 🚀 Технологии

### Backend
- **NestJS** — модульный Node.js фреймворк
- **TypeScript** — типизированный JavaScript
- **PostgreSQL** — реляционная база данных
- **Prisma** — ORM для работы с БД
- **JWT** — аутентификация через токены
- **Swagger** — API документация
- **WebSocket** — real-time уведомления

### Frontend
- **Vue 3** — реактивный фреймворк
- **Composition API** — современный подход к написанию компонентов
- **TypeScript** — полная типизация
- **Pinia** — управление состоянием
- **Vue Router** — навигация между страницами
- **Axios** — HTTP клиент
- **Tailwind CSS** — утилитарные стили
- **VeeValidate** — валидация форм

## 📋 Требования

- Node.js 20+
- PostgreSQL 15+
- Docker (опционально)
- pnpm (рекомендуется) или npm

## 🛠️ Установка и запуск

### Backend

```bash
cd backend

# Установка зависимостей
pnpm install

# Копирование переменных окружения
cp .env.example .env

# Запуск PostgreSQL (через Docker)
docker-compose up -d postgres

# Применение миграций
pnpm prisma migrate dev

# Запуск в режиме разработки
pnpm run start:dev

# Swagger документация: http://localhost:3000/api
```

### Frontend

```bash
cd frontend # или корень проекта для текущего проекта

# Установка зависимостей
pnpm install

# Копирование переменных окружения
cp .env.example .env

# Запуск в режиме разработки
pnpm run dev

# Приложение доступно по адресу: http://localhost:5173
```

## 📁 Структура проекта

```
docspace/
├── backend/                    # NestJS backend
│   ├── src/
│   │   ├── modules/           # Бизнес-модули
│   │   │   ├── auth/         # Аутентификация
│   │   │   ├── users/        # Пользователи
│   │   │   ├── projects/     # Проекты
│   │   │   ├── articles/     # Статьи
│   │   │   ├── comments/     # Комментарии
│   │   │   ├── tags/         # Теги
│   │   │   ├── favorites/    # Избранное
│   │   │   └── activity/     # Активность + WebSocket
│   │   ├── common/           # Общие утилиты
│   │   ├── config/           # Конфигурация
│   │   └── prisma/           # Prisma сервис
│   └── prisma/
│       └── schema.prisma     # Схема БД
│
├── src/                       # Vue 3 frontend
│   ├── api/                  # API клиенты
│   ├── components/           # Переиспользуемые компоненты
│   ├── composables/          # Composition API функции
│   ├── stores/               # Pinia stores
│   ├── views/                # Страницы
│   ├── router/               # Маршрутизация
│   ├── types/                # TypeScript типы
│   └── assets/               # Статические ресурсы
│
└── docker-compose.yml        # Docker конфигурация
```

## 🔑 API Endpoints

### Аутентификация
| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | `/api/auth/register` | Регистрация пользователя |
| POST | `/api/auth/login` | Вход в систему |
| POST | `/api/auth/refresh` | Обновление токена |
| POST | `/api/auth/logout` | Выход из системы |

### Пользователи
| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/users/me` | Текущий пользователь |
| GET | `/api/users/:id` | Пользователь по ID |
| PATCH | `/api/users/me` | Обновление профиля |
| DELETE | `/api/users/me` | Удаление аккаунта |

### Проекты
| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | `/api/projects` | Создать проект |
| GET | `/api/projects` | Список проектов |
| GET | `/api/projects/:id` | Проект по ID |
| PATCH | `/api/projects/:id` | Обновить проект |
| DELETE | `/api/projects/:id` | Удалить проект |
| POST | `/api/projects/:id/members` | Добавить участника |
| DELETE | `/api/projects/:id/members/:memberId` | Удалить участника |

### Статьи
| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | `/api/articles` | Создать статью |
| GET | `/api/articles` | Список статей |
| GET | `/api/articles/my` | Мои статьи |
| GET | `/api/articles/:id` | Статья по ID |
| PATCH | `/api/articles/:id` | Обновить статью |
| DELETE | `/api/articles/:id` | Удалить статью |

### Комментарии
| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | `/api/comments` | Создать комментарий |
| GET | `/api/comments/article/:id` | Комментарии к статье |
| PATCH | `/api/comments/:id` | Обновить комментарий |
| DELETE | `/api/comments/:id` | Удалить комментарий |

### Теги
| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | `/api/tags` | Создать тег |
| GET | `/api/tags` | Список тегов |
| GET | `/api/tags/popular` | Популярные теги |
| DELETE | `/api/tags/:id` | Удалить тег |

### Избранное
| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | `/api/favorites/:articleId` | Добавить в избранное |
| DELETE | `/api/favorites/:articleId` | Удалить из избранного |
| GET | `/api/favorites` | Список избранного |

### Активность
| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/activity` | Лента активности |
| GET | `/api/activity/global` | Глобальная активность |

## 🗄️ Схема базы данных

### Основные модели

- **User** — пользователи с ролями (USER, ADMIN, MODERATOR)
- **Project** — проекты с участниками
- **ProjectMember** — связь пользователей с проектами
- **Article** — статьи с версиями и статусами
- **ArticleVersion** — история версий статей
- **Comment** — комментарии с древовидной структурой
- **Tag** — теги для категоризации
- **ArticleTag** — связь статей с тегами
- **Favorite** — избранные статьи
- **Activity** — лог активности

## 🔐 Роли и разрешения

| Роль | Описание |
|------|----------|
| **ADMIN** | Полный доступ ко всем ресурсам |
| **MODERATOR** | Модерация контента |
| **USER** | Базовый доступ |

## 👤 Тестовые пользователи

После запуска сидов (`pnpm prisma:seed`) доступны следующие пользователи:

| Email | Пароль | Роль |
|-------|--------|------|
| `admin@example.com` | `password123` | ADMIN |
| `user@example.com` | `password123` | USER |

## 🎨 Компоненты UI

### Layout
- **MainLayout** — основная раскладка с sidebar и header
- **Header** — шапка с поиском и профилем
- **Sidebar** — боковая навигация

### Страницы
- **Login/Register** — аутентификация
- **Home** — главная страница
- **Projects** — список проектов
- **Project Detail** — страница проекта
- **Articles** — список статей
- **Article Detail** — страница статьи
- **Article Create/Edit** — редактор статей
- **Favorites** — избранные статьи
- **Activity** — лента активности
- **Profile** — профиль пользователя

## 🔧 Переменные окружения

### Backend (.env)
```env
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/knowledge_hub
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000
```

## 📦 Docker

### Запуск всех сервисов

```bash
docker-compose up -d
```

### Сервисы
- **postgres** — база данных PostgreSQL
- **backend** — NestJS API сервер
- **frontend** — Vue 3 приложение

## 🧪 Тестирование

```bash
# Backend тесты
cd backend
pnpm run test
pnpm run test:e2e

# Frontend тесты
cd frontend
pnpm run test
```

## 📝 Лицензия

MIT

## 👥 Авторы

Knowledge Hub — учебный проект для демонстрации full-stack разработки.
