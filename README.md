# ReciboFácil

O **ReciboFácil** é uma aplicação web para geração e gerenciamento de recibos mensais, feita para substituir o preenchimento manual de recibos em documentos do Word.

O sistema permite cadastrar clientes, gerar os recibos de cada mês (em lote ou individualmente) e imprimir vários recibos por folha, no modelo de talão com canhoto.

## ✨ Funcionalidades

- **Autenticação:** login com e-mail e senha (JWT), cadastro de usuário e recuperação de senha por e-mail.
- **Dashboard:** receita do mês, recibos ainda não gerados, total de clientes e recibos recentes.
- **Clientes:** cadastro, edição e exclusão. Clientes que já possuem recibos são arquivados em vez de apagados, preservando o histórico.
- **Recibos:** filtro por mês, status e busca por cliente, geração em lote ou dos selecionados, e edição do valor de um recibo pendente sem alterar o cadastro do cliente.
- **Impressão:** pré-visualização e impressão de vários recibos por folha (4 por página), com valor por extenso e logo do escritório.
- **PWA:** o sistema pode ser instalado no desktop (Chrome ou Edge) e aberto como um aplicativo.

## 🛠️ Tecnologias utilizadas

**Backend (`apps/api`)**

- **Python 3.12** — linguagem usada no desenvolvimento.
- **Django** e **Django REST Framework** — construção da API.
- **Simple JWT** — autenticação por token.
- **PostgreSQL** — banco de dados.
- **django-cors-headers** — liberação de origens (CORS) para o frontend.
- **python-decouple / dj-database-url** — leitura de variáveis de ambiente e da URL do banco.
- **Gunicorn** — servidor de produção.
- **Docker / Docker Compose** — ambiente padronizado para API e banco.

**Frontend (`apps/web`)**

- **TypeScript** — linguagem usada no desenvolvimento.
- **Next.js** — framework React (App Router).
- **Tailwind CSS v4** — estilização.
- **shadcn/ui** — componentes de interface.
- **Lucide React** — ícones.

**Infraestrutura**

- **GitHub Actions** — integração contínua (`api-ci.yml` e `web-ci.yml`).
- **Vercel** (frontend), **Render** (API) e **Neon** (banco) — hospedagem.

## 📁 Estrutura

O projeto é um monorepo com o backend e o frontend no mesmo repositório:

```text
Recibo-sistema/
├── apps/
│   ├── api/                 # Backend (Django)
│   │   ├── config/          # settings, urls, wsgi
│   │   ├── app/             # models, serializers, views, urls, migrations, testes
│   │   ├── Dockerfile
│   │   ├── entrypoint.sh    # aguarda o banco, aplica migrations e sobe o servidor
│   │   ├── manage.py
│   │   └── requirements.txt
│   └── web/                 # Frontend (Next.js)
│       ├── public/          # logo e ícones do PWA
│       └── src/
│           ├── app/         # rotas (login, cadastro, recuperação de senha, dashboard, recibos, clientes)
│           ├── components/  # sidebar, modais, tabelas, filtros e área de impressão
│           ├── hooks/       # useRecibos, useClientes
│           └── lib/         # utilitários (formatação, valor por extenso, chamadas à API)
├── .github/workflows/       # CI do backend e do frontend
├── docker-compose.yml       # banco (PostgreSQL) e API
└── README.md
```

## Como rodar o projeto

### Pré-requisitos

