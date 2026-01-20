# Reservations API Integration Tasks

## Reference

- Backend PRD: `/docs/frontend/features/RESERVATIONS_PRD.md`
- Frontend Types: `/src/Modules/Reservations/types/reservation.types.ts`
- Frontend Components: `/src/Modules/Reservations/components/`

---

## API Call Strategy

### Decision: Sequential Calls, List Endpoint Only

1. **Sequential Loading** - `/reservations` will be called **after** `/me` completes (not in parallel)
2. **List Endpoint Only** - We will use only `GET /reservations` endpoint
3. **No Single Endpoint** - `GET /reservations/{id}` will NOT be used

### Call Flow

```
AccountPage Load
    │
    ├── GET /users/me ──────────────────────► Wait for completion
    │                                                │
    │                                                ▼
    └───────────────────────────────────────► GET /reservations
                                                     │
                                                     ▼
                                             Render reservations
```

### Rationale

- Simpler implementation
- User data (`/me`) is required first for authentication validation
- Reservation list contains all data needed (no need for detail endpoint)
- Reduces API complexity

---

## Backend Response Schema (from PRD)

```json
{
  "reservations": [
    {
      "id": 1,
      "event": {
        "id": 101,
        "name": "Family Love Pantry"
      },
      "date": "2026-01-17",
      "timeslot": {
        "start_time": "2026-01-17T09:00:00.000Z",
        "end_time": "2026-01-17T15:00:00.000Z"
      },
      "household_id": 1,
      "created_at": "2026-01-09T10:30:00.000Z",
      "updated_at": "2026-01-09T10:30:00.000Z"
    }
  ],
  "total": 5,
  "upcoming_count": 2,
  "past_count": 3
}
```

---

## Implementation Approach

Implement frontend to work with **only the fields provided by backend**. Adapt UI to gracefully handle missing data.

### Fields Available ✅

- `id`
- `event.id`
- `event.name`
- `date`
- `timeslot.start_time` (ISO format - needs transformation)
- `timeslot.end_time` (ISO format - needs transformation)
- `household_id`
- `created_at`
- `updated_at`
- Response metadata: `total`, `upcoming_count`, `past_count`

### Fields NOT Available ❌ (Frontend Must Adapt)

- `event.location` → Hide location from cards
- `event_type` → Remove event type badges
- `status` → Derive from date (past = completed, future = confirmed)
- `confirmation_code` / `check_in_code` → Hide check-in code section
- `qr_code_url` → Hide QR code section

---

## 📋 Task List

### Phase 1: Update Type Definitions ✅

- [x] **Task 1.1:** Create `ReservationApiResponse` interface matching backend schema
- [x] **Task 1.2:** Update `Reservation` interface (remove unavailable fields, make optional)
- [x] **Task 1.3:** Remove `EventType` usage (not provided by backend)
- [x] **Task 1.4:** Update `ReservationTimeslot` interface (remove `event_slot_id`)
- [x] **Task 1.5:** Update `ReservationEvent` interface (remove `location`, `organization_name`)

### Phase 2: Update API Service ✅

- [x] **Task 2.1:** Add response transformation function (API → Frontend format)
- [x] **Task 2.2:** Implement ISO time format conversion to display format ("9:00am")
- [x] **Task 2.3:** Implement status derivation logic (date comparison)
- [x] **Task 2.4:** Update `getReservations()` method to call real endpoint
- [x] **Task 2.5:** Remove `getReservationById()` method (not needed)
- [x] **Task 2.6:** Toggle off mock data (`USE_MOCK_DATA = false`)
- [x] **Task 2.7:** Test real API integration

### Phase 3: Update UI Components ✅

- [x] **Task 3.1:** Update `ReservationCard` - remove location display
- [x] **Task 3.2:** Update `ReservationCard` - remove event type badge
- [x] **Task 3.3:** Update `ReservationCard` - remove QR code section
- [x] **Task 3.4:** Update `ReservationCard` - remove check-in code section
- [x] **Task 3.5:** Update `ReservationCard` - use derived status for past events
- [x] **Task 3.6:** Update `PastEventsSection` - work with derived status

### Phase 4: Cleanup & Testing ✅

- [x] **Task 4.1:** Remove/archive mock data files
- [x] **Task 4.2:** Update localization keys (remove unused)
- [x] **Task 4.3:** Test empty states
- [x] **Task 4.4:** Test error handling (401, 404, 500)
- [x] **Task 4.5:** Verify responsive design still works

---

## 📝 Detailed Implementation Notes

### Task 1.1-1.5: Type Definition Changes

**New types to create:**

