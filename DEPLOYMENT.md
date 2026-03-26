# Инструкция по развертыванию проекта

## Развертывание на локальном сервере

### Шаг 1: Подготовка окружения

1. Установите Node.js (v16+):
   - Скачайте с https://nodejs.org/
   - Проверьте установку: `node --version`

2. Установите MongoDB (v5+):
   - Windows: https://www.mongodb.com/try/download/community
   - Linux: `sudo apt-get install mongodb`
   - Mac: `brew install mongodb-community`

3. Установите Git:
   - Скачайте с https://git-scm.com/

### Шаг 2: Клонирование и установка

```bash
# Клонирование репозитория
git clone <repository-url>
cd consultation-qa-system

# Установка зависимостей backend
cd server
npm install

# Установка зависимостей frontend
cd ../client
npm install
```

### Шаг 3: Настройка переменных окружения

Создайте файл `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/consultation-qa
JWT_SECRET=your_very_secure_secret_key_change_this
NODE_ENV=development
```

### Шаг 4: Запуск MongoDB

```bash
# Windows
net start MongoDB

# Linux
sudo systemctl start mongod

# Mac
brew services start mongodb-community
```

### Шаг 5: Запуск приложения

Откройте два терминала:

**Терминал 1 - Backend:**
```bash
cd server
npm run dev
```

**Терминал 2 - Frontend:**
```bash
cd client
npm run dev
```

Приложение будет доступно по адресу: http://localhost:3000

---

## Развертывание на продакшн сервере

### Вариант 1: Vercel (Frontend) + Render (Backend)

#### Frontend на Vercel:

1. Зарегистрируйтесь на https://vercel.com
2. Установите Vercel CLI:
   ```bash
   npm install -g vercel
   ```

3. Подготовьте frontend к деплою:
   ```bash
   cd client
   npm run build
   ```

4. Разверните:
   ```bash
   vercel --prod
   ```

5. Обновите API URL в коде на продакшн URL backend

#### Backend на Render:

1. Зарегистрируйтесь на https://render.com
2. Создайте новый Web Service
3. Подключите GitHub репозиторий
4. Настройте:
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && npm start`
5. Добавьте переменные окружения:
   - `MONGODB_URI`: ваш MongoDB Atlas URI
   - `JWT_SECRET`: секретный ключ
   - `NODE_ENV`: production

### Вариант 2: Heroku (Full Stack)

1. Установите Heroku CLI:
   ```bash
   npm install -g heroku
   ```

2. Войдите в Heroku:
   ```bash
   heroku login
   ```

3. Создайте приложение:
   ```bash
   heroku create consultation-qa-app
   ```

4. Добавьте MongoDB:
   ```bash
   heroku addons:create mongolab:sandbox
   ```

5. Настройте переменные окружения:
   ```bash
   heroku config:set JWT_SECRET=your_secret_key
   heroku config:set NODE_ENV=production
   ```

6. Разверните:
   ```bash
   git push heroku main
   ```

### Вариант 3: VPS (Ubuntu Server)

#### Подготовка сервера:

1. Подключитесь к серверу:
   ```bash
   ssh user@your-server-ip
   ```

2. Обновите систему:
   ```bash
   sudo apt update
   sudo apt upgrade -y
   ```

3. Установите Node.js:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   ```

4. Установите MongoDB:
   ```bash
   wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
   sudo apt update
   sudo apt install -y mongodb-org
   sudo systemctl start mongod
   sudo systemctl enable mongod
   ```

5. Установите Nginx:
   ```bash
   sudo apt install -y nginx
   ```

6. Установите PM2:
   ```bash
   sudo npm install -g pm2
   ```

#### Развертывание приложения:

1. Клонируйте репозиторий:
   ```bash
   cd /var/www
   git clone <repository-url>
   cd consultation-qa-system
   ```

2. Установите зависимости:
   ```bash
   cd server
   npm install --production
   cd ../client
   npm install
   npm run build
   ```

3. Создайте файл `.env`:
   ```bash
   cd ../server
   nano .env
   ```
   
   Добавьте:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/consultation-qa
   JWT_SECRET=your_production_secret_key
   NODE_ENV=production
   ```

4. Запустите backend с PM2:
   ```bash
   pm2 start server.js --name consultation-qa-api
   pm2 save
   pm2 startup
   ```

5. Настройте Nginx:
   ```bash
   sudo nano /etc/nginx/sites-available/consultation-qa
   ```
   
   Добавьте:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       # Frontend
       location / {
           root /var/www/consultation-qa-system/client/dist;
           try_files $uri $uri/ /index.html;
       }

       # Backend API
       location /api {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

6. Активируйте конфигурацию:
   ```bash
   sudo ln -s /etc/nginx/sites-available/consultation-qa /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

7. Настройте SSL (опционально):
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

---

## MongoDB Atlas (облачная БД)

1. Зарегистрируйтесь на https://www.mongodb.com/cloud/atlas
2. Создайте новый кластер (бесплатный M0)
3. Создайте пользователя БД
4. Добавьте IP адрес в whitelist (0.0.0.0/0 для всех)
5. Получите connection string
6. Обновите `MONGODB_URI` в `.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/consultation-qa
   ```

---

## Проверка развертывания

### Чек-лист:

- [ ] Backend запущен и доступен
- [ ] Frontend запущен и доступен
- [ ] MongoDB подключена
- [ ] Регистрация работает
- [ ] Вход работает
- [ ] Создание вопросов работает
- [ ] API endpoints отвечают
- [ ] HTTPS настроен (для продакшн)
- [ ] Переменные окружения настроены
- [ ] Логи доступны

### Команды для проверки:

```bash
# Проверка статуса сервера
pm2 status

# Просмотр логов
pm2 logs consultation-qa-api

# Проверка MongoDB
sudo systemctl status mongod

# Проверка Nginx
sudo systemctl status nginx

# Тест API
curl http://localhost:5000/api
```

---

## Обновление приложения

```bash
# Остановить приложение
pm2 stop consultation-qa-api

# Получить обновления
git pull origin main

# Обновить зависимости
cd server && npm install
cd ../client && npm install && npm run build

# Перезапустить
pm2 restart consultation-qa-api
```

---

## Мониторинг

### PM2 Monitoring:
```bash
pm2 monit
```

### Логи:
```bash
# Все логи
pm2 logs

# Только ошибки
pm2 logs --err

# Очистить логи
pm2 flush
```

---

## Резервное копирование на продакшн

### Автоматический бэкап (cron):

```bash
# Редактировать crontab
crontab -e

# Добавить задачу (каждый день в 2:00)
0 2 * * * /var/www/consultation-qa-system/backup-db.sh
```

---

## Troubleshooting

### Проблема: Backend не запускается
**Решение:**
- Проверьте логи: `pm2 logs`
- Проверьте порт: `netstat -tulpn | grep 5000`
- Проверьте MongoDB: `sudo systemctl status mongod`

### Проблема: Frontend не подключается к API
**Решение:**
- Проверьте CORS настройки в `server.js`
- Проверьте API URL в frontend коде
- Проверьте Nginx конфигурацию

### Проблема: MongoDB connection failed
**Решение:**
- Проверьте `MONGODB_URI` в `.env`
- Проверьте статус MongoDB: `sudo systemctl status mongod`
- Проверьте логи MongoDB: `sudo tail -f /var/log/mongodb/mongod.log`

---

## Контакты поддержки

При возникновении проблем обращайтесь к преподавателям курса.
