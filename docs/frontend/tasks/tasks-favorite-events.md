# Task List: Favorite Events — Frontend Implementation

> Companion to: [PRD](../features/prd-favorite-events.md) · [Diagrams](../features/diagrams-favorite-events.md)  
> Tasks are ordered by dependency — each phase must be complete before the next begins.

## Relevant Files

### New Files

- `src/Utils/Urls.js` — add `FAVORITES` and `FAVORITE_BY_EVENT` URL constants _(modified)_
- `src/Services/FavoritesApiService.ts` — axios service for GET / POST / DELETE favorites
- `src/Services/__test__/FavoritesApiService.test.ts` — unit tests for the service
- `src/Store/Favorites/favoritesSlice.ts` — Redux slice with async thunks, optimistic updates, selectors
- `src/Store/Favorites/__test__/favoritesSlice.test.ts` — unit tests for the slice
- `src/Store/store.js` — add `favorites` reducer, include in persist whitelist _(modified)_
- `src/Modules/Authentication/AuthContext.tsx` — dispatch `fetchFavorites` on sign-in, clear on sign-out _(modified)_
- `src/components/shared/FavoriteButton.tsx` — reusable outlined/filled star toggle component
- `src/components/shared/__test__/FavoriteButton.test.tsx` — unit/integration tests for the button
- `src/Modules/Account/components/FavoritesTab.tsx` — Favorites tab content for the Account page
- `src/Modules/Account/components/__test__/FavoritesTab.test.tsx` — unit/integration tests for the tab

### Modified Files

- `src/Modules/Events/EventCardComponent.tsx` — integrate `FavoriteButton` (tile + list variants)
- `src/Modules/Events/__test__/eventCardComponent.test.js` — extend with favorites toggle tests
- `src/Modules/Events/EventContainer.tsx` — add auth-gated "⭐ Favorites" filter chip + filter logic
- `src/Modules/Events/__test__/eventContainer.test.js` — extend with favorites filter tests
- `src/Modules/Account/AccountPage.tsx` — add "Favorites" as the third tab

### Notes

- Unit tests live alongside source files in `__test__/` directories following the existing pattern.
- Run a specific test file with: `npm test -- --testPathPatterns="path/to/test" --watchAll=false`
- All new files must be TypeScript (`.ts` / `.tsx`) with strict types — no `any`.
- Use `cn()` from `src/lib/utils.ts` for conditional Tailwind class merging.
- Use shadcn/ui components (`Badge`, `Tabs`, `TabsTrigger`, `TabsContent`) where applicable.
- The `FavoriteButton` star must use filled `★` (`text-primary fill-primary`) when favorited, outlined `☆` (`text-muted-foreground`) when not.
- Bearer token is obtained from `StorageService.getUserToken()` — see `FeedbackApiService` for reference pattern.

---

## Tasks

- [x] 1.0 Foundation — URLs, Service, Redux Slice, Auth Integration
  - [x] 1.1 Add `FAVORITES` and `FAVORITE_BY_EVENT` URL constants to `src/Utils/Urls.js`
    ```js
    FAVORITES: joinApiUrl(REGISTRATION_URL, 'api/favorites'),
    FAVORITE_BY_EVENT: (eventId) => joinApiUrl(REGISTRATION_URL, `api/favorites/${eventId}`),
    ```
  - [x] 1.2 Create `src/Services/FavoritesApiService.ts` with three methods:
    - `getFavorites(): Promise<{ favorites: { id: number; event_id: number; created_at: string }[] }>` — `GET /api/favorites`
    - `addFavorite(eventId: number): Promise<{ id: number; user_id: number; event_id: number; created_at: string }>` — `POST /api/favorites`
    - `removeFavorite(eventId: number): Promise<void>` — `DELETE /api/favorites/:eventId`
    - All requests attach `Authorization: Bearer <token>` from `StorageService.getUserToken()`
  - [x] 1.3 Write unit tests in `src/Services/__test__/FavoritesApiService.test.ts`
    - Mock axios; assert correct URL, method, and headers for each call
    - Test error propagation for 4xx / 5xx / network failures
  - [x] 1.4 Create `src/Store/Favorites/favoritesSlice.ts` with:
    - State shape: `{ favoriteEventIds: number[]; status: 'idle' | 'loading' | 'error' }`
    - Async thunks: `fetchFavorites`, `addFavorite`, `removeFavorite`
    - Optimistic update on `addFavorite` / `removeFavorite` pending — rollback on rejected
    - Selectors: `selectFavoriteEventIds`, `selectIsFavorited(state, eventId)`, `selectFavoritesStatus`
    - Sync action: `clearFavorites` (used on sign-out)
  - [x] 1.5 Wire `favoritesSlice` into `src/Store/store.js`
    - Add `favorites: favoritesReducer` to the root reducer
    - Add `'favorites'` to the redux-persist whitelist
  - [x] 1.6 Write unit tests in `src/Store/Favorites/__test__/favoritesSlice.test.ts`
    - Test `fetchFavorites` fulfilled: `favoriteEventIds` populated
    - Test `fetchFavorites` rejected: `status = 'error'`
    - Test `addFavorite` pending: `eventId` added optimistically
    - Test `addFavorite` rejected: `eventId` removed (rollback)
    - Test `removeFavorite` pending: `eventId` removed optimistically
    - Test `removeFavorite` rejected: `eventId` re-added (rollback)
    - Test `clearFavorites`: state reset to initial
    - Test `selectIsFavorited` selector returns correct boolean
  - [x] 1.7 Update `src/Modules/Authentication/AuthContext.tsx`
    - Dispatch `fetchFavorites()` after a successful `signIn` (after JWT is stored)
    - Dispatch `clearFavorites()` inside the `signOut` function before redirect

