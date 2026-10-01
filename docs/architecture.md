# Архитектура Knowledge Hub

## Обзор

Knowledge Hub построен по принципу модульного монолита с четким разделением на backend (NestJS) и frontend (Vue 3).

## Архитектурные принципы

### 1. Разделение ответственности

- **Backend**: API, бизнес-логика, работа с данными
- **Frontend**: UI, клиентская логика, состояние

### 2. Модульность

Каждый домен (auth, users, projects, articles, etc.) выделен в отдельный модуль с собственной структурой:

```
module/
├── controller.ts    # HTTP endpoints
├── service.ts       # Бизнес-логика
├── dto/            # Data Transfer Objects
└── module.ts       # Модуль NestJS
```

### 3. Слои приложения

#### Backend слои:

1. **Controller Layer** - обработка HTTP запросов
2. **Service Layer** - бизнес-логика
3. **Repository Layer** (Prisma) - работа с данными
4. **Entity Layer** - модели данных

#### Frontend слои:

1. **View Layer** (Vue Components) - UI
2. **Store Layer** (Pinia) - состояние
3. **API Layer** - взаимодействие с backend
4. **Composables** - переиспользуемая логика

## Диаграмма компонентов

```
┌─────────────────────────────────────────────────────────┐
│                    Client (Browser)                      │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Vue 3 Frontend                        │  │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ │  │
│  │  │ Views   │ │Components│ │ Stores  │ │  API    │ │  │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                         │
                         │ HTTP/REST + WebSocket
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   NestJS Backend                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │                 API Gateway                        │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │  Auth   │ │ Users   │ │Projects │ │Articles │  ...  │
│  │ Module  │ │ Module  │ │ Module  │ │ Module  │       │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘       │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Prisma ORM                            │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                         │
                         │ SQL
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  PostgreSQL Database                     │
│  ┌───────┐ ┌────────┐ ┌─────────┐ ┌──────────┐        │
│  │ Users │ │Projects│ │Articles │ │Comments  │  ...   │
│  └───────┘ └────────┘ └─────────┘ └──────────┘        │
└─────────────────────────────────────────────────────────┘
```

## Поток данных

### Авторизация

```
1. User → Login Form → Credentials
2. Frontend → POST /api/auth/login → Backend
3. Backend → Validate → Generate JWT → Return tokens
4. Frontend → Store tokens → Redirect to home
5. Subsequent requests → Authorization: Bearer <token>
```

### Создание статьи

```
1. User → Article Form → Content
2. Frontend → POST /api/articles → Backend
3. Backend → Validate → Create Article → Create Version
4. Backend → Log Activity → WebSocket Broadcast
5. Frontend → Update Store → Redirect to article
```

## Безопасность

### Аутентификация

- JWT токены (access + refresh)
- Access token: 15 минут
- Refresh token: 7 дней
- Bcrypt хеширование паролей

### Авторизация

- Role-based access control (RBAC)
- Guards для защиты endpoints
- Проверка прав на уровне сервиса

### Валидация

- Class-validator DTO
- Whitelist полей
- Запрет non-whitelisted полей

## Масштабируемость

### Горизонтальное масштабирование

- Stateless backend (JWT)
- PostgreSQL репликация
- Redis для сессий (опционально)

### Вертикальное масштабирование

- Кэширование запросов
- Индексы базы данных
- Pagination для списков

## Мониторинг

### Логирование

- Request/Response логи
- Ошибки с контекстом
- Activity tracking

### Метрики

- Количество запросов
- Время ответа
- Ошибки по типам

## Развертывание

### Development

```bash
docker-compose up -d
```

### Production

1. Build frontend
2. Build backend
3. Migrate database
4. Start services

## Тестирование

### Backend

- Unit тесты (сервисы)
- Integration тесты (контроллеры)
- E2E тесты (API)

### Frontend

- Component тесты
- E2E тесты (критические пути)
