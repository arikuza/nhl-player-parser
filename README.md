# NHL Player Parser & Database

A comprehensive NHL player database application with advanced search, filtering, and team-building capabilities.

## Features

- **Complete Player Database**: 1635 NHL players including forwards, defensemen, and goalies
- **Advanced Search & Filtering**: Filter by position, team, card type, and overall rating
- **Detailed Player Cards**: View complete stats and player information in modal cards
- **Line Combinations**: Pre-configured optimal line combinations for team building
- **Metric Conversions**: Automatic conversion between imperial and metric units
- **Performance Groups**: Grouped statistics for easy comparison (Skating, Shooting, Handling, etc.)
- **Responsive Design**: Clean, modern interface with team-specific colors

## Установка и запуск

### Требования
- Node.js (версия 16 или выше)
- npm

### Установка
```bash
npm install
```

### Запуск
```bash
npm start
```

Приложение откроется в браузере по адресу http://localhost:3000

## Использование

1. Откройте приложение в браузере
2. Нажмите кнопку "Start Player Extraction"
3. Дождитесь завершения процесса парсинга (будет показан прогресс)
4. После завершения выберите нужный тип экспорта:
   - **Export All Players** - все игроки в одном файле
   - **Export Forwards Only** - только нападающие
   - **Export Defensemen Only** - только защитники
   - **Export Goalies Only** - только вратари

## Структура данных

Каждый игрок содержит следующую информацию:

```json
{
  "id": "1001",
  "full_name": "TROY TERRY",
  "position": "RW",
  "team": "ANA",
  "nationality": "USA",
  "league": "NHL",
  "hand": "RIGHT",
  "height": "6' 0\"",
  "weight": "191 lb",
  "card": "BA",
  "overall": "84",
  "aOVR": "84.90",
  "acceleration": "88",
  "agility": "87",
  "balance": "83",
  "endurance": "81",
  "speed": "88",
  "slap_shot_accuracy": "87",
  "slap_shot_power": "86",
  "wrist_shot_accuracy": "88",
  "wrist_shot_power": "86",
  "deking": "88",
  "off_awareness": "84",
  "hand_eye": "88",
  "passing": "86",
  "puck_control": "88",
  "body_checking": "83",
  "strength": "83",
  "aggression": "82",
  "durability": "83",
  "fighting_skill": "62",
  "def_awareness": "81",
  "shot_blocking": "78",
  "stick_checking": "83",
  "faceoffs": "68",
  "discipline": "82",
  "date_added": "2025-09-07",
  "date_updated": "0000-00-00"
}
```

## Технические детали

### Архитектура
- **React** с TypeScript для фронтенда
- **Axios** для HTTP запросов
- **Прокси-сервер** для обхода CORS ограничений

### Особенности парсинга
- Батчевая загрузка данных (по 100 записей)
- Автоматическая очистка HTML тегов из данных
- Обработка ошибок и повторные попытки
- Вежливые задержки между запросами (100ms)

### CORS и прокси
Приложение использует встроенный прокси React для обхода CORS ограничений. Все запросы к NHL HUT Builder проксируются через локальный сервер разработки.

## Структура проекта

```
nhl-player-parser/
├── public/
├── src/
│   ├── services/
│   │   └── nhlScraper.ts    # Логика парсинга и обработки данных
│   ├── App.tsx              # Главный компонент
│   ├── App.css              # Стили
│   └── index.tsx            # Точка входа
├── package.json
└── README.md
```

## Дополнительные команды

### `npm test`
Запуск тестов

### `npm run build`
Сборка приложения для продакшн

### `npm run eject`
**Примечание: это необратимая операция!**

## Лицензия

Этот проект создан для образовательных и исследовательских целей. Пожалуйста, используйте данные ответственно и с уважением к источнику.

---

**Примечание**: Приложение парсит публично доступные данные с сайта NHL HUT Builder. Убедитесь, что вы соблюдаете условия использования сайта.
