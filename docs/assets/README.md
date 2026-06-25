# Assets folder

Помести финальные файлы в эту папку, сохраняя структуру:

```text
assets/
  scenes/
    northern-route/
      nr-01/
        a.webp
        b.webp
        thumb.webp
  artifacts/
    brass-compass.webp
    field-radio.webp
    blue-flower.webp
    torn-map.webp
  ui/
```

Codex может скопировать эту структуру в `public/assets/`.

Не размещай master PNG в runtime build. Source masters лучше хранить отдельно.
