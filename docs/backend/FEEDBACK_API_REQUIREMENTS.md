# Feedback API Requirements

This document specifies the backend API requirements for the Feedback feature. The frontend team has implemented a mock service and is ready to integrate with the real API once available.

## Overview

The Feedback API allows authenticated users to submit feedback about their visit experiences at food banks. Each feedback submission is associated with a specific reservation.

---

## Endpoint

### POST /api/feedback

Submit user feedback for a completed reservation visit.

---

## Authentication

- **Required**: Yes
- **Type**: Bearer Token
- **Header**: `Authorization: Bearer <token>`

---

## Request

### Headers

| Header | Value | Required |
|--------|-------|----------|
| `Content-Type` | `application/json` | Yes |
| `Authorization` | `Bearer <token>` | Yes |

### Request Body

```json
{
  "reservation_id": "string",
  "rating": 4,
  "tags": ["kind_volunteers", "good_service"],
  "feedback_text": "I really liked it here. Everyone was very nice."
}
```

### Request Body Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `reservation_id` | string | Yes | The ID of the reservation this feedback is for |
| `rating` | integer | Yes | Star rating from 1 to 5 |
| `tags` | string[] | No | Array of experience tags (see available tags below) |
| `feedback_text` | string | No | Optional written feedback (max 1000 characters) |

### Available Tags

| Tag ID | Display Label |
|--------|---------------|
| `kind_volunteers` | Kind Volunteers |
| `good_service` | Good Service |
| `clean_space` | Clean Space |
| `quality_food` | Quality Food |
| `efficient_shoppers` | Efficient Shoppers |

---

## Response

### Success Response (201 Created)

```json
{
  "success": true,
  "message": "Feedback submitted successfully",
  "feedback_id": "fb_1706054400_abc123def",
  "timestamp": "2026-01-23T15:00:00.000Z"
}
```

### Success Response Schema

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Always `true` for successful submissions |
| `message` | string | Human-readable success message |
| `feedback_id` | string | Unique identifier for the submitted feedback |
| `timestamp` | string | ISO 8601 timestamp of when feedback was recorded |

---

## Error Responses

### 400 Bad Request

Invalid request body or validation errors.

```json
{
  "success": false,
  "message": "Validation error: Rating must be between 1 and 5",
  "errors": [
    {
      "field": "rating",
      "message": "Rating must be between 1 and 5"
    }
  ]
}
```

### 401 Unauthorized

Missing or invalid authentication token.

```json
{
  "success": false,
  "message": "Authentication required"
}
```

### 403 Forbidden

User is not authorized to submit feedback for this reservation.

```json
{
  "success": false,
  "message": "You are not authorized to submit feedback for this reservation"
}
```

### 404 Not Found

Reservation not found.

```json
{
  "success": false,
  "message": "Reservation not found"
}
```

### 409 Conflict

Feedback already submitted for this reservation.

```json
{
  "success": false,
  "message": "Feedback has already been submitted for this reservation"
}
```

### 500 Internal Server Error

Server error during processing.

```json
{
  "success": false,
  "message": "An error occurred while processing your feedback"
}
```

---

## Validation Rules

| Field | Rule |
|-------|------|
| `reservation_id` | Must be a valid reservation ID belonging to the authenticated user |
| `rating` | Integer between 1 and 5 (inclusive) |
| `tags` | Array of valid tag IDs (see available tags above); empty array is allowed |
| `feedback_text` | String with maximum length of 1000 characters; empty string is allowed |

---

## Business Rules

1. **One feedback per reservation**: Users can only submit feedback once per reservation. Attempting to submit again should return a 409 Conflict error.

2. **Past events only**: Feedback can only be submitted for reservations where the event date has passed.

3. **User ownership**: Users can only submit feedback for their own reservations.

4. **Rating required**: A star rating (1-5) is mandatory. Tags and written feedback are optional.

---

## Database Schema Suggestion

```sql
CREATE TABLE feedback (
    id VARCHAR(50) PRIMARY KEY,
    reservation_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    tags TEXT[], -- Array of tag IDs
    feedback_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_reservation FOREIGN KEY (reservation_id) REFERENCES reservations(id),
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT unique_reservation_feedback UNIQUE (reservation_id)
);

CREATE INDEX idx_feedback_user ON feedback(user_id);
CREATE INDEX idx_feedback_created ON feedback(created_at);
```

---

## Frontend Implementation Status

The frontend has implemented:

- ✅ FeedbackModal component with star rating, tags, and text input
- ✅ FeedbackConfirmation success screen
- ✅ FeedbackApiService with mock implementation
- ✅ Integration with ReservationCard (past events)
- ✅ Localization support (9 languages)

**Mock Mode**: The frontend service is currently using mock mode (`USE_MOCK_DATA = true`). Once the backend endpoint is available, toggle this flag in `src/Services/FeedbackApiService.ts` to switch to the real API.

---

## Contact

For questions about frontend integration, contact the frontend team.

For questions about API implementation, contact the backend team.
