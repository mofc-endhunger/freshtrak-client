# Task List: Favorite Events — Backend Implementation

> Companion to: [PRD](../../frontend/features/prd-favorite-events.md)  
> Repository: `pantry-registration-api-node`  
> Tasks are ordered by dependency — each phase must be complete before the next begins.

## Context

Favorites are owned by `pantry-registration-api-node` because it manages the `users` table, JWT/Cognito auth guards, and all user-specific data. The `event_id` field references `pantry-finder-api-node`'s `events.id` as a plain integer — no FK across services.

---

## Relevant Files

### New Files

| File                                                           | Purpose                                             |
| -------------------------------------------------------------- | --------------------------------------------------- |
| `src/entities/user-event-favorite.entity.ts`                   | TypeORM entity for the `user_event_favorites` table |
| `src/migrations/<timestamp>_CreateUserEventFavorites.ts`       | TypeORM migration (or raw SQL script)               |
| `src/modules/favorites/favorites.module.ts`                    | NestJS module wiring                                |
| `src/modules/favorites/favorites.controller.ts`                | REST endpoints: GET, POST, DELETE                   |
| `src/modules/favorites/favorites.service.ts`                   | Business logic: find, add, remove                   |
| `src/modules/favorites/dto/add-favorite.dto.ts`                | Request body DTO for `POST /api/favorites`          |
| `src/modules/favorites/dto/favorite-response.dto.ts`           | Response shape DTO                                  |
| `src/modules/favorites/__tests__/favorites.service.spec.ts`    | Unit tests for the service                          |
| `src/modules/favorites/__tests__/favorites.controller.spec.ts` | Unit tests for the controller                       |

### Modified Files

| File                     | Change                                                         |
| ------------------------ | -------------------------------------------------------------- |
| `src/entities/index.ts`  | Export `UserEventFavorite`                                     |
| `src/database.module.ts` | Register `UserEventFavorite` entity in the TypeORM entity list |
| `src/app.module.ts`      | Import and register `FavoritesModule`                          |

---

## Notes

- `synchronize: false` is enforced in all environments — a migration script is **required**; do not rely on schema sync.
- All endpoints are guarded by `JwtAuthGuard`. The authenticated user's ID must always be resolved from the JWT payload — never accept a `user_id` from the request body or query.
- `event_id` is a plain integer with no FK to the finder DB. No cross-service join is performed server-side.
- Follow the existing NestJS module structure in `src/modules/` (e.g., `feedback/`, `households/`).
- DTOs must use `class-validator` decorators matching the existing patterns in the codebase.
- Unit tests use Jest + NestJS `TestingModule`; mock `Repository<UserEventFavorite>` with `createMock` or `jest.fn()` per existing test conventions.
- Integration/E2E tests (if the project uses them) should use a separate test database or in-memory SQLite.

---

## Tasks

- [ ] 1.0 Database — Entity and Migration
  - [ ] 1.1 Create `src/entities/user-event-favorite.entity.ts`

    ```typescript
    @Entity('user_event_favorites')
    export class UserEventFavorite {
      @PrimaryGeneratedColumn()
      id: number;

      @Column({ name: 'user_id' })
      userId: number;

      @ManyToOne(() => User, { onDelete: 'CASCADE' })
      @JoinColumn({ name: 'user_id' })
      user: User;

      @Column({ name: 'event_id' })
      eventId: number;

      @CreateDateColumn({ name: 'created_at' })
      createdAt: Date;
    }
    ```

    - No FK to the finder DB for `event_id` — it is stored as a plain INT.
    - `onDelete: 'CASCADE'` on the `user` relation so favorites are cleaned up when a user account is deleted.

  - [ ] 1.2 Register `UserEventFavorite` in `src/entities/index.ts`
    - Export the entity so it can be imported from the barrel.

  - [ ] 1.3 Register `UserEventFavorite` in `src/database.module.ts`
    - Add to the `TypeOrmModule.forFeature([...])` entity list.

  - [ ] 1.4 Write the migration script for `user_event_favorites`
    - Create a TypeORM migration (preferred) or a raw SQL file at `src/migrations/`.
    - SQL equivalent for reference:
      ```sql
      CREATE TABLE user_event_favorites (
        id          INT          NOT NULL AUTO_INCREMENT,
        user_id     INT          NOT NULL,
        event_id    INT          NOT NULL,
        created_at  DATETIME     NOT NULL DEFAULT NOW(),
        PRIMARY KEY (id),
        UNIQUE KEY uq_user_event (user_id, event_id),
        CONSTRAINT fk_fav_user FOREIGN KEY (user_id)
          REFERENCES users(id) ON DELETE CASCADE
      );
      ```
    - The `UNIQUE KEY uq_user_event (user_id, event_id)` constraint is the server-side guard against duplicate favorites and must be present even if the service layer also checks.

