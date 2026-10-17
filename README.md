# OfficeFlow

Platforma do zarządzania przestrzenią biurową (PMS) — szkielet projektu w architekturze Clean Architecture.

## Struktura repozytorium

```text
OfficeFlow/
├── backend/                 # Solucja .NET (ASP.NET Core Web API)
│   ├── OfficeFlow.sln
│   ├── OfficeFlow.Domain/
│   ├── OfficeFlow.Application/
│   ├── OfficeFlow.Infrastructure/
│   ├── OfficeFlow.Api/
│   └── OfficeFlow.Tests/    # Testy jednostkowe (xUnit)
├── frontend/                # Aplikacja React (Vite + TypeScript)
├── docker-compose.yml       # PostgreSQL
└── README.md
```

## Wymagania

- [.NET 8 SDK](https://dotnet.microsoft.com/download) (lub nowszy z obsługą `net8.0`)
- [Node.js](https://nodejs.org/) 18+ oraz npm
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (do uruchomienia PostgreSQL)

## 1. Uruchomienie bazy danych (Docker)

Z katalogu głównego projektu:

```bash
docker compose up -d
```

Sprawdzenie statusu kontenera:

```bash
docker compose ps
```

Domyślne parametry połączenia (z `docker-compose.yml`):

| Parametr   | Wartość         |
| ---------- | --------------- |
| Host       | `localhost`     |
| Port       | `5432`          |
| Database   | `officeflow_db` |
| User       | `officeflow`    |
| Password   | `officeflow`    |

Connection string (przykład):

```text
Host=localhost;Port=5432;Database=officeflow_db;Username=officeflow;Password=officeflow
```

Zatrzymanie bazy (dane w wolumenie pozostają):

```bash
docker compose down
```

Usunięcie danych (wolumen):

```bash
docker compose down -v
```

## 2. Uruchomienie backendu

```bash
cd backend
dotnet restore
dotnet run --project OfficeFlow.Api
```

API startuje domyślnie pod adresem wskazanym w konsoli (zwykle `https://localhost:7xxx` / `http://localhost:5xxx`). Swagger UI jest dostępny w środowisku Development.

Kompilacja całej solucji:

```bash
dotnet build OfficeFlow.sln
```

### Testy jednostkowe

Projekt `OfficeFlow.Tests` (xUnit + Moq + FluentAssertions) weryfikuje kluczową logikę Application, m.in. tworzenie rezerwacji i wyliczanie kosztu.

Z katalogu `backend`:

```bash
dotnet test
```

Albo tylko projekt testowy:

```bash
dotnet test OfficeFlow.Tests/OfficeFlow.Tests.csproj
```

## 3. Uruchomienie frontendu

```bash
cd frontend
npm install
npm run dev
```

Aplikacja Vite będzie dostępna pod adresem wyświetlonym w terminalu (zwykle `http://localhost:5173`).

## Warstwy backendu (Clean Architecture)

| Projekt                    | Rola                                      |
| -------------------------- | ----------------------------------------- |
| `OfficeFlow.Domain`        | Encje i logika domenowa                   |
| `OfficeFlow.Application`   | Przypadki użycia, DTO, interfejsy         |
| `OfficeFlow.Infrastructure`| EF Core, PostgreSQL, implementacje        |
| `OfficeFlow.Api`           | Kontrolery / Minimal API, konfiguracja DI |
| `OfficeFlow.Tests`         | Testy jednostkowe (xUnit)                 |

Referencje projektów:

- `Application` → `Domain`
- `Infrastructure` → `Application`
- `Api` → `Application`, `Infrastructure`
