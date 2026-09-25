#!/bin/sh

if [ -z "$DATABASE_URL" ]; then
  echo "Aguardando o banco de dados local ficar disponível..."
  while ! python -c "
import socket, os
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.settimeout(1)
result = s.connect_ex((os.environ.get('DB_HOST', 'db'), int(os.environ.get('DB_PORT', 5432))))
exit(result)
"; do
    sleep 1
  done
fi

echo "Aplicando migrations..."
python manage.py migrate --noinput

echo "Iniciando o servidor..."
gunicorn config.wsgi:application --bind 0.0.0.0:8000
