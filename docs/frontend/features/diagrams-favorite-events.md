# Diagrams: Favorite Events Functionality

> These diagrams accompany the [PRD](./prd-favorite-events.md). All diagrams use [Mermaid](https://mermaid.js.org/) and render natively on GitHub, GitLab, and VS Code (Markdown Preview).  
> **New components** are highlighted in green throughout.

| #   | Diagram                                                                              | Audience           |
| --- | ------------------------------------------------------------------------------------ | ------------------ |
| 1   | [System Context](#1-system-context)                                                  | All stakeholders   |
| 2a  | [Add Favorite (authenticated)](#2a-add-favorite-authenticated)                       | Frontend / QA      |
| 2b  | [Remove Favorite (authenticated)](#2b-remove-favorite-authenticated)                 | Frontend / QA      |
| 2c  | [Unauthenticated click](#2c-unauthenticated-user-clicks-favorite)                    | Frontend / QA      |
| 2d  | [Sign-in bootstrap](#2d-sign-in--favorites-bootstrap)                                | Frontend / Backend |
| 2e  | [Favorites tab load](#2e-favorites-tab-load-profile-page)                            | Frontend / Backend |
| 2f  | [Sign-out clear](#2f-sign-out--favorites-cleared)                                    | Frontend           |
| 3   | [Data Model (ER)](#3-data-model-er-diagram)                                          | Backend / DBA      |
| 4   | [Frontend component architecture](#4-frontend-component-architecture)                | Frontend           |
| 5   | [Redux state flow](#5-redux-state-flow--optimistic-update--rollback)                 | Frontend           |
| 6   | [Backend module structure](#6-backend-module-structure-pantry-registration-api-node) | Backend            |

---

## 1. System Context

How the three services interact when a user favorites an event. Cognito issues the JWT that authorizes write operations; the finder API is queried separately to hydrate event details for the Favorites tab.

```mermaid
graph TB
    subgraph Browser["Browser (freshtrak-client)"]
        UI["React UI"]
        Redux["Redux Store\n(favoritesSlice)"]
    end

    subgraph RegAPI["pantry-registration-api-node"]
        FavCtrl["FavoritesController\nPOST · DELETE · GET /api/favorites"]
        UsersDB[("MySQL\nusers\nuser_event_favorites")]
    end

    subgraph FinderAPI["pantry-finder-api-node (read-only)"]
        EventsCtrl["EventsController\nGET /api/events/{id}"]
        EventsDB[("MySQL\nevents\nevent_dates")]
    end

    Cognito["AWS Cognito\n(JWT issuer)"]

    UI -- "sign in → receives JWT" --> Cognito
    UI -- "GET /api/favorites\nPOST /api/favorites\nDELETE /api/favorites/:id\n[Bearer JWT]" --> FavCtrl
    FavCtrl -- "reads / writes" --> UsersDB
    UI -- "GET /api/events/{id}\n(no auth required)" --> EventsCtrl
    EventsCtrl -- "reads" --> EventsDB
    Redux -- "caches favoriteEventIds\n(redux-persist)" --> UI
```

---

## 2. Sequence Diagrams

### 2a. Add Favorite (Authenticated)

```mermaid
sequenceDiagram
    actor User
    participant Card as EventCardComponent
    participant Btn as FavoriteButton
    participant Slice as favoritesSlice (Redux)
    participant Svc as FavoritesApiService
    participant API as registration-api /api/favorites

    User->>Btn: clicks outlined star ☆
    Btn->>Slice: dispatch addFavorite(eventId) — optimistic
    Slice-->>Card: isFavorited = true (filled star ★ rendered instantly)
    Btn->>Svc: POST /api/favorites { event_id }
    Svc->>API: POST with Bearer JWT
    alt success (201)
        API-->>Svc: { id, user_id, event_id, created_at }
        Svc-->>Slice: fulfilled — no state change needed
    else failure (4xx / 5xx / network)
        API-->>Svc: error
        Svc-->>Slice: rejected — dispatch rollback
        Slice-->>Card: isFavorited = false (outlined star ☆ restored)
        Slice-->>User: show error toast
    end
```

### 2b. Remove Favorite (Authenticated)

```mermaid
sequenceDiagram
    actor User
    participant Card as EventCardComponent
    participant Btn as FavoriteButton
    participant Slice as favoritesSlice (Redux)
    participant Svc as FavoritesApiService
    participant API as registration-api /api/favorites/:eventId

    User->>Btn: clicks filled star ★
    Btn->>Slice: dispatch removeFavorite(eventId) — optimistic
    Slice-->>Card: isFavorited = false (outlined star ☆ rendered instantly)
    Btn->>Svc: DELETE /api/favorites/:eventId
    Svc->>API: DELETE with Bearer JWT
    alt success (204)
        API-->>Svc: no body
        Svc-->>Slice: fulfilled — no state change needed
    else failure (4xx / 5xx / network)
        API-->>Svc: error
        Svc-->>Slice: rejected — dispatch rollback
        Slice-->>Card: isFavorited = true (filled star ★ restored)
        Slice-->>User: show error toast
    end
```

### 2c. Unauthenticated User Clicks Favorite

```mermaid
sequenceDiagram
    actor Guest
    participant Card as EventCardComponent
    participant Btn as FavoriteButton
    participant Auth as useAuth()
    participant Dialog as LoginPromptDialog

    Guest->>Btn: clicks outlined star ☆
    Btn->>Auth: isAuthenticated?
    Auth-->>Btn: false
    Btn->>Dialog: open()
    Dialog-->>Guest: "Sign in to save favorites"\n[Log in] button → /login
    alt Guest clicks Log In
        Guest->>Dialog: click "Log in"
        Dialog-->>Guest: navigate to /login
    else Guest dismisses
        Guest->>Dialog: close
        Dialog-->>Btn: star remains outlined ☆ (no state change)
    end
    Note over Btn,Auth: No API call is ever made
```

### 2d. Sign-In — Favorites Bootstrap

```mermaid
sequenceDiagram
    actor User
    participant Auth as AuthContext
    participant Slice as favoritesSlice (Redux)
    participant Svc as FavoritesApiService
    participant RegAPI as registration-api GET /api/favorites

    User->>Auth: signIn(email, password)
    Auth->>Auth: Cognito authentication
    Auth-->>User: success — JWT stored
    Auth->>Slice: dispatch fetchFavorites()
    Slice->>Svc: GET /api/favorites [Bearer JWT]
    Svc->>RegAPI: GET /api/favorites
    RegAPI-->>Svc: { favorites: [{ id, event_id, created_at }] }
    Svc-->>Slice: fulfilled — store favoriteEventIds[]
    Slice-->>Auth: status = 'idle'
    Note over Slice: IDs persisted via redux-persist
```

### 2e. Favorites Tab Load (Profile Page)

```mermaid
sequenceDiagram
    actor User
    participant Profile as ProfilePage
    participant Tab as FavoritesTab
    participant Slice as favoritesSlice (Redux)
    participant Svc as FavoritesApiService
    participant FinderAPI as finder-api GET /api/events/{id}

    User->>Profile: navigate to Profile → Favorites tab
    Tab->>Slice: selectFavoriteEventIds()
    Slice-->>Tab: [101, 204, 389, ...]

    loop for each event_id (sequential)
        Tab->>Svc: GET /api/events/{id}
        Svc->>FinderAPI: GET /api/events/{id} (no auth)
        FinderAPI-->>Svc: event { id, name, event_dates, ... }
        Svc-->>Tab: event detail
    end

    Tab->>Tab: check each event's event_dates\nare any dates ≥ today?
    alt all dates in the past
        Tab-->>User: render card + "Past event" badge (muted)
    else has future dates
        Tab-->>User: render card normally
    end

    alt no favorites exist
        Tab-->>User: empty state —\n"Tap ⭐ on any event to save it"
    end
```

### 2f. Sign-Out — Favorites Cleared

```mermaid
sequenceDiagram
    actor User
    participant Auth as AuthContext
    participant Slice as favoritesSlice (Redux)
    participant Persist as redux-persist

    User->>Auth: signOut()
    Auth->>Auth: Cognito.signOut()
    Auth->>Slice: dispatch clearFavorites()
    Slice-->>Slice: favoriteEventIds = []
    Persist-->>Persist: purge favorites key from storage
    Auth-->>User: redirected to /login
```

---

## 3. Data Model (ER Diagram)

The new `user_event_favorites` junction table lives in the **pantry-registration-api-node** database. `event_id` is a foreign reference to the `events` table in the **pantry-finder-api-node** database (cross-service integer reference — no enforced DB-level FK across databases).

```mermaid
erDiagram
    users {
        int id PK
        binary cognito_uuid
        string user_type
        datetime created_at
        datetime updated_at
    }

    user_event_favorites {
        int id PK
        int user_id FK
        int event_id "ref: finder-api events.id"
        datetime created_at
    }

    households {
        int id PK
        int user_id FK
    }

    registrations {
        int id PK
        int household_id FK
        int event_id "ref: finder-api events.id"
        int created_by FK
    }

    users ||--o{ user_event_favorites : "favorites"
    users ||--o{ households : "owns"
    households ||--o{ registrations : "has"
    users ||--o{ registrations : "created_by"
```

> **Cross-database note:** `event_id` in both `user_event_favorites` and `registrations` is an integer reference to `pantry-finder-api-node`'s `events` table. This pattern already exists in `registrations` and is the established cross-service convention.

---

## 4. Frontend Component Architecture

Where the new pieces fit within the existing React component tree.

```mermaid
graph TD
    App["App.js\n(AuthProvider · Redux Provider)"]

    App --> Routes["Routes.js"]
    App --> AuthCtx["AuthContext.tsx\n+ fetchFavorites on sign-in\n+ clearFavorites on sign-out"]

    Routes --> EventContainer["EventContainer.tsx"]
    Routes --> ProfilePage["ProfilePage\n(ProtectedRoute)"]

    EventContainer --> FilterBar["Filter Bar\n⭐ Favorites chip\n(auth only)"]
    EventContainer --> EventListContainer["EventListContainer.tsx"]
    EventListContainer --> EventListComponent["EventListComponent.tsx"]
    EventListComponent --> EventCard["EventCardComponent.tsx\n(tile | list)"]

    EventCard --> FavBtn["FavoriteButton.tsx ★\n(NEW — shared component)"]
    FavBtn --> FavSlice["favoritesSlice\n(Redux)"]
    FavBtn --> LoginDialog["LoginPromptDialog\n(reused guest dialog)"]

    ProfilePage --> SummaryTab["Summary Tab"]
    ProfilePage --> AccountTab["Account Tab"]
    ProfilePage --> FavTab["Favorites Tab ★ (NEW)"]

    FavTab --> FavTabComp["FavoritesTab.tsx\n(NEW)"]
    FavTabComp --> FavSlice
    FavTabComp --> EventCard
    FavTabComp --> PastBadge["Past Event Badge\n(shadcn Badge)"]
    FavTabComp --> EmptyState["Empty State\n(no favorites)"]

    FavSlice --> FavApiSvc["FavoritesApiService.ts ★ (NEW)"]
    FavApiSvc --> RegAPI["pantry-registration-api-node\n/api/favorites"]
    FavTabComp --> FinderAPI["pantry-finder-api-node\n/api/events/{id}"]

    style FavBtn fill:#d4f7e7,stroke:#28CE85
    style FavTab fill:#d4f7e7,stroke:#28CE85
    style FavTabComp fill:#d4f7e7,stroke:#28CE85
    style FavSlice fill:#d4f7e7,stroke:#28CE85
    style FavApiSvc fill:#d4f7e7,stroke:#28CE85
    style FilterBar fill:#d4f7e7,stroke:#28CE85
    style PastBadge fill:#d4f7e7,stroke:#28CE85
    style EmptyState fill:#d4f7e7,stroke:#28CE85
```

> Nodes highlighted in green are **new** additions. All other nodes are existing code.

---

## 5. Redux State Flow — Optimistic Update & Rollback

```mermaid
stateDiagram-v2
    [*] --> Idle : app init · sign-out clears state

    state "Loading" as Loading
    state "Error" as Error
    state "OptimisticAdd\n(UI: ★ filled instantly)" as OptimisticAdd
    state "OptimisticRemove\n(UI: ☆ outlined instantly)" as OptimisticRemove

    Idle --> Loading : fetchFavorites dispatched (on sign-in)
    Loading --> Idle : fulfilled · favoriteEventIds stored
    Loading --> Error : rejected · status = error
    Error --> Idle : retry / next sign-in

    Idle --> OptimisticAdd : addFavorite(eventId)\npush to favoriteEventIds[]
    OptimisticAdd --> Idle : API 201 fulfilled · no state change
    OptimisticAdd --> Idle : API error · rollback remove(eventId) · toast shown

    Idle --> OptimisticRemove : removeFavorite(eventId)\nremove from favoriteEventIds[]
    OptimisticRemove --> Idle : API 204 fulfilled · no state change
    OptimisticRemove --> Idle : API error · rollback push(eventId) · toast shown
```

---

## 6. Backend Module Structure (`pantry-registration-api-node`)

New NestJS module layout for the favorites feature.

```mermaid
graph LR
    AppModule["AppModule\n(app.module.ts)"]
    AppModule --> FavModule["FavoritesModule ★"]

    FavModule --> FavCtrl["FavoritesController\n@Controller('favorites')"]
    FavModule --> FavSvc["FavoritesService"]
    FavModule --> Entity["UserEventFavorite\n@Entity user_event_favorites"]

    FavCtrl --> |"GET · POST · DELETE\n(all: JwtAuthGuard)"| FavSvc

    FavSvc --> Entity
    Entity --> DB[("MySQL\nuser_event_favorites")]

    FavSvc --> UserEntity["User\n@Entity users\n(existing)"]

    style FavModule fill:#d4f7e7,stroke:#28CE85
    style FavCtrl fill:#d4f7e7,stroke:#28CE85
    style FavSvc fill:#d4f7e7,stroke:#28CE85
    style Entity fill:#d4f7e7,stroke:#28CE85
```

---

_Generated alongside PRD revision — May 2026. Update diagrams when implementation decisions change._
