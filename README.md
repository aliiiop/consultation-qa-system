# TopicHub

TopicHub это приложение на `React + Node.js + Express + MongoDB` для:

- вопросов и ответов по разделам
- консультаций с экспертами
- админ-панели

## Структура

- `client/` — frontend на Vite + React
- `server/` — backend на Express + MongoDB

## MongoDB

Приложение использует базу:

`mongodb://localhost:27017/consultation-qa`

Имя базы данных:

`consultation-qa`

Коллекции:

- `users`
- `questions`
- `consultations`

## Команды

Из корня проекта:

```bash
npm run server
```

```bash
npm run client
```

```bash
npm run seed
```

```bash
npm run export:data
```

```bash
npm run import:data
```

```bash
npm run build
```

## Демо-аккаунты

Админ:

- `admin@topichub.demo`
- `admin1234`

## Что уже есть

- категории вопросов
- ответы и лучший ответ
- консультации
- роли `user`, `expert`, `admin`
- админ-панель `/admin`

## Если не видно данные в MongoDB

Открой именно базу `consultation-qa`, а не `test` и не `admin`.

Если нужно заново заполнить базу:

```bash
npm run seed
```

## Перенос на другой компьютер

На исходном компьютере:

```bash
npm run export:data
```

Файл появится здесь:

`server/data-transfer/topichub-export.ejson`

На новом компьютере:

1. запусти MongoDB
2. проверь `server/.env`
3. выполни:

```bash
npm run import:data
```

Важно:

- импорт полностью заменяет коллекции `users`, `questions`, `consultations`
- переносятся пользователи, пароли, роли, вопросы, ответы и консультации