- [x] 2.0 Favorite Toggle Button Component
  - [x] 2.1 Create `src/components/shared/FavoriteButton.tsx`
    - Props: `eventId: number`
    - Read `isFavorited` from `selectIsFavorited(state, eventId)` via `useSelector`
    - Read `isAuthenticated` from `useAuth()`
    - Authenticated + not favorited → dispatch `addFavorite(eventId)` on click
    - Authenticated + favorited → dispatch `removeFavorite(eventId)` on click
    - Unauthenticated → open login-prompt dialog on click (reuse existing guest dialog)
    - Render filled star (`★`) when favorited (Tailwind: `text-primary fill-primary`)
    - Render outlined star (`☆`) when not favorited (Tailwind: `text-muted-foreground`)
    - Button element padded to ≥ 44 × 44 px touch target
    - `aria-label` switches between `"Add to favorites"` and `"Remove from favorites"`
    - `e.stopPropagation()` on click to prevent card navigation from triggering
  - [x] 2.2 Write unit/integration tests in `src/components/shared/__test__/FavoriteButton.test.tsx`
    - Renders outlined star when `isFavorited = false`
    - Renders filled star when `isFavorited = true`
    - Authenticated click on unfavorited: dispatches `addFavorite`, star fills immediately (optimistic)
    - Authenticated click on favorited: dispatches `removeFavorite`, star empties immediately (optimistic)
    - API failure on add: star rolls back to outlined, toast appears
    - API failure on remove: star rolls back to filled, toast appears
    - Unauthenticated click: login-prompt dialog opens, no API call fired
    - `aria-label` is correct for both states
    - Click does not propagate to parent card
  - [x] 2.3 Integrate `FavoriteButton` into `src/Modules/Events/EventCardComponent.tsx`
    - Import and render `<FavoriteButton eventId={props.event.id} />` in both tile and list layouts
    - Position: top-right corner of card, overlapping the image area
    - Ensure `e.stopPropagation()` in `FavoriteButton` prevents card click from firing
  - [x] 2.4 Extend `src/Modules/Events/__test__/eventCardComponent.test.js` with favorites tests
    - `FavoriteButton` renders inside tile variant
    - `FavoriteButton` renders inside list variant
    - Clicking the star does not navigate to event details
  - [x] 2.5 Integrate `FavoriteButton` into the event details view
    - Identify the event details component rendered at `/register/event/:id`
    - Import and render `<FavoriteButton eventId={event.id} />` in the header area

- [x] 3.0 Search Results Favorites Filter
  - [x] 3.1 Add "⭐ Favorites" filter chip to `src/Modules/Events/EventContainer.tsx`
    - Render the chip only when the user is authenticated (`useAuth()`)
    - Use the same chip/button style as the existing availability filter chips
    - Manage active state with local `useState<boolean>(false)`
  - [x] 3.2 Implement client-side favorites filter logic in `EventContainer.tsx`
    - When the Favorites filter is active, pass only events whose `id` is in `selectFavoriteEventIds` down to `EventListContainer`
    - No new API call — use the cached Redux state only
  - [x] 3.3 Add an empty-state message when the Favorites filter is active but no current search results are favorited
    - Copy: _"None of your saved events match this search. Try a different location or remove the Favorites filter."_
  - [x] 3.4 Extend `src/Modules/Events/__test__/eventContainer.test.js` with filter tests
    - Favorites chip does not render when unauthenticated
    - Favorites chip renders when authenticated
    - Activating the chip filters the event list to only favorited events
    - Empty-state message appears when no results match the filter

- [x] 4.0 Profile Page — Favorites Tab
  - [x] 4.1 Add a "Favorites" `TabsTrigger` and `TabsContent` to `src/Modules/Account/AccountPage.tsx`
    - Insert as the third tab after the existing "Summary" and "Account" tabs
    - `value="favorites"`, `data-testid="tab-favorites"`
    - Tab label: use `localization.tab_favorites` (add the key to the localization file)
  - [x] 4.2 Create `src/Modules/Account/components/FavoritesTab.tsx`
    - On mount, read `favoriteEventIds` from `selectFavoriteEventIds`
    - For each `eventId`, call `GET /api/events/{id}` against `pantry-finder-api-node` sequentially to load event detail
    - Show a loading skeleton while fetches are in progress
    - Render each loaded event as an `EventCardComponent` (list variant) with `FavoriteButton` pre-integrated
  - [x] 4.3 Add "Past event" `Badge` to event cards in the Favorites tab
    - An event is "past" if all of its `event_dates[].date` values are earlier than today's date
    - Render a shadcn `Badge` with amber/warning styling and the label `"Past event"` on the card
    - Apply reduced opacity (`opacity-60`) to the card wrapper for visual de-emphasis
  - [x] 4.4 Add empty-state for when the user has no favorites
    - Copy: _"You haven't saved any events yet. Tap ★ on any event to save it."_
    - Render only when `favoriteEventIds.length === 0`
  - [x] 4.5 Write unit/integration tests in `src/Modules/Account/components/__test__/FavoritesTab.test.tsx`
    - Renders loading skeleton while event details are fetching
    - Renders event cards for each favorited event after load
    - Renders "Past event" badge on cards where all dates are in the past
    - Does not render "Past event" badge when event has a future date
    - Renders empty-state when `favoriteEventIds` is empty
    - Unfavoriting a card from the tab removes it from the list (optimistic removal)
    - API failure on unfavorite: card reappears (rollback)
