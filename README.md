# KI-Klassifizierungsmodul fuer eProcurement

Turborepo-Monorepo mit NestJS Backend, React Frontend und Shared Types.
Azure OpenAI als KI-Provider fuer Artikelklassifizierung und CPV-Code-Zuordnung.

## Architektur

```
procurement-ai-module/
  apps/
    api/          # NestJS Backend (Port 3000)
    web/          # React + Vite Frontend (Port 5173)
  packages/
    shared/       # Geteilte Types und Konstanten
  docs/
    openapi.yaml  # API-Spezifikation
```

## Voraussetzungen

- Node.js >= 20
- Docker & Docker Compose
- (Optional) Azure OpenAI API-Key

## Setup

### 1. Repository klonen und Dependencies installieren

```bash
cd procurement-ai-module
npm install
```

### 2. Umgebungsvariablen konfigurieren

```bash
cp .env.example .env
# .env bearbeiten und Azure OpenAI Keys eintragen
```

### 3. Datenbank und Redis starten

```bash
docker compose up -d
```

### 4. Datenbank mit Seed-Daten befuellen

```bash
npm run db:seed
```

### 5. Entwicklungsserver starten

```bash
npm run dev
```

- **Backend API:** http://localhost:3000
- **Swagger UI:** http://localhost:3000/api/docs
- **Frontend:** http://localhost:5173

## API-Endpunkte

| Methode | Pfad | Beschreibung |
|---------|------|--------------|
| POST | `/api/v1/classify` | Artikel klassifizieren |
| POST | `/api/v1/search` | Marktplatz-Suche |
| GET | `/api/v1/documentation/:id` | Vergabedokumentation |
| GET | `/api/v1/health` | Health Check |

## Tests

```bash
# Alle Tests
npm run test

# Backend Tests
npm run test --workspace=apps/api

# Frontend Tests
npm run test --workspace=apps/web
```

## Produktion

```bash
# Mit Docker Compose
docker compose -f docker-compose.prod.yml up --build
```

## Technologie-Stack

- **Backend:** NestJS, TypeORM, PostgreSQL (pgvector), Redis
- **Frontend:** React 18, Vite, TailwindCSS, React Query, Zustand
- **KI:** Azure OpenAI (GPT-4, text-embedding-ada-002)
- **Build:** Turborepo
- **Tests:** Jest, Vitest, Playwright
