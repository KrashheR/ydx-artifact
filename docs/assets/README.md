# Assets folder

Помести финальные файлы в эту папку, сохраняя структуру:

```text
assets/
  scenes/
    northern-route/
      nr-01/
        a.png
        b.png
        thumb.png
  artifacts/
    brass-compass.webp
    field-radio.webp
    blue-flower.webp
    torn-map.webp
  ui/
```

Codex может скопировать эту структуру в `public/assets/`.

Не размещай в runtime build многослойные master-файлы или лишние промежуточные экспорты. Рабочие source-файлы лучше хранить отдельно.
