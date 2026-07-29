# Property Portal

A unified multi-application Next.js portal that hosts two independent backend services:

- **Property Value Estimator** — FastAPI backend integrated with a house-price regression model, providing an estimation form, estimate history, and side-by-side comparison.
- **Property Market Analysis** — Spring Boot backend that delivers market statistics dashboards, what-if analysis, and data export.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend portal | Next.js 16+ (App Router), TypeScript, Tailwind CSS, Recharts, react-hook-form + Zod |
| App 1 backend | Python 3.12, FastAPI, Pydantic v2, SQLModel, aiosqlite, httpx |
| App 2 backend | Java 21, Spring Boot 3.4.4 |
| Model inference | External FastAPI regression-model container (port 8000) |
| Dependency / build | uv (Python), Maven Wrapper (Java), npm (Node) |

## Port Allocation

| Service | Port | Description |
|---|---|---|
| ML model container | 8000 | Exposes `/predict`, `/model`, `/health` |
| Property Value Estimator | 8001 | FastAPI backend |
| Property Market Analysis | 8080 | Spring Boot backend |
| Next.js Portal | 3000 | Unified frontend portal |

## Local Development

### 1. Start the ML model container

Make sure the model service is running at `http://localhost:8000`. If a model container has been provided, start it directly; otherwise refer to the corresponding `Dockerfile`.

### 2. Start Property Value Estimator (port 8001)

```bash
cd app1-backend
uv sync
uv run uvicorn app.main:app --reload --port 8001
```

Environment variables (defaults):
- `ML_MODEL_URL=http://localhost:8000`
- `DATABASE_URL=sqlite+aiosqlite:///./estimates.db`
- `CORS_ORIGINS=http://localhost:3000`

### 3. Start Property Market Analysis (port 8080)

```bash
cd app2-backend
JAVA_HOME=$(/usr/libexec/java_home -v 21) ./mvnw spring-boot:run
```

Environment variable:
- `APP_MLMODELURL=http://localhost:8000`

### 4. Start the frontend portal (port 3000)

```bash
cd portal
npm install
npm run dev
```

Open http://localhost:3000.

## Model API Contract

The applications interact with the model container through these endpoints:

| Endpoint | Method | Description |
|---|---|---|
| `/predict` | POST | Request body is an array of feature objects (≥1 item); response is `{"predictions": [...]}` |
| `/model` | GET | Returns model metadata: algorithm, R², RMSE, coefficients, intercept |
| `/health` | GET | Returns `{"status": "Ok"}` |

## Feature Overview

### Property Value Estimator
- Form for entering all 7 house feature fields
- Client-side validation with unified error messages
- Single-estimate result display (table + chart)
- Paginated estimate history
- Side-by-side property comparison

### Property Market Analysis
- Market-statistics KPIs and visualizations (price distribution, size vs. price, etc.)
- Segment-dimension switching: bedrooms, decade built, school rating, distance to city center
- What-if analysis tool: enter any property features and get a model prediction
- Sortable and filterable data table
- CSV / PDF data export



## Testing

```bash
# Python backend
cd app1-backend
uv run pytest

# Java backend
cd app2-backend
JAVA_HOME=$(/usr/libexec/java_home -v 21) ./mvnw -B verify

# Frontend
cd portal
npm run lint
npm run build
```

## Project Structure

```
portal/          # Next.js frontend portal
app1-backend/    # FastAPI backend (Property Value Estimator)
app2-backend/    # Spring Boot backend (Property Market Analysis)
docker-compose.yml
```

## License

Private / internal project
