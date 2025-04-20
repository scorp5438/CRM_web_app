FROM python:3.12

# Установка Node.js и npm
RUN apt-get update && apt-get install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
RUN apt-get install -y nodejs
RUN npm install
RUN npm install react-scripts
RUN npm install react-router-dom
RUN npm install axios
RUN npm run build

WORKDIR /app/CRM_app

COPY requirements.txt CRM_app/

RUN pip install --no-cache-dir -r CRM_app/requirements.txt

COPY . .

RUN python manage.py collectstatic --noinput

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "CRM_app.wsgi:application"]