from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView

from . import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('auth/', include('accounts.urls')),
    path('organizations/', include('organizations.urls')),
    path('inventory/', include('inventory.urls')),
    path('pos/', include('pos.urls')),
    path('patients/', include('patients.urls')),
    path('expenses/', include('expenses.urls')),
    path('', views.api_status),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
