from rest_framework import viewsets, generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.mail import send_mail
from django.conf import settings
from django.db.models import Sum
from django.utils import timezone
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode

from .models import Cliente, Recibo
from .serializers import ClienteSerializer, ReciboSerializer, RegisterSerializer, EmailTokenObtainPairSerializer
from django.db.models import Q
from rest_framework.decorators import action
from rest_framework import status as http_status
from rest_framework.pagination import PageNumberPagination
from django.db.models import ProtectedError


class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    permission_classes = [permissions.IsAuthenticated]


class ReciboViewSet(viewsets.ModelViewSet):
    queryset = Recibo.objects.all()
    serializer_class = ReciboSerializer
    permission_classes = [permissions.IsAuthenticated]


class RegisterView(generics.CreateAPIView):
    """Cadastro de um novo usuário do sistema (não é o cliente final)."""
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer


class HealthCheckView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({'status': 'ok'})


class PasswordResetRequestView(APIView):
    """
    Primeiro passo da recuperação de senha: recebe o e-mail e, se existir
    um usuário com ele, envia um uid + token de redefinição.
    Em desenvolvimento (EMAIL_BACKEND=console), esse "e-mail" aparece
    direto no terminal onde o runserver está rodando.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '')
        mensagem_padrao = {'detail': 'Se o e-mail existir em nossa base, um link de recuperação foi enviado.'}

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Não revela se o e-mail existe ou não, por segurança
            return Response(mensagem_padrao)

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        reset_link = f"{settings.FRONTEND_URL}?uid={uid}&token={token}"

        try:
            send_mail(
                subject='Recuperação de senha - Sistema de Recibos',
                message=(
                    f'Olá, {user.username}.\n\n'
                    f'Recebemos uma solicitação para redefinir sua senha.\n\n'
                    f'Clique no link abaixo para criar uma nova senha:\n\n'
                    f'{reset_link}\n\n'
                    f'Se você não solicitou essa alteração, pode ignorar este e-mail.'
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )
            return Response(mensagem_padrao)
        except Exception:
            return Response(
                {'detail': 'Não foi possível enviar o e-mail de recuperação. Verifique as configurações SMTP e a senha de app do Gmail.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class PasswordResetConfirmView(APIView):
    """Segundo passo: recebe uid + token + nova senha e efetiva a troca."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        uid = request.data.get('uid')
        token = request.data.get('token')
        new_password = request.data.get('new_password')

        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)
        except (User.DoesNotExist, ValueError, TypeError, OverflowError):
            return Response({'detail': 'Link inválido.'}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({'detail': 'Token inválido ou expirado.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            validate_password(new_password, user)
        except DjangoValidationError as e:
            return Response({'detail': e.messages}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({'detail': 'Senha redefinida com sucesso.'})


class MeView(APIView):
    """Devolve os dados do usuário autenticado (usado pela sidebar, por exemplo)."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            'id': user.id,
            'nome': user.first_name,
            'email': user.email,
        })


class DashboardView(APIView):
    """Resumo do dashboard para a área administrativa."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        hoje = timezone.now()
        mes_atual = hoje.month
        ano_atual = hoje.year

        recibos_do_mes = Recibo.objects.filter(
            competencia_mes=mes_atual,
            competencia_ano=ano_atual,
            status='gerado',
        )

        receita_mes = recibos_do_mes.aggregate(total=Sum('valor'))['total'] or 0

        clientes_ids_com_recibo = recibos_do_mes.values_list('cliente_id', flat=True)
        recibos_nao_gerados = Cliente.objects.filter(ativo=True).exclude(
            id__in=clientes_ids_com_recibo
        ).count()

        clientes_cadastrados = Cliente.objects.count()

        recentes = Recibo.objects.select_related('cliente').order_by('-criado_em')[:4]
        recibos_recentes = [
            {
                'id': r.id,
                'cliente_nome': r.cliente.nome,
                'status': r.status,
                'data_emissao': r.data_emissao.isoformat(),
                'valor': str(r.valor),
            }
            for r in recentes
        ]

        return Response({
            'receita_mes': str(receita_mes),
            'recibos_nao_gerados': recibos_nao_gerados,
            'clientes_cadastrados': clientes_cadastrados,
            'recibos_recentes': recibos_recentes,
        })

class RecibosPorCompetenciaView(APIView):
    """Lista clientes ativos cruzados com o recibo daquele mês (se existir)."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            mes = int(request.query_params.get('mes'))
            ano = int(request.query_params.get('ano'))
        except (TypeError, ValueError):
            return Response({'detail': 'Informe mes e ano.'}, status=http_status.HTTP_400_BAD_REQUEST)

        status_filtro = (request.query_params.get('status', 'todos') or 'todos').strip().lower()
        status_filtro = status_filtro.replace(' ', '-').replace('ã', 'a').replace('á', 'a').replace('à', 'a')
        busca = request.query_params.get('busca', '')
        page = int(request.query_params.get('page', 1))
        page_size = 8

        clientes = Cliente.objects.filter(ativo=True)
        if busca:
            clientes = clientes.filter(nome__icontains=busca)

        recibos_do_mes = {
            r.cliente_id: r
            for r in Recibo.objects.filter(competencia_mes=mes, competencia_ano=ano)
        }

        linhas = []
        for cliente in clientes.order_by('nome'):
            recibo = recibos_do_mes.get(cliente.id)
            if recibo:
                linhas.append({
                    'recibo_id': recibo.id,
                    'cliente_id': cliente.id,
                    'nome': cliente.nome,
                    'valor': str(recibo.valor),
                    'referente': recibo.referente,
                    'observacao': recibo.observacao,
                    'data_emissao': recibo.data_emissao,
                    'status': (recibo.status or '').lower(),
                    'impresso': recibo.impresso,
                })
            else:
                linhas.append({
                    'recibo_id': None,
                    'cliente_id': cliente.id,
                    'nome': cliente.nome,
                    'valor': str(cliente.valor_mensal),
                    'referente': cliente.referente_padrao,
                    'observacao': None,
                    'data_emissao': None,
                    'status': 'pendente',
                    'impresso': False,
                })

        if status_filtro == 'gerado':
            linhas = [l for l in linhas if l['status'] == 'gerado']
        elif status_filtro in {'nao-gerado', 'nao-gerado'}:
            linhas = [l for l in linhas if l['status'] == 'pendente']

        total = len(linhas)
        total_paginas = max(1, (total + page_size - 1) // page_size)
        inicio = (page - 1) * page_size
        pagina = linhas[inicio:inicio + page_size]

        return Response({
            'results': pagina,
            'pagina_atual': page,
            'total_paginas': total_paginas,
        })


class GerarRecibosView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        mes = request.data.get('mes')
        ano = request.data.get('ano')
        cliente_ids = request.data.get('cliente_ids')  # lista opcional

        if not mes or not ano:
            return Response({'detail': 'Informe mes e ano.'}, status=http_status.HTTP_400_BAD_REQUEST)

        clientes_qs = Cliente.objects.filter(ativo=True)
        if cliente_ids:
            clientes_qs = clientes_qs.filter(id__in=cliente_ids)

        gerados = []
        for cliente in clientes_qs:
            recibo, criado = Recibo.objects.get_or_create(
                cliente=cliente,
                competencia_mes=mes,
                competencia_ano=ano,
                defaults={
                    'valor': cliente.valor_mensal,
                    'referente': cliente.referente_padrao,
                    'status': 'gerado',
                },
            )

            if criado:
                gerados.append(recibo.id)
            elif (recibo.status or '').lower() != 'gerado':
                recibo.status = 'gerado'
                recibo.save(update_fields=['status'])
                gerados.append(recibo.id)

        return Response({'gerados': len(gerados)})

class ClientePagination(PageNumberPagination):
    page_size = 8


class ClienteViewSet(viewsets.ModelViewSet):
    serializer_class = ClienteSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = ClientePagination

    def get_queryset(self):
        # Só mostra clientes ativos — os "excluídos" que viram inativos (ver destroy() abaixo) somem da lista
        qs = Cliente.objects.filter(ativo=True).order_by('nome')
        busca = self.request.query_params.get('busca')
        if busca:
            qs = qs.filter(nome__icontains=busca)
        return qs

    def destroy(self, request, *args, **kwargs):
        cliente = self.get_object()
        try:
            cliente.delete()
            return Response(status=http_status.HTTP_204_NO_CONTENT)
        except ProtectedError:
            # Cliente já tem recibo emitido — não apaga de verdade, só inativa
            cliente.ativo = False
            cliente.save(update_fields=['ativo'])
            return Response(
                {'detail': 'Este cliente possui recibos emitidos e foi arquivado em vez de excluído.'},
                status=http_status.HTTP_200_OK,
            )