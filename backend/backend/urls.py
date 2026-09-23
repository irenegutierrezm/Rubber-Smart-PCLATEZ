from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/',           admin.site.urls),
    path('api/auth/',        include('authentication.urls')),
    path('api/productores/', include('productores.urls')),
    path('api/dashboard/',   include('authentication.dashboard_urls')),
]