# Логотипы организаций-докладчиков

Файлы для карточек в блоке «Спикеры». Все приведены к одному размеру
по отображению: до 150 px в ширину и до 32 px в высоту, пропорции сохранены.

| Файл | Организация | Источник |
|---|---|---|
| `savtech.png` | САВТЭК | [savtech.ru](https://savtech.ru/) — файл заказчика |
| `tramplin.png` | Трамплин Электроникс | [tramplin.group](https://tramplin.group/) — файл заказчика |
| `tsocket.png` | Тестовые Решения | [tsocket.ru](https://tsocket.ru/) — товарный знак с сайта |
| `lmp.png` | ЛАБОРАТОРИЯ МИКРОПРИБОРОВ | [mp-lab.ru](https://mp-lab.ru/) — файл заказчика |
| `gsnanotech.png` | GS Nanotech | [gsnanotech.ru](https://gsnanotech.ru/) — файл заказчика |
| `progress.png` | НИИМА «Прогресс» | [i-progress.tech](https://i-progress.tech/) — файл заказчика |
| `mipt.png` | МФТИ | [mipt.ru](https://mipt.ru/) |
| `icp.png` | ФИЦ ПХФ и МХ РАН | [icp-ras.ru](https://icp-ras.ru/) — раздел «Бланк и логотип» |
| `niisi.png` | НИИСИ РАН | [niisi.ru](https://www.niisi.ru/) |
| `niipp.png` | НИИПП | [niipp.ru](https://www.niipp.ru/) |

Логотипы партнёров лежат отдельно — в `images/logos/partners/`.

## Что сделано с файлами

- белый фон вырезан в прозрачность (карточки белые);
- белые версии логотипов (ЛАБОРАТОРИЯ МИКРОПРИБОРОВ) перекрашены
  в тёмный цвет, цветные элементы сохранены;
- обрезаны поля, файлы сжаты без потери резкости.

## Как заменить или добавить

1. Положить файл в эту папку.
2. В `index.html` внутри `.speaker-brand` добавить или заменить `<img>`:

```html
<div class="speaker-brand">
    <h3 class="speaker-name">Название организации</h3>
    <img src="images/logos/speakers/имя.png" alt="" width="300" height="100" loading="lazy">
</div>
```

`alt` у логотипа пустой намеренно: название организации уже есть в `h3`
рядом, и скринридер не должен читать его дважды.

Размер задаётся стилями (`.speaker-brand img` в `css/speakers.css`), а не
атрибутами — `width` и `height` в разметке нужны только для того, чтобы
браузер не «прыгал» при загрузке.
