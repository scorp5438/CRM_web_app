FROM python:3.12
WORKDIR /app/CRM_app
COPY requirements.txt CRM_app/
RUN pip install --no-cache-dir -r CRM_app/requirements.txt
COPY . .
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "CRM_app.wsgi:application"]