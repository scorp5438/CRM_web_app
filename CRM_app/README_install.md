# Команды для начала работы
### Перед началом свяжись с руководителем чтобы тебя добавили в коллабу!
## Подключение репозитория
* ВАЖНО! Если ещё не инициализирован, выполните:
```bash
git init
```
Подключение удалённого репозитория:
```bash
git remote add origin https://github.com/scorp5438/CRM_web_app.git
```
## Смена основной ветки на "main"
* git branch -M main
## Загрузка проекта на компьютер
```bash
git clone https://github.com/scorp5438/CRM_web_app.git
```
* в дальнейшем для подтягивания изменений используем команду ```git pull```

* Либо открой в данном проекте PyCharm любой python-файл (*.py) и IDE сама предложит установить все необходимые зависимости
## Установка ПО для работы 
* Проверь что ты находишься в корне проекта в терминале и выполни:
```bash
pip install -r requirements.txt
```

## Установка `Node.js и npm` на Windows
1. **Перейди на официальный сайт Node.js и скачай последнюю LTS (Long-Term Support) версию:**

https://nodejs.org/

<img alt="Создание и обьединение файлов" src="img_readme/NodeJS_download.jpg" width="300" style="border: 2px solid black; padding: 5px;">


Запускаем установщик и следуем инструкциям. Нужно убедиться, что опция "Установить npm" выбрана.  
После установки рекомендуется перезагрузить ПК!

2. **После того как Node.js и npm установлены, надо открыть терминал в PyCharm и проверить версии:**

        node --version
        npm --version

<img src="img_readme/check_version_npm_node.png" alt="Проверка версии node и npm" style="border: 2px solid black; padding: 5px;">



Эти команды должны вернуть установленные версии Node.js и npm, что будет означать успешную установку.

3. **Создание React приложения:**

          npm install react-scripts  # устанавливает утилиту для создания и управления React приложением.
          npm install react-router-dom  # для установки реакт дом
          npm install axios
          npm install moment-timezone
          npm run build  # используется для сборки фронтенда

В директории с файлом manage.py выполняется команда в терминале:

         python manage.py makemigrations
         python manage.py migrate
         python manage.py createsuperuser  # создание суперпользователя (root)
         # Добавить картинку
         python manage.py collectstatic --noinput  # Собирает статические файлы для использования в продакшн-среде


Данная команда собирает все статические файлы из разных приложений (в нашем случае из приложения `React`) и модулей и помещает в одну общую папку проекта `Django`.

4. **Команда для старта сервера на Django:**

         python manage.py runserver

После запуска наш проект работает на http://127.0.0.1:8000/


Для GIT IGNORE (Для того чтобы удалить db.sqlite3 из отслеживания)

          git rm --cached db.sqlite3

Если всё получилось, ПОЗДРАВЛЯЮ!
Для запуска сайта в последующем необходимо выполнить:
1. В окошке 1-ого терминала [фронтенд] (путь в терминале `~\CRM_app\my-app`): 
```python
npm run build
```
2. В окошке 2-ого терминала [бэкенд] (путь в терминале `~\CRM_app`): 
```python   
    python manage.py collectstatic --noinput
    python manage.py runserver
```