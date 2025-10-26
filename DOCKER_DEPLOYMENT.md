# Docker Deployment Guide

## 🚀 Быстрый Старт

### Предварительные Требования

- Docker 20.10+
- Docker Compose 2.0+
- Доменное имя (tarot.dagnir.ru) с настроенными DNS записями
- SSL сертификат (или возможность получить через Let's Encrypt)

### Шаг 1: Настройка Окружения

1. Скопируйте `.env.docker` и настройте переменные:

```bash
cp .env.docker .env
```

2. Отредактируйте `.env` файл:

```bash
# Обязательно измените SECRET_KEY на случайную строку
SECRET_KEY=your-random-secret-key-here

# Опционально: настройте SendGrid для email уведомлений
SENDGRID_API_KEY=your_sendgrid_api_key
SENDER_EMAIL=noreply@tarot.dagnir.ru
```

### Шаг 2: Настройка SSL Сертификатов

#### Вариант A: Let's Encrypt (Рекомендуется)

```bash
chmod +x setup-ssl.sh
./setup-ssl.sh
```

#### Вариант B: Свои Сертификаты

Поместите ваши сертификаты в `nginx/ssl/`:

```bash
mkdir -p nginx/ssl
cp /path/to/your/fullchain.pem nginx/ssl/
cp /path/to/your/privkey.pem nginx/ssl/
chmod 644 nginx/ssl/*.pem
```

### Шаг 3: Развертывание

```bash
chmod +x deploy.sh
./deploy.sh
```

Скрипт автоматически:
- Соберет Docker образы
- Запустит все сервисы
- Создаст админ пользователя
- Настроит базу данных

## 📦 Архитектура

```
┌─────────────────────────────────────────┐
│           Nginx (Port 80/443)           │
│     SSL Termination & Reverse Proxy     │
└──────────────┬─────────────┬────────────┘
               │             │
       ┌───────▼──────┐ ┌────▼─────────┐
       │   Frontend   │ │   Backend    │
       │  (React:80)  │ │ (FastAPI:8001)│
       └──────────────┘ └───────┬──────┘
                                 │
                        ┌────────▼───────┐
                        │    MongoDB     │
                        │   (Port 27017) │
                        └────────────────┘
```

## 🛠 Управление

### Просмотр Логов

```bash
# Все сервисы
docker-compose logs -f

# Конкретный сервис
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
docker-compose logs -f nginx
```

### Перезапуск Сервисов

```bash
# Перезапустить все
docker-compose restart

# Перезапустить конкретный сервис
docker-compose restart backend
docker-compose restart frontend
```

### Остановка и Удаление

```bash
# Остановить все сервисы
docker-compose down

# Остановить и удалить volumes (ВНИМАНИЕ: удалит базу данных!)
docker-compose down -v
```

### Обновление Приложения

```bash
# 1. Получить новый код
git pull

# 2. Пересобрать и перезапустить
docker-compose build --no-cache
docker-compose up -d
```

### Бэкап База Данных

```bash
# Создать бэкап
docker-compose exec mongodb mongodump --out /data/backup

# Копировать бэкап на хост
docker cp tarot_mongodb:/data/backup ./mongodb_backup_$(date +%Y%m%d)
```

### Восстановление из Бэкапа

```bash
# Копировать бэкап в контейнер
docker cp ./mongodb_backup tarot_mongodb:/data/restore

# Восстановить
docker-compose exec mongodb mongorestore /data/restore
```

## 🔐 Безопасность

### Обязательные Шаги После Развертывания

1. **Изменить пароль администратора**
   - Войдите в админку: https://tarot.dagnir.ru/admin/login
   - Логин: `admin`, Пароль: `admin123`
   - Измените пароль в настройках

2. **Изменить SECRET_KEY**
   ```bash
   # Сгенерировать случайный ключ
   openssl rand -hex 32
   
   # Обновить в .env файле
   SECRET_KEY=generated_key_here
   
   # Перезапустить backend
   docker-compose restart backend
   ```

3. **Настроить Firewall**
   ```bash
   # Разрешить только необходимые порты
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

### Мониторинг

```bash
# Проверка статуса контейнеров
docker-compose ps

# Использование ресурсов
docker stats

# Проверка работоспособности
curl https://tarot.dagnir.ru/api/
```

## 🐛 Решение Проблем

### Проблема: Сервисы не запускаются

```bash
# Проверить логи
docker-compose logs

# Проверить статус
docker-compose ps

# Пересобрать образы
docker-compose build --no-cache
docker-compose up -d
```

### Проблема: SSL не работает

```bash
# Проверить наличие сертификатов
ls -la nginx/ssl/

# Проверить конфигурацию nginx
docker-compose exec nginx nginx -t

# Перезапустить nginx
docker-compose restart nginx
```

### Проблема: База данных не доступна

```bash
# Проверить статус MongoDB
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"

# Перезапустить MongoDB
docker-compose restart mongodb
```

### Проблема: Frontend не загружается

```bash
# Проверить логи frontend
docker-compose logs frontend

# Проверить доступность backend
curl http://localhost:8001/api/

# Пересобрать frontend
docker-compose build frontend
docker-compose up -d frontend
```

## 📊 Production Checklist

- [ ] Изменен пароль администратора
- [ ] Изменен SECRET_KEY в .env
- [ ] SSL сертификаты установлены
- [ ] Настроен firewall
- [ ] Настроены SendGrid ключи (опционально)
- [ ] Настроены автоматические бэкапы
- [ ] Настроено автоматическое обновление SSL
- [ ] Проверена работа всех функций сайта
- [ ] Настроен мониторинг (опционально)

## 🔄 Автоматическое Обновление SSL

Добавьте в crontab:

```bash
sudo crontab -e
```

Добавьте строку:

```
0 0 * * * certbot renew --quiet && cp /etc/letsencrypt/live/tarot.dagnir.ru/*.pem /path/to/app/nginx/ssl/ && cd /path/to/app && docker-compose restart nginx
```

## 📞 Поддержка

Если возникли проблемы:
1. Проверьте логи всех сервисов
2. Убедитесь, что все контейнеры запущены
3. Проверьте конфигурацию .env файлов
4. Проверьте DNS записи для домена

## 🎉 Готово!

Ваш сайт доступен по адресу: **https://tarot.dagnir.ru**

Админ панель: **https://tarot.dagnir.ru/admin/login**