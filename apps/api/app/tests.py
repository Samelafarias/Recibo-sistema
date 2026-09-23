from django.contrib.auth.models import User
from django.db.models import Sum
from django.utils import timezone
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Cliente, Recibo


class ClienteAPITestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='teste', password='senha123')

    def autenticar(self):
        response = self.client.post('/api/token/', {
            'username': 'teste',
            'password': 'senha123',
        }, format='json')
        token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    def test_login_aceita_email_como_usuario(self):
        user = User.objects.create_user(username='admin', email='admin@recibo.com', password='senha123')

        response = self.client.post('/api/token/', {
            'username': 'admin@recibo.com',
            'password': 'senha123',
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['email'], user.email)

    def test_lista_clientes_exige_autenticacao(self):
        response = self.client.get('/api/clientes/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_criar_e_listar_cliente(self):
        self.autenticar()
        total_antes = Cliente.objects.count()

        response = self.client.post('/api/clientes/', {
            'nome': 'Cliente Teste',
            'valor_mensal': '250.00',
            'referente_padrao': 'Mensalidade',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.assertEqual(Cliente.objects.count(), total_antes + 1)

        response = self.client.get('/api/clientes/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], Cliente.objects.filter(ativo=True).count())
        self.assertGreaterEqual(len(response.data['results']), 1)

    def test_nao_permite_recibo_duplicado_no_mesmo_mes(self):
        self.autenticar()

        cliente = Cliente.objects.create(
            nome='Cliente Teste',
            valor_mensal='250.00',
            referente_padrao='Mensalidade',
        )

        payload = {
            'cliente': cliente.id,
            'competencia_mes': 9,
            'competencia_ano': 2026,
            'valor': '250.00',
            'referente': 'Mensalidade',
        }

        primeira = self.client.post('/api/recibos/', payload, format='json')
        self.assertEqual(primeira.status_code, status.HTTP_201_CREATED)

        segunda = self.client.post('/api/recibos/', payload, format='json')
        self.assertEqual(segunda.status_code, status.HTTP_400_BAD_REQUEST)

    def test_dashboard_retorna_resumo_do_mes(self):
        self.autenticar()

        hoje = timezone.now()
        cliente_ativo = Cliente.objects.create(
            nome='Cliente Ativo',
            valor_mensal='300.00',
            referente_padrao='Mensalidade',
        )
        Cliente.objects.create(
            nome='Cliente Inativo',
            valor_mensal='150.00',
            referente_padrao='Mensalidade',
            ativo=False,
        )

        Recibo.objects.create(
            cliente=cliente_ativo,
            competencia_mes=hoje.month,
            competencia_ano=hoje.year,
            valor='300.00',
            referente='Mensalidade',
            status='gerado',
        )

        response = self.client.get('/api/dashboard/')

        clientes_ativos = Cliente.objects.filter(ativo=True).count()
        ids_gerados = set(
            Recibo.objects.filter(
                competencia_mes=hoje.month,
                competencia_ano=hoje.year,
                status='gerado',
            ).values_list('cliente_id', flat=True)
        )
        esperada_recibos_nao_gerados = Cliente.objects.filter(ativo=True).exclude(id__in=ids_gerados).count()
        receita_esperada = Recibo.objects.filter(
            competencia_mes=hoje.month,
            competencia_ano=hoje.year,
            status='gerado',
        ).aggregate(total=Sum('valor'))['total'] or 0

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(response.data['clientes_cadastrados'], clientes_ativos)
        self.assertEqual(response.data['recibos_nao_gerados'], esperada_recibos_nao_gerados)
        self.assertEqual(response.data['receita_mes'], str(receita_esperada))
