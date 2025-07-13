# Wholumi WebSocket Server

WebSocket сервер для расширения Wholumi Chrome Extension.

## Установка

```bash
cd websocket-server
npm install
```

## Запуск

### Продакшн
```bash
npm start
```

### Разработка (с автоперезагрузкой)
```bash
npm run dev
```

## Конфигурация

Сервер использует следующие порты по умолчанию:
- HTTP API: 8080
- WebSocket: 8081

Можно изменить через переменные окружения:
```bash
PORT=3000 WS_PORT=3001 npm start
```

## API

### HTTP Endpoints

- `GET /status` - Статус сервера и статистика
- `GET /clients` - Список подключенных клиентов
- `GET /health` - Проверка здоровья сервера
- `POST /broadcast` - Отправка сообщения в комнату

### WebSocket Messages

#### Типы сообщений от клиента:

1. **join_room** - Присоединиться к комнате
```json
{
  "type": "join_room",
  "room": "boost"
}
```

2. **leave_room** - Покинуть комнату
```json
{
  "type": "leave_room",
  "room": "boost"
}
```

3. **broadcast_to_room** - Отправить сообщение всем в комнате
```json
{
  "type": "broadcast_to_room",
  "room": "boost",
  "data": { "message": "Hello everyone!" }
}
```

4. **private_message** - Личное сообщение
```json
{
  "type": "private_message",
  "targetClientId": "client-uuid",
  "data": { "message": "Hello!" }
}
```

5. **boost_event** - События буста карт
```json
{
  "type": "boost_event",
  "data": {
    "cardId": "123",
    "clubId": "456",
    "action": "boost_success"
  }
}
```

6. **trade_event** - События торговли
```json
{
  "type": "trade_event",
  "data": {
    "tradeId": "789",
    "action": "trade_created"
  }
}
```

7. **config_update** - Обновление конфигурации
```json
{
  "type": "config_update",
  "data": {
    "key": "functionConfig",
    "value": { "clubBoost": true }
  }
}
```

8. **ping** - Пинг для проверки соединения
```json
{
  "type": "ping"
}
```

#### Типы сообщений от сервера:

- `connection` - Подтверждение подключения
- `room_joined` - Подтверждение входа в комнату
- `room_left` - Подтверждение выхода из комнаты
- `room_broadcast` - Сообщение от других участников комнаты
- `private_message` - Личное сообщение
- `error` - Ошибка
- `pong` - Ответ на ping

## Комнаты

Предустановленные комнаты для Wholumi:
- `boost` - События буста карт
- `trade` - События торговли
- `config` - Обновления конфигурации
- `general` - Общие события

## Особенности

- Автоматическая очистка неактивных соединений (5 минут)
- Поддержка множественных комнат для одного клиента
- HTTP API для мониторинга и управления
- Graceful shutdown при получении SIGTERM/SIGINT
