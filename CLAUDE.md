# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
# Install all workspaces
npm install

# Start all dev servers (API + Web)
npm run dev

# Build all packages
npm run build

# Run all tests
npm run test

# Run single workspace
npm run dev --workspace=apps/api
npm run dev --workspace=apps/web
npm run test --workspace=apps/api
npm run test --workspace=apps/web

# Run a single backend test file
npx jest --config apps/api/package.json -- classification.service.spec

# Run a single frontend test file
npx vitest run --config apps/web/vite.config.ts src/components/atoms/Button.test.tsx

# Infrastructure
docker compose up -d          # PostgreSQL (5450) + Redis (6350)
npm run db:seed               # Populate Rahmenvertrag seed data

# Access points
# Frontend:    http://localhost:5500
# API:         http://localhost:3050/api/v1
# Swagger UI:  http://localhost:3050/api/docs
```

## Architecture

Turborepo monorepo with three workspaces:

- **`apps/api`** — NestJS backend (port 3050). Feature-based modules: classification, search, documentation, embedding, health, ai. Each module follows controller → service → repository pattern with DTOs for validation.
- **`apps/web`** — React + Vite frontend (port 5500). Atomic Design component hierarchy (atoms → molecules → organisms → templates → pages). Zustand for UI state, React Query for server state.
- **`packages/shared`** — TypeScript types and constants shared between API and web. Domain enums (Kanal, Marktplatz, ComplianceStatus, Konfidenz), procurement thresholds (SCHWELLENWERTE), CPV codes.

## Key Patterns

- **AI with fallback**: `ClassificationService` calls Azure OpenAI for CPV classification. If unavailable, falls back to rule-based keyword matching in `regelbasierteKlassifizierung()`.
- **Mock marketplace adapters**: `SearchService` uses hardcoded MOCK_ARTIKEL array simulating Amazon Business, Mercateo, Conrad. No real API integrations.
- **Integrity hashing**: `DocumentationService` generates SHA-256 hashes for audit-trail documents.
- **Shared type imports**: Both apps import from `@procurement/shared`. Backend resolves via tsconfig paths + Jest moduleNameMapper. Frontend resolves via Vite alias.

## Language & Domain

All UI text, API responses, variable names, and error messages are in **German**. This is intentional — the system is a German public procurement (Vergaberecht) tool. Key domain terms:
- Rahmenvertrag = framework agreement
- Schwellenwert = threshold value
- Vergabedokumentation = procurement documentation
- CPV = Common Procurement Vocabulary (EU classification)

## Environment

Azure OpenAI config, database, and Redis connection details are in `.env` (not committed). Copy `.env.example` to `.env` and fill in `AZURE_OPENAI_API_KEY` and `AZURE_OPENAI_ENDPOINT`. The API works without OpenAI keys (falls back to rule-based classification).

## TypeORM

Uses `synchronize: true` in development — no migrations needed during dev. Entities are in each module's `entities/` directory. Seed data for Rahmenverträge is in `apps/api/src/config/seed.ts`.

## Git Conventions

- **Conventional Commits**: `type(scope): description`
- **Types**: feat, fix, docs, chore, test, refactor
- **Language**: English
- **Never mention** AI, Claude, LLM, "generated", or "automated" in commits
- **Write commits** as a senior developer would
- Examples: `feat(api): add classification endpoint with eClass mapping`, `fix(web): resolve mobile navigation z-index issue`
