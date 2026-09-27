# Veora — базовая сборка многостраничного сайта

Vite собирает отдельные HTML-страницы, TypeScript и SCSS. Nunjucks даёт страницам наследовать общий layout через `extends` и переопределять его блоки. Шрифт Inter поставляется локально через Fontsource и входит в сборку без запросов к Google Fonts. Результат — статические файлы, которые можно подготовить к переносу в сайты Битрикс24.

## Запуск

```bash
npm install
npm run dev
```

Откройте адрес, который выведет Vite. Готовую сборку создаёт `npm run build` в папке `dist/`. Для её локального просмотра — `npm run preview`.

## Структура

- `index.html` — главная страница.
- `about/index.html` — пример внутренней страницы.
- `src/templates/layout.njk` — общий HTML-каркас с блоком `content`.
- `src/components/` — переиспользуемые БЭМ-компоненты; у каждого свой `.njk` и `.scss`.
- `src/sections/` — секции страниц как самостоятельные БЭМ-блоки; у каждой свой `.njk` и `.scss`.
- `src/data/site.json` — общие данные сайта; `src/data/pages/` — данные отдельных страниц.
- `src/styles/main.scss` — точка подключения SCSS компонентов и секций; `_base.scss` и `_tokens.scss` — базовые стили и переменные.
- `src/main.ts` — клиентский TypeScript.
- `vite.config.mjs` — поиск HTML-страниц, подключение шаблонов и загрузка JSON-данных.
- `AGENTS.md` — правила вёрстки, включая `1rem = 10px` и медиавыражения в пикселях.

## Новая страница

Создайте `contacts/index.html` с наследованием layout и подключением секции:

```html
{% extends "layout.njk" %}
{% block content %}
  {% include "sections/contacts/contacts.njk" %}
{% endblock %}
```

Создайте данные `src/data/pages/contacts/index.json` с `title`, `description`, `activePage` и данными секции. Добавьте секцию в `src/sections/contacts/` с файлами `contacts.njk` и `_contacts.scss`; подключите SCSS в `src/styles/main.scss`. Для ссылки в навигации дополните `src/data/site.json`.

Страница будет доступна по `/contacts/` и автоматически попадёт в `dist/contacts/index.html`. Путь к JSON повторяет путь к HTML-странице внутри `src/data/pages/`.

Файлы из `public/` (если папка нужна) Vite копирует в сборку без обработки. Импортируемые из TypeScript и SCSS ресурсы Vite обрабатывает и хеширует.
