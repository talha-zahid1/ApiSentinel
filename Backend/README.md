# ApiSentinel — API Key Management Service

A Django REST Framework service that acts as an authentication layer for other APIs. Developers register their apps, generate API keys, rotate/revoke them, enforce rate limits, and monitor usage analytics.

---

## Features

- App registration with secure API key generation
- Token hashing — plaintext keys are never stored
- Custom DRF authentication backend
- Middleware for request interception on all protected routes
- Per-key rate limiting (requests per minute)
- Key rotation and revocation with full verification
- Usage analytics per key

---

## Tech Stack

- Python / Django 6.x
- Django REST Framework
- SimpleJWT (for admin/generate endpoints)
- `django.contrib.auth.hashers` for key hashing

---

## Setup

```bash
git clone <repo-url>
cd ApiSentinel

python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux

pip install -r requirements.txt

python manage.py migrate
python manage.py runserver
```

---

## Environment / Settings

```python
# settings.py

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=30),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
}

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

MIDDLEWARE = [
    ...
    'app1.middleware.Middleware',  # API key interception
]
```

---

## API Endpoints

### Auth

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/ApiSentinel/register/` | Register a new user | Public |
| POST | `/ApiSentinel/api/token/` | Obtain JWT token | Public |
| POST | `/ApiSentinel/api/token/refresh/` | Refresh JWT token | Public |

### API Key Management

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/ApiSentinel/get_api_key/` | Register app and generate API key | Public |
| GET | `/ApiSentinel/get_api_key/` | Rotate existing API key | `X-Api-Key` |
| GET | `/ApiSentinel/revoke/` | Revoke (disable) an API key | `X-Api-Key` |

### Usage

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/ApiSentinel/protected/` | Example protected route | `X-Api-Key` |
| GET | `/ApiSentinel/analytics/` | View usage analytics for your key | `X-Api-Key` |

---

## Authentication

All protected endpoints require the API key to be sent in a custom header:

```
X-Api-Key: <your_api_key>
```

The `Authorization: Bearer <jwt>` header is used only for key generation endpoints.

---

## Key Format

Keys follow the format: `prefix.secret`

```
BMXi8Y90.T5-ttM3PmQLSFfaI62acBbAWvBzoUMJ0eCi3UuPo8c0
```

Only the prefix is stored in plaintext for lookup. The full key is hashed using Django's `make_password` and verified with `check_password`.

---

## Middleware

The middleware intercepts every request:

1. Checks if the route is public — if so, passes through
2. Reads `X-Api-Key` header
3. Looks up key by prefix, verifies hash
4. Checks rate limit (requests per minute)
5. If all pass, forwards the request and logs analytics

**Public routes (no key required):**
```
/ApiSentinel/register/
/ApiSentinel/api/token/
/ApiSentinel/api/token/refresh/
/ApiSentinel/get_api_key/
```

---

## Rate Limiting

Each API key has a `rate_limit` field (default: 30 requests/minute). The middleware counts recent requests from the `analytics` table and blocks with `429`-style response if exceeded.

---

## Analytics Response

```json
{
    "total_requests": 5,
    "requests_per_day": [
        { "path": "/ApiSentinel/protected/", "total": 2 }
    ],
    "top_endpoints": [
        { "path": "/ApiSentinel/analytics/", "total": 3 },
        { "path": "/ApiSentinel/protected/", "total": 2 }
    ],
    "failed_requests": [
        { "path": "/ApiSentinel/analytics/", "total": 1 }
    ]
}
```

---

## Project Structure

```
ApiSentinel/
├── app1/
│   ├── views/
│   │   └── Apiviews.py       # All API views
│   ├── authentication.py     # Custom ApiKeyAuthentication backend
│   ├── middleware.py         # Request interception + rate limiting
│   ├── models.py             # App, Api_key, analytics models
│   ├── serializer.py         # App serializer
│   └── urls.py
├── Api/
│   └── settings.py
└── manage.py
```

---

## Possible Extensions

- Pagination and filtering on analytics (`django-filter`)
- Webhook support on key events (expiry, rate limit hit)
- Key scopes/permissions (read-only, write, admin)
- SDK usage examples
- Key expiry notifications
