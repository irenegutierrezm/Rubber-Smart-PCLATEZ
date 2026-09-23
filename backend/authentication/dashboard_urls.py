from django.urls import path
from . import dashboard_views

urlpatterns = [
    path('stats/',      dashboard_views.StatsView.as_view(),      name='stats'),
    path('productores/', dashboard_views.ProductoresView.as_view(), name='dash-productores'),
    path('parcelas/',   dashboard_views.ParcelasView.as_view(),   name='dash-parcelas'),
]