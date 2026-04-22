# EmergencyTool NET - API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication

### POST /auth/login
Login with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user"
  }
}
```

### POST /auth/register
Register a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "09123456789",
  "barangay": "Poblacion"
}
```

### GET /auth/profile (Protected)
Get current user profile.

**Headers:**
```
Authorization: Bearer <token>
```

---

## Emergencies

### POST /emergency/reports (Protected)
Create a new emergency report.

**Request:**
```json
{
  "type": "fire",
  "latitude": 14.5995,
  "longitude": 120.9842,
  "description": "House on fire"
}
```

**Response:**
```json
{
  "id": "uuid",
  "incidentCode": "EMG-ABC123",
  "type": "fire",
  "status": "pending",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### GET /emergency/reports
List all emergency reports.

**Query Parameters:**
- `status` (optional): pending, dispatched, arrived, resolved, cancelled
- `type` (optional): fire, flood, earthquake, medical, crime, accident, missing, other
- `limit` (optional): default 100
- `offset` (optional): default 0

### GET /emergency/reports/active
Get all active (pending/dispatched/arrived) emergency reports.

### GET /emergency/reports/:id
Get detailed information about a specific emergency report.

### PUT /emergency/reports/:id/status (Protected)
Update emergency status.

**Request:**
```json
{
  "status": "dispatched"
}
```

### POST /emergency/reports/:id/assign (Protected)
Assign a responder to an emergency.

**Request:**
```json
{
  "responderId": "uuid"
}
```

### GET /emergency/types
Get list of emergency types.

---

## Location

### POST /location/share (Protected)
Share current GPS location.

**Request:**
```json
{
  "latitude": 14.5995,
  "longitude": 120.9842,
  "accuracy": 10
}
```

### GET /location/current (Protected)
Get current user's latest location.

### GET /location/history (Protected)
Get location history.

**Query Parameters:**
- `limit` (optional): default 100

### POST /location/tracking/start (Protected)
Start background location tracking.

### POST /location/tracking/stop (Protected)
Stop background location tracking.

### POST /location/shareable-link (Protected)
Generate a shareable location link.

**Response:**
```json
{
  "token": "abc12345",
  "url": "http://localhost:5173/locate/abc12345",
  "expiresAt": "2024-01-02T00:00:00Z"
}
```

### GET /location/shared/:token
Get shared location by token.

---

## Broadcasts

### GET /broadcasts
Get all broadcasts.

**Query Parameters:**
- `barangay` (optional): Filter by barangay

### GET /broadcasts/active
Get all active (non-expired) broadcasts.

### POST /broadcasts (Protected, Admin Only)
Create a new broadcast alert.

**Request:**
```json
{
  "title": "Typhoon Warning",
  "message": "Stay indoors",
  "barangay": "Poblacion",
  "type": "warning",
  "priority": "high"
}
```

---

## Family

### GET /family/circle (Protected)
Get family circle and members.

### POST /family/circle (Protected)
Create a new family circle.

**Request:**
```json
{
  "name": "Doe Family"
}
```

### POST /family/circle/:id/checkin (Protected)
Check in family member.

**Request:**
```json
{
  "status": "safe"
}
```

### POST /family/circle/:id/members (Protected)
Add member to family circle.

**Request:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "09123456789"
}
```

---

## Users

### GET /users/profile (Protected)
Get current user profile.

### PUT /users/household (Protected)
Update household information.

**Request:**
```json
{
  "address": "123 Main St",
  "members": 4,
  "hasPwd": true,
  "hasSenior": false,
  "hasPregnant": false
}
```

### GET /users/emergency-contacts (Protected)
Get emergency contacts.

### POST /users/emergency-contacts (Protected)
Add emergency contact.

**Request:**
```json
{
  "name": "Jane Doe",
  "phone": "09123456789",
  "relationship": "Spouse",
  "isPrimary": true
}
```

---

## Responders

### GET /responders
List all responders.

### GET /responders/assignments (Protected)
Get responder's assignments.

### PUT /responder/status (Protected)
Update responder status.

**Request:**
```json
{
  "status": "available"
}
```

---

## Analytics

### GET /analytics/stats
Get overall statistics.

### GET /analytics/heatmap
Get emergency heat map data.

### GET /analytics/monthly-report
Get monthly disaster report.

---

## WebSocket Events

### Connection
```javascript
const io = io('http://localhost:3000', {
  auth: { token: '<jwt_token>' }
});
```

### Events

- `emergency:new` - New emergency created
- `location:update` - User location updated
- `family:status` - Family member status changed
- `broadcast:new` - New broadcast alert
- `responder:assigned` - Responder assigned to emergency