#!/bin/bash
set -e

# Install dependencies
pip install -r requirements.txt

# Run migrations
cd backend
python manage.py migrate --noinput
python manage.py collectstatic --noinput
cd ..

echo "Build complete!"
