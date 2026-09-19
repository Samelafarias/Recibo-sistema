# 👩‍💻  Backend — Sistema de Recibos

API construída com **Django** + **Django REST Framework**, autenticação via **JWT** e banco **PostgreSQL**.

## Requisitos

- Python 3.12+
- PostgreSQL 16 (ou Docker, que já sobe um pra você)
- Docker e Docker Compose (recomendado — evita ter que instalar Python/Postgres na máquina)

## Rodando com Docker (recomendado)

Na raiz do projeto (não dentro de `apps/api/`):

```bash
docker compose up --build
```

Isso sobe três containers: `db` (PostgreSQL), `api` (esta aplicação) e `web` (frontend). As migrations são aplicadas automaticamente ao subir.

Depois, crie um usuário pra acessar o sistema:

```bash
docker compose exec api python manage.py createsuperuser
```

A API fica disponível em `http://localhost:8000`.

## Rodando sem Docker

```bash
cd apps/api
python -m venv venv
venv\Scripts\activate          # Windows
source venv/bin/activate       # Mac/Linux

pip install -r requirements.txt

python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Nesse caso, use `DB_HOST=localhost` no `.env` (não `db`, que só existe dentro da rede do Docker), e garanta que você tenha um PostgreSQL rodando localmente com um banco criado com o mesmo nome de `DB_NAME`.

## Rodando os testes

```bash
python manage.py test
```

(ou `docker compose exec api python manage.py test`, se estiver rodando via Docker)

## Painel administrativo

Disponível em `http://localhost:8000/admin`, usando o usuário criado com `createsuperuser`.

## Estrutura de pastas

```
apps/api/
├── config/          # Configurações do projeto (settings, urls, wsgi)
├── app/             # App principal: models, views, serializers, urls, migrations
├── manage.py
├── requirements.txt
├── Dockerfile
├── entrypoint.sh    # Espera o banco ficar disponível e aplica migrations ao subir
└── .env             # Não versionado — suas variáveis locais
```