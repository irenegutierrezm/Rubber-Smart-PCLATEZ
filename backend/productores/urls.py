from django.urls import path
from . import views

urlpatterns = [
    path('',                    views.ProductoresView.as_view(),       name='productores'),
    path('<int:pk>/',           views.ProductorDetalleView.as_view(),  name='productor-detalle'),
    path('<int:productor_pk>/parcelas/', views.ParcelasView.as_view(), name='parcelas'),
    path('parcelas/<int:pk>/',  views.ParcelaDetalleView.as_view(),    name='parcela-detalle'),
]