```typescript
// Backend API response (what we receive)
export interface ReservationApiResponse {
  id: number;
  event: {
    id: number;
    name: string;
  };
  date: string; // "2026-01-17"
  timeslot: {
    start_time: string; // ISO: "2026-01-17T09:00:00.000Z"
    end_time: string;   // ISO: "2026-01-17T15:00:00.000Z"
  };
  household_id: number;
  created_at: string;
  updated_at: string;
}

export interface ReservationsApiListResponse {
  reservations: ReservationApiResponse[];
  total: number;
  upcoming_count: number;
  past_count: number;
}

// Frontend display model (transformed for UI)
export interface Reservation {
  id: number;
  event: {
    id: number;
    name: string;
  };
  date: string;
  timeslot: {
    start_time: string; // Formatted: "9:00am"
    end_time: string;   // Formatted: "3:00pm"
  };
  status: "confirmed" | "completed"; // Derived from date
  household_id: number;
  created_at: string;
  updated_at: string;
}
```

### Task 2.1-2.2: Response Transformation

```typescript
// Transform ISO time to display format
function formatTimeFromISO(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  }).toLowerCase(); // "9:00am"
}

// Derive status from date
function deriveStatus(dateString: string): "confirmed" | "completed" {
  const eventDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return eventDate < today ? "completed" : "confirmed";
}

// Transform API response to frontend model
function transformReservation(api: ReservationApiResponse): Reservation {
  return {
    id: api.id,
    event: api.event,
    date: api.date,
    timeslot: {
      start_time: formatTimeFromISO(api.timeslot.start_time),
      end_time: formatTimeFromISO(api.timeslot.end_time),
    },
    status: deriveStatus(api.date),
    household_id: api.household_id,
    created_at: api.created_at,
    updated_at: api.updated_at,
  };
}
```

### Task 2.4-2.5: API Service Updates

```typescript
// ReservationsApiService.ts

// REMOVE this method (not needed):
// async getReservationById(id: number): Promise<Reservation | null>

// KEEP and update this method:
async getReservations(type: "upcoming" | "past" | "all" = "all"): Promise<ReservationsResponse> {
  // Call real API instead of mock
  const response = await fetch(`${API_BASE_URL}/reservations`, {
    headers: this.getAuthHeaders(),
  });
  
  // Transform API response to frontend format
  const apiData: ReservationsApiListResponse = await response.json();
  return this.transformResponse(apiData);
}
```

### Sequential Call Implementation (YourReservations.tsx)

```typescript
// YourReservations.tsx - useEffect for sequential loading

useEffect(() => {
  // Wait for user data to be available before fetching reservations
  // This ensures authentication is validated first
  const fetchReservations = async () => {
    setIsLoading(true);
    try {
      const response = await ReservationsApiService.getReservations("upcoming");
      setReservations(response.reservations);
    } catch (error) {
      setError("Failed to load reservations");
    } finally {
      setIsLoading(false);
    }
  };

  fetchReservations();
}, []); // Called when component mounts (after AccountPage loads /me)
```

---

### Task 3.1-3.4: UI Component Changes

**ReservationCard - Before:**

```
┌────────────────────────────────────────────┐
│ Family Love Pantry                   [QR]  │  ← Remove QR
│ Mid-Ohio Market at Heart                   │  ← Remove location
│ Fri, Jan 16 · 9:00am - 3:00pm             │
│ [In-Person]                                │  ← Remove badge
│                        [Cancel Reservation]│  ← Already removed
└────────────────────────────────────────────┘
```

**ReservationCard - After:**

```
┌────────────────────────────────────────────┐
│ Family Love Pantry                         │
│ Fri, Jan 16, 2026 · 9:00am - 3:00pm       │
└────────────────────────────────────────────┘
```

**PastEventsSection Card - After:**

```
┌────────────────────────────────────────────┐
│ Family Love Pantry                         │
│ Sat, Jan 10, 2026 · 11:00am - 1:00pm      │
│ [Completed]                                │  ← Derived from date
└────────────────────────────────────────────┘
```

---

## 📅 Estimated Effort

| Phase   | Tasks | Estimate  |
| ------- | ----- | --------- |
| Phase 1 | 5     | 1-2 hours |
| Phase 2 | 7     | 2-3 hours |
| Phase 3 | 6     | 2-3 hours |
| Phase 4 | 5     | 1-2 hours |
| **Total** | **23** | **6-10 hours** |

---

## 🔄 Files to Modify

| File | Changes |
|------|---------|
| `src/Modules/Reservations/types/reservation.types.ts` | Update interfaces |
| `src/Services/ReservationsApiService.ts` | Add transformation, remove `getReservationById()`, toggle mock off |
| `src/Modules/Reservations/components/ReservationCard.tsx` | Remove location, QR, badge |
| `src/Modules/Reservations/components/YourReservations.tsx` | Sequential API call after `/me` |
| `src/Modules/Reservations/components/PastEventsSection.tsx` | Use derived status |
| `src/Modules/Reservations/mock/mockReservations.ts` | Archive or delete |

---

## ✅ Acceptance Criteria

1. Reservations load from real API (not mock data)
2. Upcoming reservations display: event name + formatted date/time
3. Past events display: event name + formatted date/time + "Completed" badge
4. Empty states work correctly
5. Error handling works (auth errors redirect to login)
6. No console errors or TypeScript warnings
