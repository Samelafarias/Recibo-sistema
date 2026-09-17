from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from .models import Cliente, Recibo


class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = '__all__'


class ReciboSerializer(serializers.ModelSerializer):
    cliente_nome = serializers.ReadOnlyField(source='cliente.nome')

    class Meta:
        model = Recibo
        fields = '__all__'

class RegisterSerializer(serializers.ModelSerializer):
    nome = serializers.CharField(source='first_name')
    password = serializers.CharField(write_only=True, validators=[validate_password])
    confirmar_senha = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'nome', 'email', 'password', 'confirmar_senha']

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Já existe um usuário com esse e-mail.')
        return value

    def validate(self, data):
        if data['password'] != data.pop('confirmar_senha'):
            raise serializers.ValidationError({'confirmar_senha': 'As senhas não coincidem.'})
        return data

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
        )
