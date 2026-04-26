# Baccouche Motors - Comprehensive Application Review Report

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Users & Roles](#3-users--roles)
4. [Use Cases by User Type](#4-use-cases-by-user-type)
5. [Frontend Analysis](#5-frontend-analysis)
6. [Backend Analysis](#6-backend-analysis)
7. [Entities & Database Schema](#7-entities--database-schema)
8. [API Endpoints Summary](#8-api-endpoints-summary)
9. [Infrastructure & Deployment](#9-infrastructure--deployment)
10. [Security Features](#10-security-features)
11. [UML Diagrams](#11-uml-diagrams)
12. [Summary](#12-summary)

---

## 1. Project Overview

This is a **full-stack car dealership application** consisting of two main parts:

| Component    | Type                 | Description                       |
| ------------ | -------------------- | --------------------------------- |
| **Backend**  | NestJS Microservices | REST API with API Gateway pattern |
| **Frontend** | Next.js 16 App       | React-based web application       |

### 1.1 Technology Stack Summary

#### Backend Stack

| Category          | Technology              |
| ----------------- | ----------------------- |
| Runtime           | Node.js                 |
| Framework         | NestJS v11              |
| Language          | TypeScript v5.7         |
| Database          | PostgreSQL 16           |
| ORM               | TypeORM v0.3            |
| Message Broker    | RabbitMQ 3              |
| Authentication    | JWT + bcrypt            |
| API Documentation | Swagger/OpenAPI         |
| Testing           | Jest v30                |
| Container         | Docker + Docker Compose |

#### Frontend Stack

| Category         | Technology               |
| ---------------- | ------------------------ |
| Framework        | Next.js 16.1.6           |
| UI Library       | React 19.2.3             |
| Language         | TypeScript 5.x           |
| Styling          | Tailwind CSS v4          |
| UI Components    | shadcn/ui v4.1.2         |
| State Management | TanStack React Query v5  |
| Form Handling    | React Hook Form v7 + Zod |
| HTTP Client      | Axios                    |
| Rich Text Editor | TipTap v3                |
| Charts           | Recharts                 |
| Testing          | Cypress (E2E) + Vitest   |

---

## 2. Architecture

### 2.1 Overall System Architecture

```mermaid
graph TB
    subgraph "Frontend (Next.js)"
        FW[Web Browser]
    end

    subgraph "API Gateway (NestJS)"
        GW[Gateway<br/]:3500]
    end

    subgraph "Backend Services (Microservices)"
        subgraph "Message Broker (RabbitMQ)"
            RMQ[RabbitMQ<br/>:5672]
        end

        SERVICES[
            AUTH[Auth<br/>:3501]
            CARS[Cars<br/>:3502]
            NEWS[News<br/>:3503]
            TESTDRIVE[Test Drives<br/>:3504]
            CONTACTS[Contacts<br/>:3505]
            ADMIN[Admin<br/>:3506]
        ]
    end

    subgraph "Database Layer (PostgreSQL)"
        DB1[baccouche_auth]
        DB2[baccouche_cars]
        DB3[baccouche_news]
        DB4[baccouche_test_drives]
        DB5[baccouche_contacts]
    end

    FW --> GW
    GW --> RMQ
    RMQ --> AUTH
    RMQ --> CARS
    RMQ --> NEWS
    RMQ --> TESTDRIVE
    RMQ --> CONTACTS
    RMQ --> ADMIN

    AUTH --> DB1
    CARS --> DB2
    NEWS --> DB3
    TESTDRIVE --> DB4
    CONTACTS --> DB5
```

### 2.2 Backend Microservices Architecture

```mermaid
graph LR
    subgraph "API Gateway Layer"
        GW[Gateway<br/Port 3500]
        MID[Middleware<br/>Rate Limiter]
        AUTHG[Auth Guard]
        PROXY[RPC Proxy]
    end

    subgraph "Microservices"
        MS1[Auth Service]
        MS2[Cars Service]
        MS3[News Service]
        MS4[Test Drives Service]
        MS5[Contacts Service]
        MS6[Admin Service]
    end

    subgraph "Shared Library"
        SHARED[libs/shared]
        CONST[Constants<br/>Enums]
        GUARDS[Guards<br/>RBAC]
        DTO[DTOs]
        FILTERS[Filters]
    end

    GW --> MID
    MID --> AUTHG
    AUTHG --> PROXY
    PROXY --> MS1
    PROXY --> MS2
    PROXY --> MS3
    PROXY --> MS4
    PROXY --> MS5
    PROXY --> MS6

    MS1 --> SHARED
    MS2 --> SHARED
    MS3 --> SHARED
    MS4 --> SHARED
    MS5 --> SHARED
    MS6 --> SHARED
```

### 2.3 Frontend Architecture

```mermaid
graph TB
    subgraph "Next.js App Router"
        LAYOUT[Root Layout]

        subgraph "Public Routes"
            HOME[/]
            CARS[/cars]
            CAR_DETAIL[/cars/:slug]
            NEWS[/actualites]
            CONTACT[/contact]
            TESTDRIVE[/test-drive]
        end

        subgraph "Admin Routes (Protected)"
            ADMIN_LOGIN[/admin/login]
            ADMIN_DASH[/admin/dashboard]
            ADMIN_CARS[/admin/cars]
            ADMIN_NEWS[/admin/news]
            ADMIN_CONTACTS[/admin/contacts]
            ADMIN_TESTDRIVES[/admin/test-drives]
        end

        subgraph "Customer Portal (Protected)"
            CUSTOMER_LOGIN[/customer/login]
            CUSTOMER_REGISTER[/customer/register]
            CUSTOMER_DASH[/customer/dashboard]
            CUSTOMER_PROFILE[/customer/profile]
            CUSTOMER_TESTDRIVES[/customer/test-drives]
        end
    end

    subgraph "State Management"
        RQ[TanStack React Query]
        CTX[React Context<br/>Auth]
    end

    subgraph "API Layer"
        API[Axios Client]
        INTERCEPT[Interceptors]
    end

    LAYOUT --> HOME
    LAYOUT --> CARS
    LAYOUT --> CONTACT

    RQ --> API
    CTX --> API
    API --> INTERCEPT
```

---

## 3. Users & Roles

### 3.1 User Roles (from `libs/shared/src/constants.ts`)

| Role           | Description                                                                              |
| -------------- | ---------------------------------------------------------------------------------------- |
| **`ADMIN`**    | Full system access - can manage all entities, view dashboard, manage staff               |
| **`STAFF`**    | Limited admin access - can manage cars, test drives, contacts (no user management)       |
| **`CUSTOMER`** | Public user - can register, login, book test drives, submit contacts, manage own profile |

---

## 4. Use Cases by User Type

### 4.1 Anonymous/Guest Users (No Authentication)

```mermaid
graph TB
    A[Guest User] --> B[View Cars]
    A --> C[View Car Details]
    A --> D[View News]
    A --> E[View News Details]
    A --> F[Submit Contact Form]
    A --> G[View Services]
    A --> H[Request Test Drive]

    B --> API1[GET /api/cars]
    C --> API2[GET /api/cars/slug/:slug]
    D --> API3[GET /api/news]
    E --> API4[GET /api/news/slug/:slug]
    F --> API5[POST /api/contacts]
    G --> PAGE[Services Page]
    H --> API6[POST /api/test-drives]
```

### 4.2 CUSTOMER (Registered Users)

| Use Case            | Endpoint                           | Methods                |
| ------------------- | ---------------------------------- | ---------------------- |
| Register            | `POST /api/auth/register`          | Create new account     |
| Login               | `POST /api/auth/login`             | Get JWT token          |
| Forgot Password     | `POST /api/auth/forgot-password`   | Request password reset |
| Reset Password      | `POST /api/auth/reset-password`    | Reset with token       |
| View Profile        | `GET /api/customers/me`            | Get own profile        |
| Update Profile      | `PATCH /api/customers/me`          | Update personal info   |
| Change Password     | `PATCH /api/customers/me/password` | Update password        |
| Schedule Test Drive | `POST /api/test-drives`            | Book a test drive      |
| View My Test Drives | `GET /api/test-drives`             | List own test drives   |
| Cancel Test Drive   | `DELETE /api/test-drives/:id`      | Cancel booking         |

### 4.3 STAFF (Dealership Staff)

| Use Case                  | Endpoint                     | Methods                  |
| ------------------------- | ---------------------------- | ------------------------ |
| All CUSTOMER capabilities | -                            | Plus:                    |
| Create Car                | `POST /api/cars`             | Add new car to inventory |
| Update Car                | `PUT /api/cars/:id`          | Edit car details         |
| Delete Car                | `DELETE /api/cars/:id`       | Remove car               |
| Upload Car Image          | `POST /api/cars/:id/image`   | Upload car photo         |
| Create News               | `POST /api/news`             | Publish news article     |
| Update News               | `PUT /api/news/:id`          | Edit news                |
| Delete News               | `DELETE /api/news/:id`       | Remove news              |
| View Test Drives          | `GET /api/test-drives`       | View all bookings        |
| Update Test Drive Status  | `PATCH /api/test-drives/:id` | Confirm/reject/complete  |
| View Contacts             | `GET /api/contacts`          | View all contacts        |
| Update Contact            | `PATCH /api/contacts/:id`    | Mark as read             |

### 4.4 ADMIN (System Administrator)

| Use Case               | Endpoint         | Methods                |
| ---------------------- | ---------------- | ---------------------- |
| All STAFF capabilities | -                | Plus:                  |
| Admin Dashboard        | `GET /api/admin` | View system statistics |

---

## 5. Frontend Analysis

### 5.1 Frontend Project Structure

```
baccouche-motors-frontend/
├── app/                          # Next.js App Router
│   ├── (public routes)           # Public pages
│   │   ├── page.tsx             # Home page
│   │   ├── about/page.tsx       # About page
│   │   ├── cars/page.tsx        # Cars listing
│   │   ├── cars/[slug]/page.tsx  # Car detail
│   │   ├── contact/page.tsx      # Contact page
│   │   ├── test-drive/page.tsx  # Test drive request
│   │   ├── services/page.tsx      # Services page
│   │   └── actualites/          # News (French)
│   │       ├── page.tsx
│   │       └── [slug]/page.tsx
│   ├── admin/                   # Admin dashboard
│   │   ├── login/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── cars/
│   │   ├── news/
│   │   ├── contacts/
│   │   └── test-drives/
│   ├── customer/               # Customer portal
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── profile/page.tsx
│   │   └── test-drives/
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                      # shadcn/ui components
│   ├── admin/                   # Admin components
│   ├── customer/               # Customer components
│   ├── cars/                    # Car components
│   ├── home/                    # Homepage sections
│   ├── forms/                   # Form components
│   ├── layout/                   # Layout components
│   ├── auth/                    # Auth components
│   └── shared/                  # Shared components
├── lib/
│   ├── api/                     # API client & endpoints
│   ├── hooks/                   # React Query hooks
│   ├── auth-context.tsx          # Auth Context
│   ├── types/                    # TypeScript interfaces
│   └── utils.ts
├── cypress/                     # E2E tests
└── package.json
```

### 5.2 Frontend Routes

#### Public Routes

| Route                | Page               |
| -------------------- | ------------------ |
| `/`                  | Home page          |
| `/about`             | About page         |
| `/cars`              | Cars listing       |
| `/cars/[slug]`       | Car details        |
| `/contact`           | Contact form       |
| `/test-drive`        | Test drive request |
| `/services`          | Services page      |
| `/actualites`        | News listing       |
| `/actualites/[slug]` | News article       |

#### Admin Routes (Protected - Admin Role Required)

| Route                          | Page                |
| ------------------------------ | ------------------- |
| `/admin/login`                 | Admin login         |
| `/admin` or `/admin/dashboard` | Dashboard           |
| `/admin/cars`                  | Car management      |
| `/admin/cars/new`              | Create car          |
| `/admin/cars/edit/[id]`        | Edit car            |
| `/admin/news`                  | News management     |
| `/admin/news/new`              | Create news         |
| `/admin/news/edit/[id]`        | Edit news           |
| `/admin/contacts`              | Contact messages    |
| `/admin/test-drives`           | Test drive requests |

#### Customer Routes (Protected - Customer Role Required)

| Route                                | Page               |
| ------------------------------------ | ------------------ |
| `/customer/login`                    | Customer login     |
| `/customer/register`                 | Registration       |
| `/customer/forgot-password`          | Password recovery  |
| `/customer` or `/customer/dashboard` | Customer dashboard |
| `/customer/profile`                  | Profile management |
| `/customer/test-drives`              | My test drives     |

### 5.3 Frontend Components

```mermaid
graph BT
    subgraph "UI Components (shadcn/ui)"
        UI1[Button]
        UI2[Input]
        UI3[Card]
        UI4[Dialog]
        UI5[Form]
        UI6[Data Table]
        UI7[Rich Text Editor]
    end

    subgraph "Feature Components"
        FC1[Car Card]
        FC2[Car Grid]
        FC3[Image Gallery]
        FC4[Test Drive Form]
        FC5[Contact Form]
        FC6[Stats Cards]
        FC7[Charts]
    end

    subgraph "Layout Components"
        LC1[Site Chrome]
        LC2[Header]
        LC3[Footer]
        LC4[Admin Layout]
        LC5[Customer Layout]
    end

    subgraph "Auth Components"
        AC1[Auth Guard]
        AC2[Auth Context]
    end
```

### 5.4 Data Flow Architecture

```mermaid
sequenceDiagram
    participant User
    participant Page as Next.js Page
    participant Component as React Component
    participant Hook as React Query Hook
    participant API as Axios Client
    participant Backend as API Gateway

    User->>Page: Navigate to route
    Page->>Component: Render component
    Component->>Hook: Call data hook
    Hook->>API: HTTP Request
    API->>Backend: API Call

    Backend-->>API: Response JSON
    API-->>Hook: Return data
    Hook-->>Component: Update cache
    Component-->>Page: Re-render with data
    Page-->>User: Display UI
```

### 5.5 Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Page
    participant Context as AuthContext
    participant Storage as sessionStorage
    participant API as Auth API
    participant Backend

    User->>Page: Load app
    Page->>Context: Check auth state
    Context->>Storage: Check token
    alt Token exists
        Storage-->>Context: Return token
        Context->>API: Validate /api/auth/me
        API->>Backend: Validate token
        Backend-->>API: User data
        API-->>Context: Authenticated
        Context->>Page: Show protected content
    else No token
        Context->>Page: Show public content
    end

    User->>Page: Submit login
    Page->>Context: Call login()
    Context->>API: POST /api/auth/login
    API->>Backend: Validate credentials
    Backend-->>API: JWT token
    API-->>Context: Store token
    Context->>Storage: Save token
    Context->>Page: Redirect to dashboard
```

---

## 6. Backend Analysis

### 6.1 Backend Project Structure

```
baccouche-motors-backend/
├── apps/
│   ├── gateway/                   # API Gateway (entry point)
│   ├── auth/                   # Authentication microservice
│   ├── cars/                  # Cars inventory microservice
│   ├── news/                  # News/Blog microservice
│   ├── test-drives/           # Test drive scheduling
│   ├── contacts/              # Contact form microservice
│   ├── admin/                 # Admin dashboard microservice
│   └── baccouchemotorsapi/    # Legacy (deprecated)
├── libs/shared/                # Shared library
│   ├── src/
│   │   ├── guards/            # Auth guards
│   │   ├── decorators/        # Role decorators
│   │   ├── dto/             # Shared DTOs
│   │   ├── events/          # Events
│   │   ├── jwt/            # JWT utilities
│   │   ├── filters/         # Exception filters
│   │   └── constants.ts     # Enums
├── uploads/                   # File uploads
├── scripts/                   # Build scripts
└── docs/                     # OpenAPI docs
```

### 6.2 Docker Services

| Service     | Port      | Description              |
| ----------- | --------- | ------------------------ |
| Gateway     | 3500      | API Gateway              |
| Auth        | 3501      | Auth microservice        |
| Cars        | 3502      | Cars microservice        |
| News        | 3503      | News microservice        |
| Test Drives | 3504      | Test drives microservice |
| Contacts    | 3505      | Contacts microservice    |
| Admin       | 3506      | Admin microservice       |
| PostgreSQL  | 5432/5433 | Database                 |
| RabbitMQ    | 5672      | Message broker           |

---

## 7. Entities & Database Schema

### 7.1 Database: PostgreSQL (Polyglot Persistence)

- `baccouche_auth` - Users
- `baccouche_cars` - Car inventory
- `baccouche_news` - News articles
- `baccouche_test_drives` - Test drive bookings
- `baccouche_contacts` - Contact form submissions

### 7.2 Entity Class Diagrams

#### User Entity

```mermaid
classDiagram
    class User {
        +string id (UUID)
        +string email
        +string password
        +string firstName
        +string lastName
        +string phone
        +string address
        +UserRole role
        +DateTime createdAt
        +DateTime updatedAt
    }

    class UserRole {
        <<enumeration>>
        ADMIN
        STAFF
        CUSTOMER
    }

    User --> UserRole
```

#### Car Entity

```mermaid
classDiagram
    class Car {
        +string id (UUID)
        +string make
        +string model
        +integer year
        +decimal price
        +string slug
        +string image
        +text description
        +jsonb specs
        +string vin
        +integer mileage
        +string color
        +string fuelType
        +string transmission
        +CarStatus status
        +DateTime createdAt
        +DateTime updatedAt
    }

    class CarStatus {
        <<enumeration>>
        AVAILABLE
        SOLD
        RESERVED
        MAINTENANCE
    }

    Car --> CarStatus
```

#### News Entity

```mermaid
classDiagram
    class News {
        +string id (UUID)
        +string slug
        +string title
        +text excerpt
        +text content
        +Date date
        +string image
        +NewsStatus status
        +DateTime createdAt
        +DateTime updatedAt
    }

    class NewsStatus {
        <<enumeration>>
        DRAFT
        PUBLISHED
    }

    News --> NewsStatus
```

#### TestDrive Entity

```mermaid
classDiagram
    class TestDrive {
        +string id (UUID)
        +string userId (UUID)
        +string carId (UUID)
        +Timestamp scheduledAt
        +string name
        +string phone
        +string email
        +string model
        +Date preferredDate
        +string timeSlot
        +TestDriveStatus status
        +string notes
        +DateTime createdAt
        +DateTime updatedAt
    }

    class TestDriveStatus {
        <<enumeration>>
        PENDING
        CONFIRMED
        COMPLETED
        CANCELLED
        REJECTED
    }

    TestDrive --> TestDriveStatus
```

#### Contact Entity

```mermaid
classDiagram
    class Contact {
        +string id (UUID)
        +string name
        +string email
        +string phone
        +string subject
        +text message
        +boolean read
        +DateTime createdAt
    }
```

### 7.3 Complete Entity Relationship Diagram

```mermaid
erDiagram
    USER {
        uuid id PK
        string email UK
        string password
        string firstName
        string lastName
        string phone
        string address
        enum role
        timestamp createdAt
        timestamp updatedAt
    }

    CAR {
        uuid id PK
        string make
        string model
        integer year
        decimal price
        string slug UK
        string image
        text description
        jsonb specs
        string vin UK
        integer mileage
        string color
        string fuelType
        string transmission
        enum status
        timestamp createdAt
        timestamp updatedAt
    }

    NEWS {
        uuid id PK
        string slug UK
        string title
        text excerpt
        text content
        date date
        string image
        enum status
        timestamp createdAt
        timestamp updatedAt
    }

    TEST_DRIVE {
        uuid id PK
        uuid userId FK
        uuid carId FK
        timestamp scheduledAt
        string name
        string phone
        string email
        string model
        date preferredDate
        string timeSlot
        enum status
        string notes
        timestamp createdAt
        timestamp updatedAt
    }

    CONTACT {
        uuid id PK
        string name
        string email
        string phone
        string subject
        text message
        boolean read
        timestamp createdAt
    }

    USER ||--o{ TEST_DRIVE : "schedules"
    CAR ||--o{ TEST_DRIVE : "for"
```

---

## 8. API Endpoints Summary

### 8.1 Gateway Routes

| Controller  | Base Path              | Methods                                                       |
| ----------- | ---------------------- | ------------------------------------------------------------- |
| Auth        | `/api/auth`            | POST register, login, logout, forgot-password, reset-password |
| Customers   | `/api/customers`       | GET me, PATCH me, PATCH me/password                           |
| Cars        | `/api/cars`            | GET, POST, GET :id, PUT :id, DELETE :id                       |
| Cars        | `/api/cars/stats`      | GET (statistics)                                              |
| Cars        | `/api/cars/slug/:slug` | GET (by slug)                                                 |
| Cars        | `/api/cars/:id/image`  | POST (upload image)                                           |
| News        | `/api/news`            | GET, POST, GET :id, PUT :id, DELETE :id                       |
| News        | `/api/news/stats`      | GET (statistics)                                              |
| News        | `/api/news/slug/:slug` | GET (by slug)                                                 |
| News        | `/api/news/:id/image`  | POST (upload image)                                           |
| Test Drives | `/api/test-drives`     | GET, POST, GET :id, PATCH :id, DELETE :id                     |
| Contacts    | `/api/contacts`        | GET, POST, GET :id, PATCH :id, DELETE :id                     |
| Admin       | `/api/admin`           | GET dashboard                                                 |
| Health      | `/`                    | GET                                                           |

---

## 9. Infrastructure & Deployment

```mermaid
graph TB
    subgraph "Docker Network"
        LB[Load Balancer<br/>Nginx]

        subgraph "Application Services"
            FE[Frontend<br/>Next.js<br/>:3000]
            GW[API Gateway<br/>:3500]
        end

        subgraph "Backend Microservices"
            MS1[Auth<br/>:3501]
            MS2[Cars<br/>:3502]
            MS3[News<br/>:3503]
            MS4[Test Drives<br/>:3504]
            MS5[Contacts<br/>:3505]
            MS6[Admin<br/>:3506]
        end

        subgraph "Infrastructure"
            PG[PostgreSQL<br/>:5432]
            RMQ[RabbitMQ<br/>:5672]
        end

        LB --> FE
        LB --> GW
        GW --> RMQ
        RMQ --> MS1
        RMQ --> MS2
        RMQ --> MS3
        RMQ --> MS4
        RMQ --> MS5
        RMQ --> MS6

        MS1 --> PG
        MS2 --> PG
        MS3 --> PG
        MS4 --> PG
        MS5 --> PG
    end
```

---

## 10. Security Features

| Feature                   | Implementation                      |
| ------------------------- | ----------------------------------- |
| JWT Authentication        | Token-based with 7-day expiry       |
| Password Hashing          | bcrypt                              |
| Rate Limiting             | Throttler (10 req/sec, 100 req/min) |
| Role-based Access Control | GatewayRolesGuard                   |
| Input Validation          | class-validator DTOs                |
| Frontend Auth Guard       | Route protection component          |
| Session Storage           | Token in sessionStorage             |

---

## 11. UML Diagrams

### 11.1 System Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Web Browser]
        Mobile[Mobile App]
    end

    subgraph "CDN & Static Assets"
        CDN[CDN]
        Static[Static Files]
    end

    subgraph "Frontend Layer (Next.js)"
        NextJS[Next.js Server<br/>:3000]
        API_Client[Axios Client]
        Query[React Query]
    end

    subgraph "API Gateway (NestJS)"
        Gateway[API Gateway<br/>:3500]
        Middleware[Rate Limiter]
        Auth[Auth Middleware]
    end

    subgraph "Message Broker"
        RabbitMQ[RabbitMQ<br/>:5672]
    end

    subgraph "Microservices"
        Auth_MS[Auth Service<br/>:3501]
        Cars_MS[Cars Service<br/>:3502]
        News_MS[News Service<br/>:3503]
        TestDrive_MS[Test Drive<br/>:3504]
        Contacts_MS[Contacts<br/>:3505]
        Admin_MS[Admin Service<br/>:3506]
    end

    subgraph "Database Layer"
        PG[(PostgreSQL)]
    end

    Browser --> NextJS
    Mobile --> NextJS
    NextJS --> Static
    NextJS --> CDN

    NextJS --> API_Client
    API_Client --> Gateway

    Gateway --> Middleware
    Middleware --> Auth

    Auth --> RabbitMQ
    RabbitMQ --> Auth_MS
    RabbitMQ --> Cars_MS
    RabbitMQ --> News_MS
    RabbitMQ --> TestDrive_MS
    RabbitMQ --> Contacts_MS
    RabbitMQ --> Admin_MS

    Auth_MS --> PG
    Cars_MS --> PG
    News_MS --> PG
    TestDrive_MS --> PG
    Contacts_MS --> PG
```

### 11.2 Use Case Diagram

```mermaid
useCase
    actor "Guest" as Guest
    actor "Customer" as Customer
    actor "Staff" as Staff
    actor "Admin" as Admin

    package "Public Features" {
        UC1[View Cars]
        UC2[View Car Details]
        UC3[View News]
        UC4[View News Article]
        UC5[Contact Support]
        UC6[Request Test Drive]
    }

    package "Customer Features" {
        UC7[Register]
        UC8[Login]
        UC9[Manage Profile]
        UC10[Book Test Drive]
        UC11[View My Test Drives]
        UC12[Cancel Test Drive]
    }

    package "Staff Features" {
        UC13[Manage Cars]
        UC14[Manage News]
        UC15[Manage Test Drives]
        UC16[Manage Contacts]
    }

    package "Admin Features" {
        UC17[View Dashboard]
        UC18[Manage Users]
    }

    Guest --> UC1
    Guest --> UC2
    Guest --> UC3
    Guest --> UC4
    Guest --> UC5
    Guest --> UC6

    Customer --> UC7
    Customer --> UC8
    Customer --> UC9
    Customer --> UC10
    Customer --> UC11
    Customer --> UC12

    Staff --> UC1
    Staff --> UC2
    Staff --> UC3
    Staff --> UC4
    Staff --> UC5

    Admin --> UC13
    Admin --> UC14
    Admin --> UC15
    Admin --> UC16
    Admin --> UC17
    Admin --> UC18
```

### 11.3 Login Sequence Diagram

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant AuthContext
    participant API
    participant Gateway
    participant AuthService
    participant Database

    User->>Frontend: Enter credentials
    Frontend->>AuthContext: Call login()
    AuthContext->>API: POST /api/auth/login
    API->>Gateway: HTTP Request
    Gateway->>AuthService: RPC Call (RabbitMQ)
    AuthService->>Database: Query user
    Database-->>AuthService: User data
    AuthService->>AuthService: Validate password
    AuthService-->>Gateway: JWT Token
    Gateway-->>API: JWT Token
    API-->>AuthContext: Response
    AuthContext->>sessionStorage: Store token
    AuthContext->>Frontend: Set user state
    Frontend->>User: Redirect to dashboard
```

### 11.4 Book Test Drive Sequence Diagram

```mermaid
sequenceDiagram
    participant Customer
    participant Frontend
    participant TestDriveForm
    participant API
    participant Gateway
    participant TestDriveService
    participant Database
    participant EmailService

    Customer->>TestDriveForm: Fill form
    TestDriveForm->>API: POST /api/test-drives
    API->>Gateway: HTTP Request
    Gateway->>TestDriveService: RPC Call
    TestDriveService->>Database: Save test drive
    Database-->>TestDriveService: Confirmation
    TestDriveService->>EmailService: Send notification
    TestDriveService-->>Gateway: Created
    Gateway-->>API: Response
    API-->>TestDriveForm: Success
    TestDriveForm->>Customer: Show confirmation
```

### 11.5 Component Diagram (Frontend)

```mermaid
graph BT
    subgraph "Pages"
        P1[Home Page]
        P2[Cars Page]
        P3[Car Detail]
        P4[Admin Dashboard]
        P5[Customer Dashboard]
    end

    subgraph "Components"
        C1[Hero Section]
        C2[Car Grid]
        C3[Car Card]
        C4[Car Form]
        C5[Stats Cards]
        C6[Charts]
        C7[Test Drive Form]
        C8[Contact Form]
    end

    subgraph "State Management"
        S1[React Query]
        S2[Auth Context]
    end

    subgraph "API Layer"
        A1[Axios Instance]
        A2[API Hooks]
    end

    P1 --> C1
    P2 --> C2
    P2 --> C3
    P3 --> C3
    P4 --> C5
    P4 --> C6
    P4 --> C4
    P5 --> C7

    C2 --> S1
    C3 --> S1
    C4 --> S1
    C5 --> S1
    C7 --> S1

    S1 --> A2
    A2 --> A1
```

### 11.6 Database Schema Diagram

```mermaid
erDiagram

    USER ||--o{ TEST_DRIVE : "books"
    CAR ||--o{ TEST_DRIVE : "test_driven_by"

    USER {
        uuid id PK
        string email UK
        string password
        string firstName
        string lastName
        string phone
        string address
        string role
        timestamp createdAt
        timestamp updatedAt
    }

    CAR {
        uuid id PK
        string make
        string model
        integer year
        decimal price
        string slug UK
        string image
        text description
        jsonb specs
        string vin UK
        integer mileage
        string color
        string fuelType
        string transmission
        string status
        timestamp createdAt
        timestamp updatedAt
    }

    NEWS {
        uuid id PK
        string slug UK
        string title
        text excerpt
        text content
        date date
        string image
        string status
        timestamp createdAt
        timestamp updatedAt
    }

    TEST_DRIVE {
        uuid id PK
        uuid userId FK
        uuid carId FK
        timestamp scheduledAt
        string name
        string phone
        string email
        string model
        date preferredDate
        string timeSlot
        string status
        string notes
        timestamp createdAt
        timestamp updatedAt
    }

    CONTACT {
        uuid id PK
        string name
        string email
        string phone
        string subject
        text message
        boolean read
        timestamp createdAt
    }
```

### 11.7 State Machine Diagram (Test Drive)

```mermaid
stateDiagram-v2
    [*] --> PENDING: Created

    PENDING --> CONFIRMED: Staff confirms
    PENDING --> REJECTED: Staff rejects
    PENDING --> CANCELLED: Customer cancels

    CONFIRMED --> COMPLETED: Test drive completed
    CONFIRMED --> CANCELLED: Customer cancels

    REJECTED --> [*]
    COMPLETED --> [*]
    CANCELLED --> [*]
```

### 11.8 State Machine Diagram (Car Status)

```mermaid
stateDiagram-v2
    [*] --> AVAILABLE: Car added

    AVAILABLE --> RESERVED: Customer reserves
    AVAILABLE --> SOLD: Car sold
    AVAILABLE --> MAINTENANCE: Needs maintenance

    RESERVED --> SOLD: Sale completed
    RESERVED --> AVAILABLE: Reservation cancelled

    MAINTENANCE --> AVAILABLE: Maintenance done

    SOLD --> [*]
```

---

## 12. Summary

### 12.1 Project Summary

| Aspect            | Backend       | Frontend           |
| ----------------- | ------------- | ------------------ |
| **Architecture**  | Microservices | Next.js App Router |
| **Communication** | RabbitMQ RPC  | Axios              |
| **Framework**     | NestJS v11    | Next.js 16.1.6     |
| **Language**      | TypeScript    | TypeScript         |
| **Database**      | PostgreSQL    | N/A                |
| **ORM**           | TypeORM       | N/A                |

### 12.2 User Roles Summary

| Role         | Access Level | Description                 |
| ------------ | ------------ | --------------------------- |
| **ADMIN**    | Full         | Complete system access      |
| **STAFF**    | Medium       | Manage content and bookings |
| **CUSTOMER** | Limited      | Personal account access     |
| **GUEST**    | Public       | Browse and inquire          |

### 12.3 Core Features Summary

| Feature         | Frontend Page         | Backend Endpoint       |
| --------------- | --------------------- | ---------------------- |
| Car Catalog     | `/cars`               | `/api/cars`            |
| Car Details     | `/cars/:slug`         | `/api/cars/slug/:slug` |
| News            | `/actualites`         | `/api/news`            |
| Contact Form    | `/contact`            | `/api/contacts`        |
| Test Drive      | `/test-drive`         | `/api/test-drives`     |
| Admin Dashboard | `/admin/dashboard`    | `/api/admin`           |
| Customer Portal | `/customer/dashboard` | `/api/customers`       |

### 12.4 Enums Reference

#### UserRole

```typescript
enum UserRole {
  ADMIN = 'admin',
  STAFF = 'staff',
  CUSTOMER = 'customer',
}
```

#### TestDriveStatus

```typescript
enum TestDriveStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REJECTED = 'rejected',
}
```

#### NewsStatus

```typescript
enum NewsStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}
```

#### CarStatus

```typescript
enum CarStatus {
  AVAILABLE = 'available',
  SOLD = 'sold',
  RESERVED = 'reserved',
  MAINTENANCE = 'maintenance',
}
```

---

_Report generated for Baccouche Motors Application - Full Stack Review_
