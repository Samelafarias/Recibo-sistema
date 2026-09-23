from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import ClienteViewSet, ReciboViewSet, MeView, DashboardView, RecibosPorCompetenciaView, GerarRecibosView

router = DefaultRouter()
router.register(r'clientes', ClienteViewSet)
router.register(r'recibos', ReciboViewSet)

urlpatterns = [
    path('me/', MeView.as_view(), name='me'),
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    path('recibos/por-competencia/', RecibosPorCompetenciaView.as_view(), name='recibos_por_competencia'),
    path('recibos/gerar/', GerarRecibosView.as_view(), name='gerar_recibos'),
    *router.urls,
]
