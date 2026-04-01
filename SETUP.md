# Setup

## 1. MongoDB

Убедись, что локальный MongoDB запущен.

Строка подключения лежит в:

`server/.env`

Сейчас используется:

`MONGODB_URI=mongodb://localhost:27017/consultation-qa`

## 2. Backend

```bash
cd server
npm install
npm run dev
```

## 3. Frontend

```bash
cd client
npm install
npm run dev
```

## 4. Наполнение базы

```bash
cd server
npm run seed
```

После этого в MongoDB появятся:

- пользователи
- эксперты
- админ
- вопросы
- ответы
- консультации

## 5. Перенос данных на другой ПК

Экспорт:

```bash
cd ..
npm run export:data
```

Импорт на другом компьютере:

```bash
npm run import:data
```

Файл переноса:

`server/data-transfer/topichub-export.ejson`
