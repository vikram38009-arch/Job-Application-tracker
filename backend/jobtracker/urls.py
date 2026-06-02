# backend/jobtracker/urls.py

from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from rest_framework.routers import DefaultRouter
from jobtracker.views import JobApplicationViewSet, register_user, CustomTokenObtainPairView, JobApplicationStatsView, ai_analyze_view
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)

# Create a master router. It automatically sets up standard CRUD endpoints for our viewset.
router = DefaultRouter()
router.register(r'applications', JobApplicationViewSet, basename='jobapplication')

def api_root_view(request):
    return JsonResponse({
        "status": "success",
        "message": "Welcome to the JobTracker Django REST API backend! It is running perfectly.",
        "endpoints": {
            "api_root": "/api/",
            "applications_list": "/api/applications/ [Authentication required via Bearer JWT]",
            "token_login": "/api/token/ [POST username & password to receive credentials]",
            "token_refresh": "/api/token/refresh/ [POST refresh token to rotate credentials]",
            "admin_panel": "/admin/"
        }
    })

urlpatterns = [
    # Root path welcome message
    path('', api_root_view, name='api_root_welcome'),
    
    path('admin/', admin.site.urls),
    
    # 1. Mount stats endpoint
    path('api/applications/stats/', JobApplicationStatsView.as_view(), name='application_stats'),

    # AI Analyze endpoint
    path('api/applications/ai-analyze/', ai_analyze_view, name='ai_analyze'),

    # 1. Mount our router API endpoints at /api/ (e.g. /api/applications/)
    path('api/', include(router.urls)),
    
    # 2. JWT Authentication login route. React will POST username & password here to receive tokens.
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    
    # 3. Refresh expired login sessions using a secret refresh token.
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # 4. Active Register (User Signup) route.
    path('api/register/', register_user, name='register'),
]