- [ ] 2.0 DTOs
  - [ ] 2.1 Create `src/modules/favorites/dto/add-favorite.dto.ts`

    ```typescript
    export class AddFavoriteDto {
      @IsInt()
      @IsPositive()
      event_id: number;
    }
    ```

    - Use `class-validator` (`@IsInt`, `@IsPositive`) consistent with existing DTOs.

  - [ ] 2.2 Create `src/modules/favorites/dto/favorite-response.dto.ts`

    ```typescript
    export class FavoriteResponseDto {
      id: number;
      user_id: number;
      event_id: number;
      created_at: Date;
    }

    export class FavoritesListResponseDto {
      favorites: Pick<FavoriteResponseDto, 'id' | 'event_id' | 'created_at'>[];
    }
    ```

- [ ] 3.0 Service — `FavoritesService`
  - [ ] 3.1 Create `src/modules/favorites/favorites.service.ts` with three methods:

    **`getFavorites(userId: number): Promise<FavoritesListResponseDto>`**
    - Query: `SELECT id, event_id, created_at FROM user_event_favorites WHERE user_id = $userId ORDER BY created_at DESC`
    - Return `{ favorites: [...] }`.

    **`addFavorite(userId: number, eventId: number): Promise<FavoriteResponseDto>`**
    - Attempt to insert a row with `(user_id, event_id)`.
    - If the DB throws a unique constraint violation (`ER_DUP_ENTRY` / error code `1062`), catch it and re-throw as `ConflictException` with message `"Event already in favorites"`.
    - Return the full inserted row including the generated `id` and `created_at`.

    **`removeFavorite(userId: number, eventId: number): Promise<void>`**
    - Delete the row matching `(user_id, event_id)`.
    - If no row is deleted (`affected === 0`), throw `NotFoundException` with message `"Favorite not found"`.

  - [ ] 3.2 Inject `@InjectRepository(UserEventFavorite)` via constructor following existing service patterns.

- [ ] 4.0 Controller — `FavoritesController`
  - [ ] 4.1 Create `src/modules/favorites/favorites.controller.ts`

    **`GET /api/favorites`**
    - Decorator: `@Get()` under `@Controller('api/favorites')`
    - Guard: `@UseGuards(JwtAuthGuard)`
    - Resolve `userId` from the JWT payload via `@Request() req` (i.e., `req.user.id`) — never from query or body.
    - Delegate to `favoritesService.getFavorites(userId)`.
    - Response: `200` with `FavoritesListResponseDto`.

    **`POST /api/favorites`**
    - Decorator: `@Post()`
    - Guard: `@UseGuards(JwtAuthGuard)`
    - Body: `@Body() dto: AddFavoriteDto`
    - Delegate to `favoritesService.addFavorite(userId, dto.event_id)`.
    - Response: `201` with `FavoriteResponseDto` (use `@HttpCode(HttpStatus.CREATED)`).
    - Throws `409 ConflictException` if the favorite already exists (propagated from the service).

    **`DELETE /api/favorites/:eventId`**
    - Decorator: `@Delete(':eventId')`
    - Guard: `@UseGuards(JwtAuthGuard)`
    - Param: `@Param('eventId', ParseIntPipe) eventId: number`
    - Delegate to `favoritesService.removeFavorite(userId, eventId)`.
    - Response: `204` with no body (use `@HttpCode(HttpStatus.NO_CONTENT)`).
    - Throws `404 NotFoundException` if the record does not exist (propagated from the service).

