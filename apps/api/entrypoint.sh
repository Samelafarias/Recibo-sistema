#!/bin/sh

echo "Aguardando o banco de dados ficar disponível..."

while ! python -c "
import socket, os
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.settimeout(1)
result = s.connect_ex((os.environ.get('DB_HOST', 'db'), int(os.environ.get('DB_PORT', 5432))))
exit(result)
"; do
  sleep 1
done

echo "Banco disponível. Aplicando migrations..."
python manage.py migrate --noinput

echo "Iniciando o servidor..."
python manage.py runserver 0.0.0.0:8000
