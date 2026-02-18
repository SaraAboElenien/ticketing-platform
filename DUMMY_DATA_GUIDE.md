# Dummy Data Seeding Guide

This guide explains how to populate your database with dummy Events and Bookings for testing all endpoints.

## Quick Start

```bash
# From the project root
npm run seed --workspace=apps/api

# Or from apps/api directory
cd apps/api
npm run seed
```

## What Gets Created

### Users (if they don't exist)
- **testuser1@example.com** (Password: `Password123`) - Regular user
- **testuser2@example.com** (Password: `Password123`) - Regular user  
- **admin@example.com** (Password: `Password123`) - Admin user

### Events (10 total)

#### Published Events (6)
1. **Summer Music Festival 2026**
   - Date: 30 days from now
   - Venue: Central Park
   - Tickets: 3,500 / 5,000 available (70%)
   - Price: $75.00
   - Status: Published

2. **Jazz Night at Blue Note**
   - Date: 15 days from now
   - Venue: Blue Note Jazz Club
   - Tickets: 45 / 200 available (22.5% - Limited)
   - Price: $50.00
   - Status: Published

3. **Tech Conference 2026**
   - Date: 60 days from now
   - Venue: Convention Center
   - Tickets: 800 / 1,000 available (80%)
   - Price: $299.00
   - Status: Published

4. **Rock Concert: The Legends**
   - Date: 45 days from now
   - Venue: Madison Square Garden
   - Tickets: 500 / 20,000 available (2.5% - Almost Sold Out)
   - Price: $150.00
   - Status: Published

5. **Comedy Show: Stand-Up Night**
   - Date: 7 days from now
   - Venue: Comedy Cellar
   - Tickets: 0 / 150 available (Sold Out)
   - Price: $35.00
   - Status: Published

6. **Winter Wonderland Market**
   - Date: 90 days from now
   - Venue: Downtown Plaza
   - Tickets: 450 / 500 available (90%)
   - Price: $25.00
   - Status: Published

#### Draft Events (2)
7. **Spring Art Exhibition**
   - Date: 120 days from now
   - Venue: Metropolitan Museum
   - Tickets: 300 / 300 available
   - Price: $40.00
   - Status: Draft

8. **Food & Wine Festival**
   - Date: 75 days from now
   - Venue: Waterfront Park
   - Tickets: 800 / 800 available
   - Price: $85.00
   - Status: Draft

#### Cancelled Event (1)
9. **Cancelled: Outdoor Movie Night**
   - Date: 20 days from now
   - Venue: Riverside Park
   - Tickets: 300 / 300 available
   - Price: $20.00
   - Status: Cancelled

#### Completed Event (1)
10. **New Year Celebration 2025**
    - Date: 30 days ago (past event)
    - Venue: Times Square
    - Tickets: 0 / 10,000 available
    - Price: $100.00
    - Status: Completed

### Bookings (9 total)

1. **testuser1** → Summer Music Festival (Confirmed)
2. **testuser2** → Summer Music Festival (Confirmed)
3. **testuser1** → Jazz Night (Confirmed)
4. **testuser2** → Jazz Night (Cancelled - with reason)
5. **testuser1** → Tech Conference (Confirmed)
6. **admin** → Tech Conference (Confirmed)
7. **testuser2** → Rock Concert (Confirmed)
8. **testuser1** → Comedy Show (Confirmed - sold out event)
9. **testuser2** → Winter Wonderland Market (Pending - expires in 11 days)
10. **testuser1** → New Year Celebration (Confirmed - past event)
11. **testuser2** → New Year Celebration (Confirmed - past event)

## Testing Endpoints

### Events Endpoints

#### Public Endpoints (No Auth Required)
```bash
# List all published events
GET http://localhost:3000/api/v1/events?status=published

# Search events
GET http://localhost:3000/api/v1/events?search=music

# Filter by price range
GET http://localhost:3000/api/v1/events?minPrice=50&maxPrice=100

# Get single event
GET http://localhost:3000/api/v1/events/{eventId}
```

#### Admin Endpoints (Requires Admin Token)
```bash
# Create event
POST http://localhost:3000/api/v1/events
Headers: Authorization: Bearer {admin-token}
Body: {
  "name": "New Event",
  "date": "2026-12-31T20:00:00Z",
  "venue": "Venue Name",
  "totalTickets": 1000,
  "price": 50.00,
  "status": "published"
}

# Update event
PUT http://localhost:3000/api/v1/events/{eventId}
Headers: Authorization: Bearer {admin-token}
Body: { "name": "Updated Name" }

# Delete event (soft delete)
DELETE http://localhost:3000/api/v1/events/{eventId}
Headers: Authorization: Bearer {admin-token}
```

### Bookings Endpoints

#### User Endpoints (Requires Auth)
```bash
# Create booking (requires Idempotency-Key header)
POST http://localhost:3000/api/v1/bookings
Headers: 
  Authorization: Bearer {user-token}
  Idempotency-Key: {uuid-v4}
Body: {
  "eventId": "{eventId}",
  "quantity": 2
}

# Get user's bookings
GET http://localhost:3000/api/v1/bookings
Headers: Authorization: Bearer {user-token}

# Get single booking
GET http://localhost:3000/api/v1/bookings/{bookingId}
Headers: Authorization: Bearer {user-token}

# Cancel booking
PATCH http://localhost:3000/api/v1/bookings/{bookingId}/cancel
Headers: Authorization: Bearer {user-token}
Body: {
  "reason": "Changed plans"
}
```

## Test Scenarios Covered

### Event Scenarios
- ✅ Published events with various availability levels
- ✅ Draft events (not visible to public)
- ✅ Cancelled events
- ✅ Completed events (past dates)
- ✅ Sold out events (availableTickets = 0)
- ✅ Limited availability (< 30%)
- ✅ Almost sold out (< 5%)

### Booking Scenarios
- ✅ Confirmed bookings
- ✅ Cancelled bookings (with reason)
- ✅ Pending bookings (with expiration)
- ✅ Bookings for sold out events
- ✅ Bookings for past events
- ✅ Multiple bookings per user
- ✅ Multiple bookings per event

## Notes

- The script will **not** delete existing users - it only creates them if they don't exist
- The script **will** delete old dummy events (matching the name pattern) and all bookings before seeding
- All test users have the password: `Password123`
- All users are email-verified (`isEmailVerified: true`)
- Dates are relative to when you run the script (e.g., "30 days from now")

## Troubleshooting

### Script fails to connect to MongoDB
- Ensure MongoDB is running
- Check your `.env` file has the correct `MONGODB_URI` or `MONGODB_URI_LIVE`
- Verify the connection string format

### Script fails with "User already exists"
- This is normal - the script checks if users exist before creating them
- Existing users won't be modified

### Script fails with duplicate key error
- Run the script again - it clears old dummy data first
- Or manually delete events/bookings from MongoDB

## Re-running the Script

You can safely run the script multiple times. It will:
1. Keep existing users (won't recreate them)
2. Delete old dummy events (by name pattern)
3. Delete all bookings
4. Create fresh events and bookings

This ensures you always have clean, predictable test data.

