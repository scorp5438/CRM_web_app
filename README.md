# 🧠 CRM Web App — Система контроля качества

Веб-приложение для организации оценки знаний стажёров, контроля за качеством работы операторов контакт-центра, а также тестирования новых кандидатов. Проект объединяет современные веб-технологии: **Django (Python)** на бэкенде и **React (JavaScript)** на фронтенде.

---

👤 Архитектор и разработчик бэкенда (Python/Django)
- **Полный цикл разработки:** Выполнил полный цикл создания серверной части приложения: от проектирования архитектуры и схемы базы данных до реализации, контейнеризации и развертывания на production-сервере.
- **API и интеграция** Разработал RESTful API на Django REST Framework, обеспечив полное взаимодействие между фронтендом и серверной логикой приложения.
- **Безопасность и доступ:** Реализовал систему аутентификации и авторизации, включая механизмы управления правами доступа для различных пользовательских ролей.
- **Контейнеризация и деплой:** Подготовил проект к промышленной эксплуатации через Docker и docker-compose, обеспечив единую среду выполнения на всех этапах разработки и развертывания.

---

## 🛠 Технологии
**Backend**: Django (Python 3.12) + Django REST Framework  
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![DjangoREST](https://img.shields.io/badge/Django%20REST-ff1709?style=for-the-badge&logo=django&logoColor=white)](https://www.django-rest-framework.org/)

**Frontend**: React • HTML5 • Sass  
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)

**База данных**: SQLite  
[![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)

**Веб-сервер**: Nginx + Gunicorn  
[![Nginx](https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white)](https://nginx.org/)
[![Gunicorn](https://img.shields.io/badge/Gunicorn-499848?style=for-the-badge&logo=gunicorn&logoColor=white)](https://gunicorn.org/)

**Контейнеризация**: Docker + Docker Compose  
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Docker Compose](https://img.shields.io/badge/Docker%20Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docs.docker.com/compose/)

**GitHub Actions**  
[![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)](https://github.com/features/actions)

---

## 🚀 Быстрый старт

> ⚠️ **Перед началом работы обязательно свяжись с руководителем**, чтобы он добавил тебя в репозиторий как **collaborator**!

---

## 📂 Подключение репозитория

### Если репозиторий ещё не инициализирован:
```bash 
  git init
```
### Добавление удалённого репозитория:

> git remote add origin https://github.com/scorp5438/CRM_web_app.git

### Переключение основной ветки:

> git branch -M main

### Клонирование проекта:
> git clone https://github.com/scorp5438/CRM_web_app.git

### Для получения новых изменений в будущем:
> git pull
## 💻 Установка зависимостей
### Перейди в корневую директорию проекта (где находится requirements.txt) и выполни:
> pip install -r requirements.txt
#### 💡 Если ты используешь PyCharm, просто открой любой Python-файл проекта — IDE предложит установить всё сама.
## 🧩 Установка Node.js и npm (для Windows)
1. Перейди на официальный сайт и скачай последнюю LTS-версию:
>👉 https://nodejs.org/
2. Установи Node.js, убедившись, что выбран пункт "Install npm". Перезагрузи ПК после установки.
3. Проверь версии:
````
node --version
npm --version
````
## ⚛️ Установка зависимостей React
#### В директории с фронтендом (my-app) выполни:
````
npm install react-scripts
npm install react-router-dom
npm install axios
npm install moment-timezone
````
#### Для сборки фронтенда:
````
npm run build
````
## 🛠️ Django: миграции и суперпользователь
#### В корне Django-проекта (где manage.py), последовательно выполни:
````
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py collectstatic --noinput
````
        🧼 collectstatic собирает все CSS, JS, и прочие статические файлы из фронтенда и Django-приложений в одну директорию — нужно для продакшн-окружения.
## ▶️ Запуск проектаОкно терминала №1 (фронтенд):
* Окно терминала №1 (фронтенд):
````
npm run build
````
* Окно терминала №2 (бэкенд):
````
python manage.py collectstatic --noinput
python manage.py runserver
````
### Открой в браузере: http://127.0.0.1:8000/

## ❌ Удаление файла из GIT-отслеживания
#### Если ты случайно закоммитил db.sqlite3, его нужно удалить из репозитория:
````
git rm --cached db.sqlite3
````
## Как авторизироваться в приложении
### Чтобы авторизоваться как администратор ДМ, нужно ввести логин и пароль:
* almin
* 1234
### Чтобы авторизоваться как администратор КЦ, нужно ввести логин и пароль:
* admin_kc01 или admin_kc02
* Qwerty741 (пароль универсален для всех администраторов КЦ)
### Чтобы авторизоваться как оператор любого КЦ, нужно ввести логин и пароль:
* operator_1_kc1 или operator_1_kc2
* Qwerty741 (пароль универсален для всех операторов КЦ)

## Запуск проекта через Docker Compose LINUX
* Pull проекта в необходимую директорию 
* git clone https://github.com/scorp5438/CRM_web_app.git
* перейти в папку с docker-compose.yml cd CRM_web_app/CRM_app
* запускаем проект sudo docker compose up --build -d
* необходимо сделать миграции 