- [ ] 5.0 Module and App Registration
  - [ ] 5.1 Create `src/modules/favorites/favorites.module.ts`

    ```typescript
    @Module({
      imports: [TypeOrmModule.forFeature([UserEventFavorite])],
      controllers: [FavoritesController],
      providers: [FavoritesService],
    })
    export class FavoritesModule {}
    ```

  - [ ] 5.2 Import `FavoritesModule` in `src/app.module.ts`
    - Add `FavoritesModule` to the `imports` array alongside existing feature modules (e.g., `FeedbackModule`, `HouseholdsModule`).

- [ ] 6.0 Tests
  - [ ] 6.1 Write unit tests for `FavoritesService` in `src/modules/favorites/__tests__/favorites.service.spec.ts`

    **`getFavorites`**
    - Returns `{ favorites: [...] }` mapped from repository results.
    - Returns `{ favorites: [] }` when the user has no favorites.

    **`addFavorite`**
    - Inserts and returns the created entity on success.
    - Throws `ConflictException` when the DB returns a duplicate key error (`ER_DUP_ENTRY`).

    **`removeFavorite`**
    - Calls delete and returns void when a row is removed (`affected = 1`).
    - Throws `NotFoundException` when no row is found (`affected = 0`).

    Setup: mock `Repository<UserEventFavorite>` using `jest.fn()` or `@golevelup/ts-jest`'s `createMock`.

  - [ ] 6.2 Write unit tests for `FavoritesController` in `src/modules/favorites/__tests__/favorites.controller.spec.ts`

    **`GET /api/favorites`**
    - Calls `favoritesService.getFavorites(userId)` with the user ID from the JWT payload.
    - Returns the service result.

    **`POST /api/favorites`**
    - Calls `favoritesService.addFavorite(userId, dto.event_id)`.
    - Returns `201` with the created entity.
    - Passes through `ConflictException` from the service.

    **`DELETE /api/favorites/:eventId`**
    - Calls `favoritesService.removeFavorite(userId, eventId)`.
    - Returns `204` with no body.
    - Passes through `NotFoundException` from the service.

    Setup: mock `FavoritesService` entirely; test only controller routing logic, not service internals.

- [ ] 7.0 Verification Checklist (before merging)
  - [ ] 7.1 Run the full test suite: `npm test -- --watchAll=false` (or project equivalent). All tests green.
  - [ ] 7.2 Confirm no new TypeScript errors: `npx tsc --noEmit`.
  - [ ] 7.3 Manually verify the migration runs cleanly against a local dev DB: `npm run migration:run`.
  - [ ] 7.4 Smoke-test the three endpoints using a tool like Postman or `curl` with a valid JWT:
    - `POST /api/favorites` with `{ "event_id": 1 }` → `201`.
    - `GET /api/favorites` → `200` with the new entry in the list.
    - `DELETE /api/favorites/1` → `204`.
    - `POST /api/favorites` again with the same `event_id` → `409`.
    - `DELETE /api/favorites/9999` (non-existent) → `404`.
    - Repeat all calls without a JWT → `401`.
  - [ ] 7.5 Verify that deleting a user account cascades and removes their `user_event_favorites` rows.

---

## API Contract Summary

| Method   | Path                      | Auth         | Request Body           | Success | Error codes         |
| -------- | ------------------------- | ------------ | ---------------------- | ------- | ------------------- |
| `GET`    | `/api/favorites`          | JwtAuthGuard | —                      | `200`   | `401`               |
| `POST`   | `/api/favorites`          | JwtAuthGuard | `{ event_id: number }` | `201`   | `400`, `401`, `409` |
| `DELETE` | `/api/favorites/:eventId` | JwtAuthGuard | —                      | `204`   | `401`, `404`        |

---

## Response Shape Reference

**`GET /api/favorites` — `200`**

```json
{
  "favorites": [
    { "id": 12, "event_id": 42, "created_at": "2026-04-01T12:00:00.000Z" },
    { "id": 7, "event_id": 18, "created_at": "2026-03-15T09:30:00.000Z" }
  ]
}
```

**`POST /api/favorites` — `201`**

```json
{ "id": 13, "user_id": 5, "event_id": 99, "created_at": "2026-05-11T17:00:00.000Z" }
```

**`POST /api/favorites` — `409`**

```json
{ "statusCode": 409, "message": "Event already in favorites" }
```

**`DELETE /api/favorites/:eventId` — `204`**
_(no body)_

**`DELETE /api/favorites/:eventId` — `404`**

```json
{ "statusCode": 404, "message": "Favorite not found" }
```
