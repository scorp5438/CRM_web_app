FROM python:3.12

# Установка Node.js (оптимизированная версия)
RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    npm cache clean --force && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app/CRM_app

COPY requirements.txt CRM_app/

RUN pip install --no-cache-dir -r CRM_app/requirements.txt

COPY . .

WORKDIR /app/CRM_app/my-app

RUN npm install
RUN npm install react-scripts
RUN npm install react-router-dom
RUN npm install axios
RUN npm run build

WORKDIR /app/CRM_app

RUN python manage.py collectstatic --noinput

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "CRM_app.wsgi:application"]