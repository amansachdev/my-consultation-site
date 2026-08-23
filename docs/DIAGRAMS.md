# Antaran Platform Diagrams

These diagrams describe the current MVP implementation. Dashed nodes are planned or deferred and are not part of the live booking path.

## Current System Architecture

```mermaid
flowchart LR
    User[Patient browser]
    SWA[Azure Static Web Apps\nVite + React]
    API[Azure Functions API\n/api]
    Firebase[Firebase Authentication\noptional Google sign-in]
    Cosmos[(Azure Cosmos DB\nprofiles, bookings, assessments, consents)]
    Resend[Resend\ntransactional email]
    Calendar[Google Calendar API\nGoogle Meet]

    User --> SWA
    User -. optional sign-in .-> Firebase
    SWA --> API
    API -. verify Firebase token .-> Firebase
    API --> Cosmos
    API --> Resend
    API --> Calendar
```

## Booking and Meeting Flow

```mermaid
sequenceDiagram
    participant Patient
    participant App as React app
    participant API as Azure Functions
    participant DB as Cosmos DB
    participant Google as Google Calendar + Meet
    participant Mail as Resend

    Patient->>App: Submit booking request
    App->>API: POST /api/bookings
    API->>DB: Save request as requested
    API->>Google: Create Calendar event + Meet conference
    Google-->>API: Meet URL + appointment timestamps
    API->>DB: Store meeting details
    API->>Mail: Send admin notification
    API->>Mail: Send patient confirmation
    API-->>App: Booking received
    App-->>Patient: Show email/account instructions

    Note over Patient,Google: Join is enabled only from 15 minutes before start
    Patient->>App: Open Account
    App->>API: GET /api/bookings
    API->>DB: Read signed-in patient's bookings
    DB-->>API: Booking history + Meet URL
    API-->>App: Booking history
    App-->>Patient: Show timed Join meeting action
```

## Authentication and Data Access

```mermaid
flowchart TD
    Visitor[Visitor]
    Public[Public pages\nHome, Book, Assessment, Team]
    SignIn[Optional Google sign-in\nFirebase Auth]
    Token[Firebase ID token]
    API[Azure Functions API]
    Guest[Guest booking\nuserId = guest]
    Account[Signed-in account\nprofile, bookings, saved assessments]
    DB[(Cosmos DB)]

    Visitor --> Public
    Public -->|booking without sign-in| Guest
    Public -->|sign in when needed| SignIn
    SignIn --> Token
    Token --> API
    API --> Account
    Guest --> API
    API --> DB
```

## Current MVP to Planned Roadmap

```mermaid
flowchart LR
    M0[M0 Foundation\nIn progress] --> M1[M1 Optional identity\nIn progress]
    M0 --> M3[M3 Assessments\nIn progress]
    M1 --> M2[M2 Patient portal\nIn progress]
    M2 --> M4[M4 Booking + calendar\nIn progress]
    M4 --> M6[M6 Google Meet\nIn progress]
    M4 -. planned .-> M5[M5 Payments]
    M6 -. planned .-> M7[M7 Clinician dashboard + EHR]
    M7 -. planned .-> M8[M8 Prescriptions + documents]
    M3 -. planned .-> M9[M9 Safety workflows]
    M7 -. planned .-> M10[M10 Admin operations]
    M9 -. planned .-> M11[M11 Security + compliance]
    M11 -. planned .-> M13[M13 QA + soft launch]
```

## Current Booking Data Shape

```mermaid
erDiagram
    BOOKING_REQUEST {
        string id
        string userId
        string fullName
        number age
        string phone
        string email
        string consultationType
        string preferredDate
        string preferredTime
        string status
        string meetingStatus
        string meetingUrl
        string meetingStartAt
        string notificationStatus
        string createdAt
    }

    BOOKING_REQUEST }o--|| PATIENT_IDENTITY : "belongs to when signed in"
    PATIENT_IDENTITY {
        string firebaseUserId
        string email
    }
```

Guest records use `userId = guest`; they are saved successfully but are not automatically claimed by a later account login.
