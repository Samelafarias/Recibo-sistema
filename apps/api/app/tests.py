from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Cliente


class ClienteAPITestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='teste', password='senha123')

    def autenticar(self):
        response = self.client.post('/api/token/', {
            'username': 'teste',
            'password': 'senha123',
        })
        token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    def test_lista_clientes_exige_autenticacao(self):
        response = self.client.get('/api/clientes/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_criar_e_listar_cliente(self):
        self.autenticar()

        response = self.client.post('/api/clientes/', {
            'nome': 'Cliente Teste',
            'valor_mensal': '250.00',
            'referente_padrao': 'Mensalidade',
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        response = self.client.get('/api/clientes/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

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

        primeira = self.client.post('/api/recibos/', payload)
        self.assertEqual(primeira.status_code, status.HTTP_201_CREATED)

        segunda = self.client.post('/api/recibos/', payload)
        self.assertEqual(segunda.status_code, status.HTTP_400_BAD_REQUEST)
