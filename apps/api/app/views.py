from rest_framework import viewsets, generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.mail import send_mail
from django.conf import settings
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode

from .models import Cliente, Recibo
from .serializers import ClienteSerializer, ReciboSerializer, RegisterSerializer


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
