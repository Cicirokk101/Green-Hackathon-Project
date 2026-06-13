## Green Hackathon Project

## Initial Setup
```
uv sync
cd frontend && npm install
```

## Start Server

```
uv run python backend/manage.py migrate
uv run python backend/manage.py runserver &
cd frontend && npm run dev
```