# backend/jobtracker/settings.py

import os
from pathlib import Path
from datetime import timedelta

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Automatically load environment variables from .env file if it exists
# to ensure local secrets like GEMINI_API_KEY or DATABASE_URL are imported.
for path in [BASE_DIR / '.env', BASE_DIR.parent / '.env']:
    if path.exists() and path.is_file():
        try:
            with open(path, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith('#'):
                        continue
                    if '=' in line:
                        key, val = line.split('=', 1)
                        key = key.strip()
                        val = val.strip()
                        # Clean quotes
                        if (val.startswith('"') and val.endswith('"')) or (val.startswith("'") and val.endswith("'")):
                            val = val[1:-1]
                        os.environ[key] = val
        except Exception as e:
            print(f"[ENV ENGINE] Warning: Error reading environment configuration at {path}: {e}")

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-your-secret-key-for-local-development-only'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['*']

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third-party utilities installed via pip
    'corsheaders',  # Essential for React-Django communication!
    'rest_framework',
    'rest_framework_simplejwt',
    
    # Our core custom app containing models and serializers unified in one project name
    'jobtracker.apps.JobtrackerConfig',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Should be as high as possible
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Serves frontends locally and remotely
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'jobtracker.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'static'],
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

WSGI_APPLICATION = 'jobtracker.wsgi.application'

# Database
# PostgreSQL database configurations as requested
import os

USE_POSTGRES = os.environ.get('USE_POSTGRES', 'True').lower() in ('true', '1', 't', 'y', 'yes')

if USE_POSTGRES:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.environ.get('POSTGRES_DB', 'jabtracker_app'),
            'USER': os.environ.get('POSTGRES_USER', 'postgres'),
            'PASSWORD': os.environ.get('POSTGRES_PASSWORD', 'postgres'),
            'HOST': os.environ.get('POSTGRES_HOST', 'localhost'),
            'PORT': os.environ.get('POSTGRES_PORT', '5432'),
        }
    }
    # Check if a combined DATABASE_URL is provided in the environment
    db_url = os.environ.get('DATABASE_URL')
    render_db_url = os.environ.get('RENDER_DATABASE_URL')
    
    # Use RENDER_DATABASE_URL if deployed, otherwise use DATABASE_URL
    if not db_url and render_db_url:
        db_url = render_db_url
    
    if db_url:
        try:
            import dj_database_url
            DATABASES['default'] = dj_database_url.parse(db_url, conn_max_age=600)
            db_host = DATABASES['default'].get('HOST', 'unknown')
            print(f"[DATABASE ENGINE] Successfully configured default database from DATABASE_URL. Host: {db_host}, Engine: {DATABASES['default'].get('ENGINE')}")
        except Exception as parse_err:
            print(f"[DATABASE ENGINE] Error importing or parsing via dj_database_url: {parse_err}. Trying fallback parser...")
            # Fallback manual parsing in case dj_database_url is not ready
            try:
                # format: postgresql://username:password@hostname:port/dbname
                url = db_url
                if url.startswith('postgres://'):
                    url = url.replace('postgres://', '', 1)
                elif url.startswith('postgresql://'):
                    url = url.replace('postgresql://', '', 1)
                
                user_pass, host_port_db = url.split('@', 1)
                if ':' in user_pass:
                    user, password = user_pass.split(':', 1)
                else:
                    user = user_pass
                    password = ''
                
                if '/' in host_port_db:
                    host_port, db_name = host_port_db.split('/', 1)
                else:
                    host_port = host_port_db
                    db_name = ''
                
                if '?' in db_name:
                    db_name = db_name.split('?', 1)[0]
                
                if ':' in host_port:
                    host, port = host_port.split(':', 1)
                else:
                    host = host_port
                    port = '5432'
                
                DATABASES['default'] = {
                    'ENGINE': 'django.db.backends.postgresql',
                    'NAME': db_name,
                    'USER': user,
                    'PASSWORD': password,
                    'HOST': host,
                    'PORT': port,
                }
                print(f"[DATABASE ENGINE] Successfully applied manual URL fallback configuration. Host: {host}")
            except Exception as e:
                print(f"[DB PARSER FALLBACK] Error parsing fallback URL: {e}")
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATICFILES_DIRS = [
    BASE_DIR / 'static',
]
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Compress and cache static assets
STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# CORS configuration to allow local React app to connect
CORS_ALLOW_ALL_ORIGINS = True  # For local development convenience

# Tell Django REST Framework to default to JWT authentications for any login endpoints.
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    )
}

# Set up JWT Token lifespans and security configs
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}