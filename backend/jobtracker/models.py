# backend/jobtracker/models.py

from django.db import models
from django.contrib.auth.models import User

class JobApplication(models.Model):
    # Definition of the distinct workflow phases of a job application.
    STATUS_CHOICES = [
        ('APPLIED', 'Applied'),
        ('INTERVIEW', 'Interview'),
        ('OFFER', 'Offer'),
        ('REJECTED', 'Rejected'),
    ]

    # Every job application must belong to a specific registered user.
    # On deleting a user, all associated records are cascadingly deleted.
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='applications'
    )
    
    company = models.CharField(max_length=255)
    role = models.CharField(max_length=255)
    source = models.CharField(max_length=100, blank=True, null=True)
    date_applied = models.DateField(auto_now_add=True)
    
    # Maintain state constraint using status options
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='APPLIED'
    )
    
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.role} at {self.company}"
