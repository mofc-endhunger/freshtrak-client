# PRD: Favorite Events Functionality

## Introduction / Overview

Authenticated FreshTrak users currently have no way to save events they are interested in for quick retrieval. Every session requires re-running a search to locate a previously found event. This feature adds a **Favorites** system that lets users mark events with an outlined/filled star icon, persists those favorites server-side across sessions, and surfaces them in a dedicated **Favorites tab on the Profile page** as well as as visual indicators within search results.

> **Note on event identity:** Favorites are stored against the recurring `event_id` (the event entity), not a specific `event_date_id` occurrence. This means a favorited event remains relevant as long as the agency runs it, regardless of which specific date instance is displayed. Past or expired occurrences of a favorited event are retained in the Favorites tab with a clear "past event" visual indicator rather than being auto-removed — the user retains full control over their list.

**Problem:** There is no mechanism to save events of interest, forcing users to repeat searches and increasing friction in the pantry-finding flow.

**Goal:** Deliver a low-friction, persistent favorites experience that helps authenticated users quickly re-access relevant events, with graceful degradation for unauthenticated users.

---

## Goals

1. Allow an authenticated user to add or remove any event from their personal favorites list with a single click.
2. Persist favorites server-side (tied to the user's Cognito identity) so they survive logout, session expiry, and device changes.
3. Visually distinguish favorited events inside search results without cluttering the card layout.
4. Provide a dedicated **Favorites tab on the Profile page** so authenticated users can access all saved events directly, and a **favorites filter in search results** visible only to authenticated users.
5. Handle unauthenticated state gracefully — prompt users to log in rather than silently failing.
6. Recover cleanly from API failures using optimistic UI updates with automatic rollback.

---

## User Stories

1. **As an authenticated user**, I want to click a star icon on an event card so that I can save it to my favorites for quick future access.
2. **As an authenticated user**, I want to see which events I have already favorited when I browse search results so that I know what I've saved.
3. **As an authenticated user**, I want a Favorites tab on my Profile page that lists all my saved events so that I can access them without re-running a search.
4. **As an authenticated user**, I want to remove an event from my favorites so that I can keep my list relevant.
5. **As a guest or unauthenticated user**, I want to be prompted to log in when I click the favorite icon so that I understand what is required to use the feature.
6. **As an authenticated user**, I want my favorites to be present the next time I log in so that I never have to re-save events after signing out.
7. **As an authenticated user**, I want the UI to feel instant when I toggle a favorite so that the interaction feels responsive, even on slow connections.

---

## Functional Requirements

### 1. Favorite Toggle on Event Cards

1.1 Every `EventCardComponent` (both `tile` and `list` variants) must display a **star icon** in the top-right corner of the card.  
1.2 The icon must render in two distinct visual states:

- **Favorited**: filled star, using the project's `primary` color (`#28CE85`).
- **Not favorited**: outlined star, `text-muted-foreground` (muted gray).

  1.3 Clicking the icon while authenticated must immediately optimistically toggle the visual state and dispatch the corresponding API call (`POST /api/favorites` or `DELETE /api/favorites/:eventId`).  
  1.4 If the API call fails, the UI must revert the icon to its previous state and display a non-blocking error toast.  
  1.5 The icon must be accessible: it must have an `aria-label` of `"Add to favorites"` or `"Remove from favorites"` based on current state, and must be keyboard-focusable with a minimum touch target of 44 × 44 px (achieved via padding).  
  1.6 Clicking the favorite icon must **not** trigger event card navigation or registration flow.

### 2. Unauthenticated State

2.1 If the user is not authenticated when they click the favorite icon, the system must not call any API.  
2.2 The existing login-prompt dialog that appears for guest registrants on the confirmation page must be reused here. It must inform the user that favoriting requires an account and provide a direct link to `/login`.
2.3 The icon must remain in its unfavorited state when the prompt is dismissed.

### 3. Favorites on Event Details Page

3.1 The event details view (reached from `EventCardComponent` navigation) must also display the same favorite toggle icon with identical behavior to the card.

### 4. Favorites Tab on Profile Page

4.1 A **"Favorites"** tab must be added to the existing Profile page, visible only to authenticated users.  
4.2 The Favorites tab must display a list of all events the user has favorited, using the standard `EventCardComponent` (list variant).  
4.3 Events that have no upcoming occurrences (all `event_dates` are in the past) must be displayed with a **"Past event"** badge and visually de-emphasized (e.g., reduced opacity), but they must **not** be auto-removed from the list. The user retains control over removal.  
4.4 An empty-state message must be shown when the tab is active but the user has no saved favorites (e.g., _"You haven't saved any events yet. Tap ⭐ on any event to save it."_).  
4.5 Users must be able to unfavorite events directly from the Favorites tab; the card must be removed from the list immediately (optimistic removal with rollback on failure).

### 5. Favorites Filter in Search Results

5.1 A **"⭐ Favorites"** filter chip must be added to the event list filter bar in `EventContainer`, consistent in style with the existing availability filter chips.  
5.2 The Favorites filter chip must be **visible only to authenticated users**. Unauthenticated users must not see it.  
5.3 When the Favorites filter is active, only events in the current search results whose `id` exists in the user's cached `favoriteEventIds` must be shown.  
5.4 An empty-state message must be shown when the filter is active but none of the current search results are favorited (e.g., _"None of your saved events match this search. Try a different location or remove the Favorites filter."_).

### 6. Favorites Loading and Caching

6.1 On successful authentication, the application must fetch the full list of the user's favorited event IDs (`GET /api/favorites`) and store them in a new Redux slice (`favoritesSlice`).  
6.2 The `favoritesSlice` must be included in the Redux Persist whitelist so that the cached list survives page refreshes between sessions (until the next sync on login).  
6.3 On sign-out, the favorites state must be cleared.  
6.4 When the events list loads, the app must cross-reference each event's `id` against the cached favorites list to determine `isFavorited` — **no per-card API call**.  
6.5 The Favorites tab on the Profile page must hydrate full event details for each favorited `event_id` by calling `GET /api/events/{id}` against `pantry-finder-api-node` — one request per favorited ID. The `FavoritesApiService` returns only IDs; a separate service call chain is needed to load displayable event data. There is no batch endpoint in the finder API at this time.

### 7. Backend — Favorites API (pantry-registration-api-node)

7.1 A new `user_event_favorites` junction table must be created:

| Column       | Type                  | Notes                                     |
| ------------ | --------------------- | ----------------------------------------- |
| `id`         | INT AUTO_INCREMENT    | Primary key                               |
| `user_id`    | INT                   | FK → `users.id`, NOT NULL                 |
| `event_id`   | INT                   | The event ID from pantry-finder, NOT NULL |
| `created_at` | DATETIME              | Default NOW()                             |
| UNIQUE       | `(user_id, event_id)` | Prevents duplicate favorites              |

7.2 **`POST /api/favorites`** — Add a favorite.

- Auth: `JwtAuthGuard` (authenticated users only; no guest support).
- Body: `{ event_id: number }`.
- Response `201`: `{ id, user_id, event_id, created_at }`.
- Response `409`: if the favorite already exists (idempotent on client, explicit on server).

  7.3 **`DELETE /api/favorites/:eventId`** — Remove a favorite.

- Auth: `JwtAuthGuard`.
- Param: `eventId` (integer).
- Response `204`: No body.
- Response `404`: if the favorite does not exist for this user.

  7.4 **`GET /api/favorites`** — Fetch the authenticated user's favorites.

- Auth: `JwtAuthGuard`.
- Response `200`: `{ favorites: [{ id, event_id, created_at }] }`.
- Must return only the records belonging to the authenticated user (enforced server-side; never rely on a client-supplied user ID).

  7.5 All endpoints must be covered by unit tests in `pantry-registration-api-node`.

### 8. Frontend — New Service and Redux Slice

8.1 A `FavoritesApiService` must be created at `src/Services/FavoritesApiService.ts` following the existing axios + Bearer token pattern used in `FeedbackApiService` and `HouseholdsApiService`.  
8.2 A `favoritesSlice` must be created at `src/Store/Favorites/favoritesSlice.ts` with:

- State: `{ favoriteEventIds: number[]; status: 'idle' | 'loading' | 'error' }`.
- Async thunks: `fetchFavorites`, `addFavorite`, `removeFavorite`.
- Selectors: `selectFavoriteEventIds`, `selectIsFavorited(eventId)`, `selectFavoritesStatus`.

  8.3 The slice must be wired into `src/Store/store.js` and added to the persist whitelist.  
  8.4 `fetchFavorites` must be dispatched from `AuthContext` after a successful sign-in and cleared on `signOut`.

### 9. URL for Favorites API

9.1 A new entry must be added to `src/Utils/Urls.js`:

```js
FAVORITES: joinApiUrl(REGISTRATION_URL, 'api/favorites'),
FAVORITE_BY_EVENT: (eventId) => joinApiUrl(REGISTRATION_URL, `api/favorites/${eventId}`),
```

---

## Non-Goals (Out of Scope)

- **Sharing favorites** with other users or generating a shareable link.
- **Sorting or grouping** favorites (e.g., by date, category).
- **Push notifications** or email reminders for favorited events.
- **Favoriting agencies** (only events are in scope for this release).
- **Guest favorites** — requires authentication; no anonymous/local storage fallback.
- **Favorite counts** visible to other users or to agency staff.
- **Offline support** beyond the Redux Persist cache of IDs.
- **Favorites cap** — no maximum favorites limit will be enforced.
- **Auto-removal of expired events** — expired favorited events are retained with a "past event" indicator; removal is always manual.
- **Case manager favorites** — case managers are not in scope for this release but the feature may be extended to them in future.

---

## Design Considerations

- **Icon**: Outlined star (`☆`) when not favorited; filled star (`★`) when favorited. Use `primary` color (`#28CE85`) for the filled state; `text-muted-foreground` for the outline state.
- **Icon placement**: Top-right corner of the event card, overlapping the image area or card header. Must be visually separated from the "Register" CTA to prevent misclicks.
- **Touch target**: Icon rendered at 20–24 px; surrounding button element padded to a minimum 44 × 44 px tap target.
- **Login prompt**: Reuse the existing guest-registration login dialog. No auto-redirect; user opts in by clicking the link inside the dialog.
- **Profile page Favorites tab**: Add as a third tab alongside the existing **"Summary"** and **"Account"** tabs. Use the same tab component pattern already in place on the Profile page.
- **"Past event" badge**: A small `Badge` component (shadcn/ui) in a muted/warning color (e.g., amber) labelled "Past event", displayed on event cards in the Favorites tab when the event has no future dates.
- **Favorites filter chip**: Add a "⭐ Favorites" chip to the filter bar in `EventContainer`, consistent in style with the existing availability chips. Only render this chip for authenticated users.
- **Empty states**: Simple centered text + supporting copy. No external assets needed. Use `text-muted-foreground` and Tailwind spacing utilities.
- **Toast notifications**: Use the existing project toast/alert pattern for API error rollback feedback.

---

## Technical Considerations

### Architecture Decision: Which Backend API

Favorites must be implemented in **`pantry-registration-api-node`**, not `pantry-finder-api-node`, because:

- `pantry-finder-api-node` is a public read-only catalog API with no authentication or user model.
- `pantry-registration-api-node` already owns the `users` table, JWT/Cognito auth guards, and all user-specific data (registrations, households, feedback).
- A `user_id` FK to `pantry-registration-api-node`'s `users` table is straightforward; referencing `event_id` as an integer is sufficient since event IDs originate in the finder DB and are already used cross-service (e.g., in `registrations`).

### Optimistic Updates

The Redux slice should optimistically update `favoriteEventIds` before the API response arrives, enabling instant UI feedback. On API error, a rollback action must restore the previous state.

Pattern:

1. Dispatch optimistic update immediately.
2. Await API call.
3. On success: no further action needed.
4. On failure: dispatch rollback + show toast.

### Token Attachment

`FavoritesApiService` must attach the Bearer token from `StorageService.getUserToken()` (same pattern as `FeedbackApiService`).

### Avoiding N+1 Requests

The `GET /api/favorites` response returns all favorited `event_id` values for the authenticated user in a single request. The frontend cross-references this cached list against the rendered event list locally — no per-card API call is made during list rendering.

### TypeScript Entity (Backend)

```typescript
// src/entities/user-event-favorite.entity.ts
@Entity('user_event_favorites')
export class UserEventFavorite {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'event_id' })
  eventId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
```

### Database Migration

A SQL migration script (or TypeORM migration) must be created. Since `synchronize: false` is enforced in both `pantry-registration-api-node` environments, a manual migration script is required for deployment:

```sql
CREATE TABLE user_event_favorites (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  event_id INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id),
  UNIQUE KEY uq_user_event (user_id, event_id),
  CONSTRAINT fk_fav_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Event ID Stability Across Environments

`event_id` values in `user_event_favorites` reference the `pantry-finder-api-node` database's `events.id`, which is **not guaranteed to be consistent across environments** (dev, staging, production). This means:

- Favorites seeded or created in a dev/staging environment may reference non-existent or mismatched events in production.
- Test suites in `pantry-registration-api-node` should use mock / well-known fixture `event_id` values rather than relying on real event IDs from the finder DB.
- In production this is a non-issue because both services share the same event IDs; the risk is limited to cross-environment test data bleed.

### Expired Events — Rendering in the Favorites Tab

A favorited event is considered **"past"** when all of its `event_dates` have a `date` field that is earlier than today's date. The `event_slot` end time is not used for this determination.

The `pantry-finder-api-node` exposes `GET /api/events/{id}` to retrieve a single event by ID. There is no batch endpoint. The Favorites tab must therefore load event details via **sequential `GET /api/events/{id}` calls** — one per favorited event ID. This is acceptable for the initial release given that personal favorites lists are expected to remain small.

If the list grows problematically, a batch endpoint (`GET /api/events?ids=1,2,3`) can be added to `pantry-finder-api-node` as a follow-up optimization. The `EventCardComponent` already handles the event shape; no new card component is needed for the tab.

### Routing

The Favorites tab lives within the existing Profile page route (behind `ProtectedRoute`). No new top-level route is required. The search-results favorites filter is state-only (`EventContainer` local state), adding no routing changes.

---

## Implementation Subtasks

### Backend (`pantry-registration-api-node`)

- [ ] B1: Create `UserEventFavorite` entity (`src/entities/user-event-favorite.entity.ts`)
- [ ] B2: Register entity in `src/entities/index.ts` and `database.module.ts`
- [ ] B3: Write SQL migration script for `user_event_favorites` table
- [ ] B4: Create `FavoritesModule`, `FavoritesController`, `FavoritesService` under `src/modules/favorites/`
- [ ] B5: Implement `POST /api/favorites` endpoint with `JwtAuthGuard`
- [ ] B6: Implement `DELETE /api/favorites/:eventId` endpoint with `JwtAuthGuard`
- [ ] B7: Implement `GET /api/favorites` endpoint with `JwtAuthGuard`
- [ ] B8: Write unit tests for `FavoritesService` and `FavoritesController`
- [ ] B9: Register `FavoritesModule` in `app.module.ts`

### Frontend (`freshtrak-client`)

**Foundation**

- [ ] F1: Add `FAVORITES` and `FAVORITE_BY_EVENT` URL entries to `src/Utils/Urls.js`
- [ ] F2: Create `src/Services/FavoritesApiService.ts` (GET, POST, DELETE with Bearer token)
- [ ] F3: Create `src/Store/Favorites/favoritesSlice.ts` (state, thunks, optimistic updates, rollback, selectors)
- [ ] F4: Wire `favoritesSlice` into `src/Store/store.js` and add to persist whitelist
- [ ] F5: Dispatch `fetchFavorites` on sign-in and clear favorites state on `signOut` in `AuthContext.tsx`

**Favorite Toggle Button**

- [ ] F6: Create `src/components/shared/FavoriteButton.tsx` — outlined/filled star toggle, accessible (`aria-label`), 44 × 44 px tap target, login-prompt for unauthenticated users
- [ ] F7: Integrate `FavoriteButton` into `EventCardComponent.tsx` (tile and list variants, top-right placement)
- [ ] F8: Integrate `FavoriteButton` into the event details view

**Search Results Filter (authenticated users only)**

- [ ] F9: Add "⭐ Favorites" filter chip to `EventContainer.tsx`, visible only when user is authenticated
- [ ] F10: Implement client-side favorites filter logic using cached `favoriteEventIds`
- [ ] F11: Add empty-state message for Favorites filter with no matching results

**Profile Page — Favorites Tab**

- [ ] F12: Add "Favorites" tab to the Profile page (behind `ProtectedRoute`)
- [ ] F13: Implement `FavoritesTab` component — fetches event details for each favorited ID, renders `EventCardComponent` (list variant)
- [ ] F14: Add "Past event" `Badge` to cards whose event has no future `event_dates`
- [ ] F15: Add empty-state for Favorites tab when user has no favorites

**Tests**

- [ ] F16: Unit tests for `FavoritesApiService`
- [ ] F17: Unit tests for `favoritesSlice` (thunks, reducers, optimistic update + rollback, selectors)
- [ ] F18: Unit/integration tests for `FavoriteButton` — authenticated toggle, unauthenticated prompt, optimistic update, rollback
- [ ] F19: Integration tests for `EventCardComponent` with favorites toggle (both auth states)
- [ ] F20: Unit/integration tests for `FavoritesTab` (loading, populated, empty, past-event badge)

---

## Success Metrics

| Metric                                                                                                     | Target                              |
| ---------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| Authenticated users can toggle a favorite with a single click, and the UI updates in < 100 ms (optimistic) | 100%                                |
| Favorited events are present after logout + login                                                          | 100% (backend persistence)          |
| API failure results in UI rollback with no broken state                                                    | Validated by tests                  |
| Favorites filter returns only the user's saved events                                                      | 100% accuracy                       |
| No per-card API calls during event list render                                                             | 0 extra requests after initial load |
| Test coverage for new components/services                                                                  | ≥ 80% line coverage                 |

---

## Resolved Design Decisions

| #   | Question                                            | Decision                                                                                                                                                               |
| --- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Icon style                                          | **Outlined/filled star** (☆ / ★). Filled in `primary` green when favorited; outlined muted gray otherwise.                                                             |
| 2   | Entry point for saved favorites                     | **Favorites tab on the Profile page** as the third tab alongside "Summary" and "Account". Favorites filter chip in search results visible to authenticated users only. |
| 3   | Event ID stability across environments              | IDs are **not assumed stable** across environments. Tests use fixture/mock IDs; no cross-environment data migration planned.                                           |
| 4   | Expired/past events in favorites                    | **Retained** with a "Past event" badge. Never auto-removed. User controls their own list.                                                                              |
| 5   | Favorites cap per user                              | **No cap** enforced.                                                                                                                                                   |
| 6   | Case manager favorites                              | **Out of scope** for this release. May be added in a future iteration.                                                                                                 |
| 7   | Finder API batch endpoint for loading Favorites tab | **No batch endpoint exists.** Use sequential `GET /api/events/{id}` calls per favorited ID. Add batch endpoint as a future optimization if needed.                     |
| 8   | Profile page existing tabs                          | Currently **"Summary"** and **"Account"**. Favorites is added as the third tab.                                                                                        |
| 9   | Definition of "past event"                          | An event is past when all its `event_dates` have a **`date` value earlier than today**. Event slot end time is not used.                                               |

## Open Questions

All design decisions have been resolved. No open questions remain.

> **Future optimization to track:** `pantry-finder-api-node` does not currently expose a batch `GET /api/events?ids=...` endpoint. If the Favorites tab experiences performance issues from sequential per-ID fetches, adding a batch endpoint to the finder API is the recommended follow-up.