- [Git](https://git-scm.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (para o backend e o banco)
- [Node.js 20+](https://nodejs.org/) (para o frontend)

### 1. Clonar o repositório

```bash
git clone https://github.com/Samelafarias/Recibo-sistema.git
cd Recibo-sistema
```

### 2. Backend

O `docker-compose.yml` sobe o **PostgreSQL** e a **API**. O frontend roda separadamente, direto na sua máquina.

#### 2.1. Configurar as variáveis de ambiente

São dois arquivos `.env`.

**Na raiz do projeto** (`.env`) — usado pelo Docker Compose para criar o banco:

```env
DB_NAME=recibos_db
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui
```

**Em `apps/api/.env`** — usado pela API:

```env
SECRET_KEY=troque-por-uma-chave-secreta-longa-e-aleatoria
DEBUG=True

DB_NAME=recibos_db
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui
DB_HOST=db
DB_PORT=5432

FRONTEND_BASE_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000/admin/redefinir-senha
```

> Use a **mesma senha** nos dois arquivos. Os arquivos `.env` estão no `.gitignore` e nunca devem ser enviados ao repositório.

| Variável | Descrição |
|---|---|
| `SECRET_KEY` | Chave secreta do Django. |
| `DEBUG` | `True` em desenvolvimento e `False` em produção. |
| `DB_NAME`, `DB_USER`, `DB_PASSWORD` | Credenciais do PostgreSQL. |
| `DB_HOST`, `DB_PORT` | Endereço do banco. Dentro do Docker, o host é `db`. |
| `FRONTEND_BASE_URL` | Origem do frontend, usada na liberação de CORS. |
| `FRONTEND_URL` | Página do frontend para onde o link de redefinição de senha aponta. |

**E-mail (opcional):** por padrão, os e-mails de recuperação de senha **não são enviados de verdade** — o conteúdo aparece no terminal da API (`docker compose logs api`). Para enviar e-mails reais pelo Gmail, adicione em `apps/api/.env`:

```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=seu_email@gmail.com
EMAIL_HOST_PASSWORD=senha_de_app_de_16_digitos
DEFAULT_FROM_EMAIL=seu_email@gmail.com
```

> O `EMAIL_HOST_PASSWORD` deve ser uma **senha de app** do Google (exige verificação em duas etapas ativada), e não a senha normal da conta.

#### 2.2. Subir o backend

Na raiz do projeto:

```bash
docker compose up --build
```

Isso cria o banco, aplica as migrations automaticamente e inicia a API. Na primeira execução, o banco pode levar alguns segundos a mais para ficar pronto.

A API estará disponível em:

```text
http://localhost:8000
```

Para conferir se está no ar:

```text
http://localhost:8000/api/health/
```

#### 2.3. Criar o primeiro usuário

Como o banco começa vazio, crie um usuário para acessar o sistema, pela rota de cadastro:

```bash
curl -X POST http://localhost:8000/api/register/ \
  -H "Content-Type: application/json" \
  -d '{"nome":"Seu Nome","email":"voce@email.com","password":"SenhaForte123!","confirmar_senha":"SenhaForte123!"}'
```

O login no sistema é feito com o **e-mail** cadastrado e a senha.

Se quiser também acessar o painel administrativo do Django (`http://localhost:8000/admin`):

```bash
docker compose exec api python manage.py createsuperuser
```

#### 2.4. Parar o backend

```bash
docker compose down
```

#### Alternativa: rodar a API sem Docker

Requer um PostgreSQL instalado localmente e um banco criado com o mesmo nome de `DB_NAME`. Em `apps/api/.env`, use `DB_HOST=localhost`.

```bash
cd apps/api
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### 3. Frontend

#### 3.1. Instalar as dependências

```bash
cd apps/web
npm install
```

#### 3.2. Configurar as variáveis de ambiente

Crie um arquivo `.env` dentro de `apps/web`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Essa variável define o endereço da API utilizada pelo frontend.

#### 3.3. Iniciar o projeto

```bash
npm run dev
```

Após iniciar, o frontend estará disponível em:

```text
http://localhost:3000
```

A raiz redireciona automaticamente para a tela de login (`/admin/login`).

## 🔗 Endpoints principais da API

| Método | Rota | Autenticação | Descrição |
|---|---|---|---|
| `POST` | `/api/register/` | Não | Cadastro de usuário |
| `POST` | `/api/token/` | Não | Login (retorna `access` e `refresh`) |
| `POST` | `/api/token/refresh/` | Não | Renova o token de acesso |
| `POST` | `/api/password-reset/` | Não | Solicita a recuperação de senha |
| `POST` | `/api/password-reset-confirm/` | Não | Define a nova senha com `uid` e `token` |
| `GET` | `/api/me/` | Sim | Dados do usuário logado |
| `GET` | `/api/dashboard/` | Sim | Resumo do dashboard |
| `GET/POST` | `/api/clientes/` | Sim | Listar e cadastrar clientes |
| `PATCH/DELETE` | `/api/clientes/{id}/` | Sim | Editar e excluir um cliente |
| `GET` | `/api/recibos/por-competencia/` | Sim | Clientes e recibos de um mês |
| `POST` | `/api/recibos/gerar/` | Sim | Gera recibos do mês |
| `PATCH` | `/api/recibos/pendente/` | Sim | Ajusta um recibo ainda não gerado |

As rotas autenticadas exigem o header `Authorization: Bearer <access_token>`.

## 🧪 Testes

```bash
docker compose exec api python manage.py test
```

Os testes também rodam automaticamente no GitHub Actions a cada push ou pull request para a `main`.

## 👩‍💻 Autora

- [Samela Farias](https://github.com/Samelafarias)
