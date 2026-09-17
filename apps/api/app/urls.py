from rest_framework.routers import DefaultRouter
from .views import ClienteViewSet, ReciboViewSet

router = DefaultRouter()
router.register(r'clientes', ClienteViewSet)
router.register(r'recibos', ReciboViewSet)

urlpatterns = router.urls
