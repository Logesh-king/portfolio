from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.http import JsonResponse
from django.conf.urls.static import static
from django.views.static import serve
from api.views import CustomAuthToken

def home(request):
    return JsonResponse({
        "status": "success",
        "message": "Portfolio Backend API Running"
    })

urlpatterns = [
    path('', home, name='home'),
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('api/auth/token/', CustomAuthToken.as_view(), name='api_token_auth'),
]

# Serve media files in both development and production (fallback for Render)
urlpatterns += [
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

