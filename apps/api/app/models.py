from django.db import models


class Cliente(models.Model):
    nome = models.CharField(max_length=150)
    valor_mensal = models.DecimalField(max_digits=10, decimal_places=2)
    dia_vencimento = models.PositiveSmallIntegerField(null=True, blank=True)
    referente_padrao = models.CharField(max_length=150, default='Mensalidade')
    ativo = models.BooleanField(default=True)
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'clientes'
        ordering = ['nome']

    def __str__(self):
        return self.nome


class Recibo(models.Model):
    STATUS_CHOICES = [
        ('pendente', 'Pendente'),
        ('gerado', 'Gerado'),
    ]

    cliente = models.ForeignKey(Cliente, on_delete=models.PROTECT, related_name='recibos')
    competencia_mes = models.PositiveSmallIntegerField()
    competencia_ano = models.PositiveSmallIntegerField()
    valor = models.DecimalField(max_digits=10, decimal_places=2)
    referente = models.CharField(max_length=150)
    observacao = models.TextField(blank=True, null=True)
    data_emissao = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pendente')
    impresso = models.BooleanField(default=False)
    criado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'recibos'
        ordering = ['-competencia_ano', '-competencia_mes']
        constraints = [
            models.UniqueConstraint(
                fields=['cliente', 'competencia_mes', 'competencia_ano'],
                name='uq_recibo_competencia'
            )
        ]

    def __str__(self):
        return f'{self.cliente.nome} - {self.competencia_mes}/{self.competencia_ano}'
