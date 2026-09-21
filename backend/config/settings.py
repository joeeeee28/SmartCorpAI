"""SmartCorp AI — Django settings (Phase 1: auth, orgs, RBAC, knowledge)."""
import os
from datetime import timedelta
from pathlib import Path

import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent


def load_dotenv(path: Path) -> None:
    """Minimal .env loader (no extra dependency). Real env vars always win."""
    if not path.exists():
        return
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith('#') or '=' not in line:
            continue
        key, _, value = line.partition('=')
        os.environ.setdefault(key.strip(), value.strip())


load_dotenv(BASE_DIR / '.env')


def env_bool(name: str, default: bool = False) -> bool:
    return os.environ.get(name, str(default)).lower() in ('1', 'true', 'yes')


SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-only-insecure-key')
DEBUG = env_bool('DEBUG', True)
ALLOWED_HOSTS = [h.strip() for h in os.environ.get('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',') if h.strip()]

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'rest_framework',
    'rest_framework_simplejwt.token_blacklist',
    'pgvector.django',
    'accounts',
    'organizations',
    'knowledge',
    'rag',
    'agents',
    'workflows',
    'evaluations',
    'analytics',
    'audit',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'
WSGI_APPLICATION = 'config.wsgi.application'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

DATABASES = {
    'default': dj_database_url.parse(
        os.environ.get('DATABASE_URL', 'postgres://postgres:postgres@127.0.0.1:5432/smartcorp'),
        conn_max_age=60,
        test_options={'CHARSET': 'UTF8'} if False else None,
    )
}

AUTH_USER_MODEL = 'accounts.User'
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', 'OPTIONS': {'min_length': 8}},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_TZ = True
STATIC_URL = 'static/'
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

CORS_ALLOWED_ORIGINS = [o.strip() for o in os.environ.get('CORS_ALLOWED_ORIGINS', 'http://localhost:5173').split(',') if o.strip()]
CORS_ALLOW_CREDENTIALS = True

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': ('rest_framework_simplejwt.authentication.JWTAuthentication',),
    'DEFAULT_PERMISSION_CLASSES': ('rest_framework.permissions.IsAuthenticated',),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 50,
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

CELERY_BROKER_URL = os.environ.get('REDIS_URL', 'redis://127.0.0.1:6379/0')
CELERY_RESULT_BACKEND = CELERY_BROKER_URL
# Eager mode runs tasks inline (dev/tests without a worker). Production sets CELERY_EAGER=False with Redis + worker.
CELERY_TASK_ALWAYS_EAGER = env_bool('CELERY_EAGER', True)
CELERY_TASK_EAGER_PROPAGATES = True
CELERY_TIMEZONE = 'UTC'

FILE_UPLOAD_MAX_MEMORY_SIZE = 50 * 1024 * 1024  # 50 MB

# Phase 2+ hooks (RAG/LLM). Empty until wired.
LLM_API_KEY = os.environ.get('LLM_API_KEY', '')
EMBEDDING_PROVIDER = os.environ.get('EMBEDDING_PROVIDER', 'local')
EMBEDDING_API_KEY = os.environ.get('EMBEDDING_API_KEY', '')
EMBEDDING_MODEL = os.environ.get('EMBEDDING_MODEL', 'text-embedding-3-small')
EMBEDDING_DIMENSIONS = 1536
LLM_MODEL = os.environ.get('LLM_MODEL', 'gpt-4o-mini')
