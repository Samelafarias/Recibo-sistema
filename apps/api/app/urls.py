from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import ClienteViewSet, ReciboViewSet, MeView, DashboardView

router = DefaultRouter()
router.register(r'clientes', ClienteViewSet)
router.register(r'recibos', ReciboViewSet)

urlpatterns = router.urls + [
    path('me/', MeView.as_view(), name='me'),
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
]
