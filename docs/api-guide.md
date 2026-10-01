# API Документация Knowledge Hub

Базовый URL: `http://localhost:3000/api`

## Аутентификация

Все запросы, кроме указанных, требуют JWT токен в заголовке:
```
Authorization: Bearer <access_token>
```

---

## Auth Endpoints

### POST /auth/register

Регистрация нового пользователя.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "USER"
    }
  }
}
```

### POST /auth/login

Вход в систему.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "USER"
    }
  }
}
```

### POST /auth/refresh

Обновление access токена.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

### POST /auth/logout

Выход из системы.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {}
}
```

---

## Users Endpoints

### GET /users/me

Получение текущего пользователя.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "avatar": "https://...",
    "bio": "Developer",
    "role": "USER",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### PATCH /users/me

Обновление профиля.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "firstName": "Jane",
  "bio": "Senior Developer"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "Jane",
    "lastName": "Doe",
    "bio": "Senior Developer",
    "role": "USER"
  }
}
```

---

## Projects Endpoints

### POST /projects

Создание проекта.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "My Project",
  "description": "Project description",
  "color": "#3B82F6"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "My Project",
    "slug": "my-project-1234567890",
    "color": "#3B82F6",
    "creatorId": "uuid",
    "members": [],
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### GET /projects

Получение списка проектов.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "uuid",
        "name": "My Project",
        "slug": "my-project",
        "color": "#3B82F6",
        "members": [],
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "meta": {
      "total": 10,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

### GET /projects/:id

Получение проекта по ID.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "My Project",
    "description": "Description",
    "slug": "my-project",
    "color": "#3B82F6",
    "creator": {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe"
    },
    "members": [
      {
        "id": "uuid",
        "userId": "uuid",
        "role": "MEMBER",
        "user": {
          "firstName": "Jane",
          "lastName": "Doe"
        }
      }
    ]
  }
}
```

### POST /projects/:id/members

Добавление участника в проект.

**Request Body:**
```json
{
  "userId": "uuid",
  "role": "MEMBER"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "projectId": "uuid",
    "role": "MEMBER",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

## Articles Endpoints

### POST /articles

Создание статьи.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Getting Started",
  "content": "# Welcome\n\nContent here...",
  "excerpt": "Brief summary",
  "projectId": "uuid",
  "status": "DRAFT",
  "tagIds": ["uuid1", "uuid2"]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Getting Started",
    "slug": "getting-started-1234567890",
    "content": "# Welcome\n\nContent here...",
    "status": "DRAFT",
    "viewCount": 0,
    "author": {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe"
    },
    "tags": [
      {
        "id": "uuid",
        "name": "TypeScript",
        "color": "#3178C6"
      }
    ],
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### GET /articles

Получение списка статей.

**Query Parameters:**
- `projectId` (string, optional)
- `authorId` (string, optional)
- `status` (string, optional: DRAFT|PUBLISHED|ARCHIVED)
- `tagId` (string, optional)
- `search` (string, optional)
- `page` (number, default: 1)
- `limit` (number, default: 10)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "uuid",
        "title": "Getting Started",
        "slug": "getting-started",
        "excerpt": "Brief summary",
        "status": "PUBLISHED",
        "viewCount": 100,
        "author": {
          "firstName": "John",
          "lastName": "Doe"
        },
        "tags": [],
        "commentsCount": 5,
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "meta": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "totalPages": 5
    }
  }
}
```

### GET /articles/:id

Получение статьи по ID.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Getting Started",
    "content": "# Welcome\n\nFull content...",
    "status": "PUBLISHED",
    "viewCount": 101,
    "author": {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    },
    "project": {
      "id": "uuid",
      "name": "Knowledge Base"
    },
    "tags": [
      {
        "id": "uuid",
        "name": "TypeScript",
        "slug": "typescript",
        "color": "#3178C6"
      }
    ],
    "commentsCount": 5,
    "createdAt": "2024-01-01T00:00:00Z",
    "publishedAt": "2024-01-01T00:00:00Z"
  }
}
```

---

## Comments Endpoints

### POST /comments

Создание комментария.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "content": "Great article!",
  "articleId": "uuid",
  "parentId": "uuid" // optional, для ответов
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "content": "Great article!",
    "isEdited": false,
    "author": {
      "id": "uuid",
      "firstName": "Jane",
      "lastName": "Doe"
    },
    "articleId": "uuid",
    "parentId": null,
    "replies": [],
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### GET /comments/article/:articleId

Получение комментариев к статье.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "content": "Great article!",
      "author": {
        "firstName": "Jane",
        "lastName": "Doe"
      },
      "replies": [
        {
          "id": "uuid",
          "content": "Thanks!",
          "author": {
            "firstName": "John",
            "lastName": "Doe"
          }
        }
      ]
    }
  ]
}
```

---

## Tags Endpoints

### GET /tags

Получение списка тегов.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "uuid",
        "name": "TypeScript",
        "slug": "typescript",
        "color": "#3178C6",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "meta": {
      "total": 10,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

### GET /tags/popular

Получение популярных тегов.

**Query Parameters:**
- `limit` (number, default: 10)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "TypeScript",
      "slug": "typescript",
      "color": "#3178C6"
    }
  ]
}
```

---

## Favorites Endpoints

### POST /favorites/:articleId

Добавление статьи в избранное.

**Headers:** `Authorization: Bearer <token>`

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "articleId": "uuid",
    "articleTitle": "Getting Started",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### GET /favorites

Получение списка избранного.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "uuid",
        "articleId": "uuid",
        "articleTitle": "Getting Started",
        "articleSlug": "getting-started",
        "authorName": "John Doe",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "meta": {
      "total": 5,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

---

## Activity Endpoints

### GET /activity

Получение ленты активности пользователя.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "uuid",
        "type": "ARTICLE_CREATED",
        "user": {
          "id": "uuid",
          "firstName": "John",
          "lastName": "Doe"
        },
        "articleId": "uuid",
        "articleTitle": "Getting Started",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "meta": {
      "total": 100,
      "page": 1,
      "limit": 20,
      "totalPages": 5
    }
  }
}
```

---

## Коды ошибок

| Код | Описание |
|-----|----------|
| 200 | Успех |
| 201 | Создано |
| 400 | Неправильный запрос |
| 401 | Неавторизован |
| 403 | Запрещено |
| 404 | Не найдено |
| 409 | Конфликт |
| 500 | Внутренняя ошибка |

## Формат ошибок

```json
{
  "statusCode": 400,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/articles",
  "method": "POST",
  "error": "Bad Request",
  "message": ["title must be longer than 5 characters"]
}
```
