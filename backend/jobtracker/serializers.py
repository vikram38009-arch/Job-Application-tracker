# backend/jobtracker/serializers.py

from rest_framework import serializers
from .models import JobApplication

class JobApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobApplication
        # Serialize all fields so they can be securely sent to our React app
        fields = [
            'id', 
            'user', 
            'company', 
            'role', 
            'source', 
            'date_applied', 
            'status', 
            'notes'
        ]
        # These fields are managed by the database/auth; the user cannot modify them directly.
        read_only_fields = ['id', 'user', 'date_applied']
