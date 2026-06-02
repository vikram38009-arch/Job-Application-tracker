# backend/jobtracker/wsgi.py

import os
import sys
from pathlib import Path

# Make import path resilient to resolve local search path errors
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'jobtracker.settings')
application = get_wsgi_application()
