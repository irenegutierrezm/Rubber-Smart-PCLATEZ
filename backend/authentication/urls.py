from django.urls import path
from . import views

urlpatterns = [
    path('csrf/',              views.CSRFView.as_view(),           name='csrf'),
    path('login/',             views.LoginView.as_view(),          name='login'),
    path('logout/',            views.LogoutView.as_view(),         name='logout'),
    path('perfil/',            views.PerfilView.as_view(),         name='perfil'),
    path('password/',          views.CambiarPasswordView.as_view(), name='password'),
    path('usuarios/',          views.UsuariosView.as_view(),       name='usuarios'),
    path('usuarios/<int:pk>/', views.UsuarioDetalleView.as_view(), name='usuario-detalle'),
    path('bitacora/',          views.BitacoraView.as_view(),       name='bitacora'),
    path('geocoding/', views.GeocodingView.as_view(), name='geocoding'),
]