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

The application follows a microservices architecture with an API Gateway pattern:

```
+------------------------------------------------------------------+
|                    API GATEWAY (Port 3500)                       |
|  +------------------------------------------------------------+  |
|  |  - Route Management                                        |  |
|  |  - Authentication Middleware                                |  |
|  |  - Rate Limiting (Throttler)                                |  |
|  |  - Health Check                                            |  |
|  |  - Proxy to Microservices (RabbitMQ)                       |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
                              |
                    RabbitMQ Message Broker
                              |
    +-----------+-----------+-----------+-----------+-----------+------+----+
    |  AUTH    |   CARS   |   NEWS   | TEST-DR  |CONTACTS  |  ADMIN   |
    | Service | Service  | Service  | Service  | Service |  Service |
    +---------+---------+---------+---------+---------+----------+
```

**Description:**

- **Frontend Layer**: Web Browser interacts with Next.js application
- **API Gateway**: NestJS Gateway on port 3500 handles routing and authentication
- **Message Broker**: RabbitMQ on port 5672 routes requests between services
- **Microservices**: Auth, Cars, News, Test Drives, Contacts, and Admin services
- **Database Layer**: PostgreSQL with polyglot persistence (separate databases per service)

### 2.2 Backend Microservices Architecture

**Components:**

- **Gateway**: Port 3500 - Entry point with rate limiting and auth
- **Auth Service**: Port 3501 - User authentication
- **Cars Service**: Port 3502 - Car inventory management
- **News Service**: Port 3503 - News/Blog management
- **Test Drives Service**: Port 3504 - Test drive scheduling
- **Contacts Service**: Port 3505 - Contact form submissions
- **Admin Service**: Port 3506 - Admin dashboard

### 2.3 Frontend Architecture

**Route Structure:**

- **Public Routes**: /, /about, /cars, /cars/[slug], /contact, /test-drive, /services, /actualites
- **Admin Routes (Protected)**: /admin/login, /admin/dashboard, /admin/cars, /admin/news, /admin/contacts, /admin/test-drives
- **Customer Routes (Protected)**: /customer/login, /customer/register, /customer/dashboard, /customer/profile, /customer/test-drives

---

## 3. Users & Roles

### 3.1 User Roles (from `libs/shared/src/constants.ts`)

| Role         | Description                                                                              |
| ------------ | ---------------------------------------------------------------------------------------- |
| **ADMIN**    | Full system access - can manage all entities, view dashboard, manage staff               |
| **STAFF**    | Limited admin access - can manage cars, test drives, contacts (no user management)       |
| **CUSTOMER** | Public user - can register, login, book test drives, submit contacts, manage own profile |

---

## 4. Use Cases by User Type

### 4.1 Anonymous/Guest Users (No Authentication)

| Use Case          | Endpoint            | Description                         |
| ----------------- | ------------------- | ----------------------------------- |
| View Cars         | GET /api/cars       | Browse available cars               |
| View Car Details  | GET /api/cars/:slug | View single car by slug             |
| View News         | GET /api/news       | Browse published news articles      |
| View News Details | GET /api/news/:slug | View single news by slug            |
| Contact           | POST /api/contacts  | Submit contact form (guest allowed) |
| Health Check      | GET /               | API health status                   |

### 4.2 CUSTOMER (Registered Users)

| Use Case            | Endpoint                         | Methods                |
| ------------------- | -------------------------------- | ---------------------- |
| Register            | POST /api/auth/register          | Create new account     |
| Login               | POST /api/auth/login             | Get JWT token          |
| Forgot Password     | POST /api/auth/forgot-password   | Request password reset |
| Reset Password      | POST /api/auth/reset-password    | Reset with token       |
| View Profile        | GET /api/customers/me            | Get own profile        |
| Update Profile      | PATCH /api/customers/me          | Update personal info   |
| Change Password     | PATCH /api/customers/me/password | Update password        |
| Schedule Test Drive | POST /api/test-drives            | Book a test drive      |
| View My Test Drives | GET /api/test-drives             | List own test drives   |
| Cancel Test Drive   | DELETE /api/test-drives/:id      | Cancel booking         |

### 4.3 STAFF (Dealership Staff)

| Use Case                  | Endpoint                   | Methods                  |
| ------------------------- | -------------------------- | ------------------------ |
| All CUSTOMER capabilities | -                          | Plus:                    |
| Create Car                | POST /api/cars             | Add new car to inventory |
| Update Car                | PUT /api/cars/:id          | Edit car details         |
| Delete Car                | DELETE /api/cars/:id       | Remove car               |
| Upload Car Image          | POST /api/cars/:id/image   | Upload car photo         |
| Create News               | POST /api/news             | Publish news article     |
| Update News               | PUT /api/news/:id          | Edit news                |
| Delete News               | DELETE /api/news/:id       | Remove news              |
| View Test Drives          | GET /api/test-drives       | View all bookings        |
| Update Test Drive Status  | PATCH /api/test-drives/:id | Confirm/reject/complete  |
| View Contacts             | GET /api/contacts          | View all contacts        |
| Update Contact            | PATCH /api/contacts/:id    | Mark as read             |

### 4.4 ADMIN (System Administrator)

| Use Case               | Endpoint       | Methods                |
| ---------------------- | -------------- | ---------------------- |
| All STAFF capabilities | -              | Plus:                  |
| Admin Dashboard        | GET /api/admin | View system statistics |

---

## 5. Frontend Analysis

### 5.1 Frontend Project Structure

```
baccouche-motors-frontend/
├── app/                          # Next.js App Router
│   ├── (public routes)
│   │   ├── page.tsx              # Home page
│   │   ├── about/page.tsx        # About page
│   │   ├── cars/page.tsx         # Cars listing
│   │   ├── cars/[slug]/page.tsx  # Car detail
│   │   ├── contact/page.tsx      # Contact page
│   │   ├── test-drive/page.tsx   # Test drive request
��   │   ├── services/page.tsx     # Services page
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
│   ├── ui/                    # shadcn/ui components
│   ├── admin/                 # Admin components
│   ├── customer/             # Customer components
│   ├── cars/                  # Car components
│   ├── home/                  # Homepage sections
│   ├── forms/                 # Form components
│   ├── layout/                # Layout components
│   ├── auth/                  # Auth components
│   └── shared/               # Shared components
├── lib/
│   ├── api/                   # API client & endpoints
│   ├── hooks/                 # React Query hooks
│   ├── auth-context.tsx       # Auth Context
│   ├── types/                 # TypeScript interfaces
│   └── utils.ts
├── cypress/                    # E2E tests
└── package.json
```

### 5.2 Frontend Routes

#### Public Routes

| Route              | Page               |
| ------------------ | ------------------ |
| /                  | Home page          |
| /about             | About page         |
| /cars              | Cars listing       |
| /cars/[slug]       | Car details        |
| /contact           | Contact form       |
| /test-drive        | Test drive request |
| /services          | Services page      |
| /actualites        | News listing       |
| /actualites/[slug] | News article       |

#### Admin Routes (Protected - Admin Role Required)

| Route                      | Page                |
| -------------------------- | ------------------- |
| /admin/login               | Admin login         |
| /admin or /admin/dashboard | Dashboard           |
| /admin/cars                | Car management      |
| /admin/cars/new            | Create car          |
| /admin/cars/edit/[id]      | Edit car            |
| /admin/news                | News management     |
| /admin/news/new            | Create news         |
| /admin/news/edit/[id]      | Edit news           |
| /admin/contacts            | Contact messages    |
| /admin/test-drives         | Test drive requests |

#### Customer Routes (Protected - Customer Role Required)

| Route                            | Page               |
| -------------------------------- | ------------------ |
| /customer/login                  | Customer login     |
| /customer/register               | Registration       |
| /customer/forgot-password        | Password recovery  |
| /customer or /customer/dashboard | Customer dashboard |
| /customer/profile                | Profile management |
| /customer/test-drives            | My test drives     |

### 5.3 Frontend Components

**UI Components (shadcn/ui):**

- Button, Input, Card, Dialog, Form, Data Table, Rich Text Editor

**Feature Components:**

- Car Card, Car Grid, Image Gallery, Test Drive Form, Contact Form, Stats Cards, Charts

**Layout Components:**

- Site Chrome, Header, Footer, Admin Layout, Customer Layout

**Auth Components:**

- Auth Guard, Auth Context

### 5.4 Data Flow Architecture

**Flow Description:**

1. User navigates to route
2. Page renders component
3. Component calls React Query hook
4. Hook makes HTTP Request via Axios
5. API Gateway processes request
6. Response updates cache
7. Component re-renders with data
8. User sees updated UI

### 5.5 Authentication Flow

**Auth Sequence:**

1. User loads app
2. AuthContext checks for token in sessionStorage
3. If token exists: validate via /api/auth/me
4. If valid: show protected content
5. If invalid: show public content
6. On login: POST credentials → receive JWT
7. Store in sessionStorage and redirect

---

## 6. Backend Analysis

### 6.1 Backend Project Structure

```
baccouche-motors-backend/
├── apps/
│   ├── gateway/              # API Gateway (entry point)
│   ├── auth/                 # Authentication microservice
│   ├── cars/                # Cars inventory microservice
│   ├── news/                # News/Blog microservice
│   ├── test-drives/         # Test drive scheduling
│   ├── contacts/           # Contact form microservice
│   ├── admin/              # Admin dashboard microservice
│   └── baccouchemotorsapi/ # Legacy (deprecated)
├── libs/shared/             # Shared library
│   └── src/
│       ├── guards/         # Auth guards
│       ├── decorators/     # Role decorators
│       ├── dto/           # Shared DTOs
│       ├── events/        # Events
│       ├── jwt/          # JWT utilities
│       ├── filters/       # Exception filters
│       └── constants.ts   # Enums
├── uploads/               # File uploads
├── scripts/             # Build scripts
└── docs/                # OpenAPI docs
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

- baccouche_auth - Users
- baccouche_cars - Car inventory
- baccouche_news - News articles
- baccouche_test_drives - Test drive bookings
- baccouche_contacts - Contact form submissions

### 7.2 Entity Definitions

#### User Entity

| Field     | Type     | Description            |
| --------- | -------- | ---------------------- |
| id        | UUID     | Primary key            |
| email     | String   | Unique email           |
| password  | String   | Hashed password        |
| firstName | String   | First name             |
| lastName  | String   | Last name              |
| phone     | String?  | Phone number           |
| address   | String?  | Address                |
| role      | Enum     | ADMIN, STAFF, CUSTOMER |
| createdAt | DateTime | Creation timestamp     |
| updatedAt | DateTime | Last update            |

#### Car Entity

| Field        | Type     | Description                            |
| ------------ | -------- | -------------------------------------- |
| id           | UUID     | Primary key                            |
| make         | String   | Car manufacturer                       |
| model        | String   | Car model                              |
| year         | Integer  | Manufacturing year                     |
| price        | Decimal  | Price                                  |
| slug         | String?  | URL slug (unique)                      |
| image        | String?  | Image URL                              |
| description  | Text?    | Description                            |
| specs        | JSONB?   | Technical specifications               |
| vin          | String?  | VIN number (unique)                    |
| mileage      | Integer? | Mileage                                |
| color        | String?  | Exterior color                         |
| fuelType     | String?  | Fuel type                              |
| transmission | String?  | Transmission type                      |
| status       | Enum     | AVAILABLE, SOLD, RESERVED, MAINTENANCE |
| createdAt    | DateTime | Creation timestamp                     |
| updatedAt    | DateTime | Last update                            |

#### News Entity

| Field     | Type     | Description             |
| --------- | -------- | ----------------------- |
| id        | UUID     | Primary key             |
| slug      | String   | URL slug (unique)       |
| title     | String   | News title              |
| excerpt   | Text     | Short summary           |
| content   | Text     | Full content (Markdown) |
| date      | Date     | Publication date        |
| image     | String?  | Featured image          |
| status    | Enum     | DRAFT, PUBLISHED        |
| createdAt | DateTime | Creation timestamp      |
| updatedAt | DateTime | Last update             |

#### TestDrive Entity

| Field         | Type       | Description                                        |
| ------------- | ---------- | -------------------------------------------------- |
| id            | UUID       | Primary key                                        |
| userId        | UUID?      | Customer ID (nullable for guests)                  |
| carId         | UUID?      | Car ID                                             |
| scheduledAt   | Timestamp? | Scheduled time                                     |
| name          | String?    | Guest name                                         |
| phone         | String?    | Guest phone                                        |
| email         | String?    | Guest email                                        |
| model         | String?    | Car model interested                               |
| preferredDate | Date?      | Preferred date                                     |
| timeSlot      | String?    | Preferred time slot                                |
| status        | Enum       | PENDING, CONFIRMED, COMPLETED, CANCELLED, REJECTED |
| notes         | String?    | Additional notes                                   |
| createdAt     | DateTime   | Creation timestamp                                 |
| updatedAt     | DateTime   | Last update                                        |

#### Contact Entity

| Field     | Type     | Description                  |
| --------- | -------- | ---------------------------- |
| id        | UUID     | Primary key                  |
| name      | String   | Submitter name               |
| email     | String   | Submitter email              |
| phone     | String?  | Submitter phone              |
| subject   | String   | Message subject              |
| message   | Text     | Message content              |
| read      | Boolean  | Read status (default: false) |
| createdAt | DateTime | Creation timestamp           |

### 7.3 Entity Relationships

```
USER 1 ----- 0..* TEST_DRIVE (books)
CAR 1 ----- 0..* TEST_DRIVE (test_driven_by)
```

---

## 8. API Endpoints Summary

### 8.1 Gateway Routes

| Controller  | Base Path            | Methods                                                       |
| ----------- | -------------------- | ------------------------------------------------------------- |
| Auth        | /api/auth            | POST register, login, logout, forgot-password, reset-password |
| Customers   | /api/customers       | GET me, PATCH me, PATCH me/password                           |
| Cars        | /api/cars            | GET, POST, GET :id, PUT :id, DELETE :id                       |
| Cars        | /api/cars/stats      | GET (statistics)                                              |
| Cars        | /api/cars/slug/:slug | GET (by slug)                                                 |
| Cars        | /api/cars/:id/image  | POST (upload image)                                           |
| News        | /api/news            | GET, POST, GET :id, PUT :id, DELETE :id                       |
| News        | /api/news/stats      | GET (statistics)                                              |
| News        | /api/news/slug/:slug | GET (by slug)                                                 |
| News        | /api/news/:id/image  | POST (upload image)                                           |
| Test Drives | /api/test-drives     | GET, POST, GET :id, PATCH :id, DELETE :id                     |
| Contacts    | /api/contacts        | GET, POST, GET :id, PATCH :id, DELETE :id                     |
| Admin       | /api/admin           | GET dashboard                                                 |
| Health      | /                    | GET                                                           |

---

## 9. Infrastructure & Deployment

### Infrastructure Diagram

```
+------------------------------------------------------------------+
|                        Docker Network                             |
+------------------------------------------------------------------+
|                                                                  |
|    +------------------+     +-------------------------------+      |
|    | Load Balancer    |     |     Application Services       |      |
|    | Nginx           |     |                               |      |
|    +------------------+     +-------------------------------+      |
|          |                         |                            |
|          v                         v                            |
|    +-----------+           +-------------+                     |
|    | Frontend  |           | API Gateway |                     |
|    | Next.js   |           | :3500        |                     |
|    | :3000     |           +-------------+                     |
|    +-----------+                 |                            |
|                                 v                            |
|                         +-------------+                       |
|                         | RabbitMQ   |                       |
|                         | :5672      |                       |
|                         +-------------+                       |
|                                |                             |
|     +--------+--------+--------+--------+--------+--------+    |
|     |        |        |        |        |        |        |    |
|     v        v        v        v        v        v        v    |
|  +-----+ +-----+ +-----+ +-----+ +-----+ +-----+              |
|  |Auth | |Cars | |News | |Test | |Cont | |Admin |              |
|  |:3501|:3502|:3503|:3504|:3505|:3506|              |
|  +-----+ +-----+ +-----+ +-----+ +-----+ +-----+              |
|     |        |        |        |        |        |                |
|     +--------+--------+--------+--------+--------+               |
|                      |                                        |
|                      v                                        |
|               +-------------+                                  |
|               | PostgreSQL |                                  |
|               | :5432      |                                  |
|               +-------------+                                  |
+------------------------------------------------------------------+
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

```
+------------------------------------------------------------------+
|                      CLIENT LAYER                                |
+------------------------------------------------------------------+
|  [Web Browser] ----> [Mobile App]                               |
+------------------------------------------------------------------+
                                |
                                v
+------------------------------------------------------------------+
|                 FRONTEND LAYER (Next.js)                         |
+------------------------------------------------------------------+
|  [Next.js Server :3000] <----> [React Query] <----> [Axios]      |
+------------------------------------------------------------------+
                                |
                                v
+------------------------------------------------------------------+
|                   API GATEWAY (NestJS)                          |
+------------------------------------------------------------------+
|  [Rate Limiter] <----> [Auth Middleware] <----> [RPC Proxy]    |
+------------------------------------------------------------------+
                                |
                                v
+------------------------------------------------------------------+
|                    MESSAGE BROKER                               |
+------------------------------------------------------------------+
|                      [RabbitMQ :5672]                           |
+------------------------------------------------------------------+
                                |
        +---------------+---------------+---------------+
        v               v               v               v
+----------+    +----------+    +----------+    +----------+
| Auth     |    | Cars     |    | News     |    | Test    |
| Service  |    | Service  |    | Service  |    | Drives  |
| :3501    |    | :3502    |    | :3503    |    | :3504   |
+----------+    +----------+    +----------+    +----------+
        |               |               |               |
        +---------------+---------------+---------------+
                                |
                                v
+------------------------------------------------------------------+
|                    DATABASE LAYER                              |
+------------------------------------------------------------------+
|                   [PostgreSQL :5432]                            |
+------------------------------------------------------------------+
```

### 11.2 Use Case Diagram

```
+------------------------------------------------------------------+
|                       ACTORS                                     |
+------------------------------------------------------------------+
|  +---------+  +----------+  +--------+  +-------+                |
|  | GUEST   |  |CUSTOMER  |  | STAFF  |  | ADMIN |                |
|  +---------+  +----------+  +--------+  +-------+                |
+------------------------------------------------------------------+
         |              |            |           |
         v              v            v           v
+------------------------------------------------------------------+
|                    USE CASES                                     |
+------------------------------------------------------------------+
|  PUBLIC FEATURES:                                               |
|    - View Cars                                                  |
|    - View Car Details                                          |
|    - View News                                                 |
|    - Contact Support                                           |
|    - Request Test Drive                                        |
+------------------------------------------------------------------+
|  CUSTOMER FEATURES: (Guest +)                                  |
|    - Register                                                  |
|    - Login                                                    |
|    - Manage Profile                                           |
|    - Book Test Drive                                          |
|    - View My Test Drives                                       |
+------------------------------------------------------------------+
|  STAFF FEATURES: (Customer +)                                  |
|    - Manage Cars                                               |
|    - Manage News                                               |
|    - Manage Test Drives                                        |
|    - Manage Contacts                                           |
+------------------------------------------------------------------+
|  ADMIN FEATURES: (Staff +)                                     |
|    - View Dashboard                                            |
|    - Manage Users                                              |
+------------------------------------------------------------------+
```

### 11.3 Login Sequence Diagram

```
+------------------------------------------------------------------+
|                     LOGIN SEQUENCE                              |
+------------------------------------------------------------------+
|                                                                  |
|  [User]     [Frontend]   [AuthContext]   [API]   [Gateway]     |
|    |            |            |           |         |              |
|    |----submit credentials---->|         |         |              |
|    |            |            |           |         |              |
|    |            |--login()--> |           |         |              |
|    |            |            |           |         |              |
|    |            |            |--POST /api/auth/login->         |
|    |            |            |           |         |              |
|    |            |            |           |--HTTP Request->        |
|    |            |            |           |         |              |
|    |            |            |           |--RPC Call--> [Auth    |
|    |            |            |           |         |    Service] |
|    |            |            |           |         |         |      |
|    |            |            |           |<--Query user--|       |
|    |            |            |           |         |         |      |
|    |            |            |           |<--Validate--|        |
|    |            |            |           |         |         |      |
|    |            |            |           |<- JWT Token --|        |
|    |            |            |           |         |              |
|    |            |            |<--JWT Token---          |         |
|    |            |            |           |                      |
|    |            |<-store token->|        |                      |
|    |            |            |          |                      |
|    |--redirect to dashboard-->|        |                      |
|                                                                  |
+------------------------------------------------------------------+
```

### 11.4 Book Test Drive Sequence Diagram

```
+------------------------------------------------------------------+
|                BOOK TEST DRIVE SEQUENCE                       |
+------------------------------------------------------------------+
|                                                                   |
|  [Customer] [TestDriveForm]  [API]   [Gateway]  [TestDrive]    |
|    |            |            |         |         |   Service   |
|    |----fill form----------> |         |         |              |
|    |            |            |         |         |              |
|    |            |--POST /api/test-drives->         |
|    |            |            |         |         |              |
|    |            |            |--HTTP Request->              |
|    |            |            |         |         |              |
|    |            |            |         |--RPC Call-->          |
|    |            |            |         |    Service         |
|    |            |            |         |         |              |
|    |            |            |         |--Save to DB->        |
|    |            |            |         |         |              |
|    |            |            |         |<--Confirmed--       |
|    |            |            |         |         |              |
|    |            |            |         |<-Created--            |
|    |            |            |         |                      |
|    |            |<--Success---         |                      |
|    |<--display confirmation----->|                      |
|                                                                   |
+------------------------------------------------------------------+
```

### 11.5 State Machine Diagram - Test Drive

```
+------------------------------------------------------------------+
|                TEST DRIVE STATUS FLOW                           |
+------------------------------------------------------------------+
|                                                                   |
|                    +-----------+                                |
|                    |  PENDING  |                                |
|                    +-----------+                                |
|                        |                                        |
|       +----------------+-------------------+                     |
|       |                |                   |                     |
|       v                v                   v                     |
|  +----------+    +-----------+    +-----------+                  |
|  |CONFIRMED|    | REJECTED  |    | CANCELLED |                  |
|  +----------+    +-----------+    +-----------+                  |
|       |                |                   |                     |
|       |                v                   v                     |
|       |          +-----------+    +-----------+                  |
|       +--------> | COMPLETED|<----+ CANCELLED |                  |
|              +-----------+    +-----------+                  |
|                                                                   |
|  Transitions:                                                  |
|  - Created → PENDING                                          |
|  - PENDING → CONFIRMED (Staff confirms)                        |
|  - PENDING → REJECTED (Staff rejects)                         |
|  - PENDING → CANCELLED (Customer cancels)                     |
|  - CONFIRMED → COMPLETED (Test drive completed)              |
|  - CONFIRMED → CANCELLED (Customer cancels)                |
|                                                                   |
+------------------------------------------------------------------+
```

### 11.6 State Machine Diagram - Car Status

```
+------------------------------------------------------------------+
|                   CAR STATUS FLOW                              |
+------------------------------------------------------------------+
|                                                                   |
|                    +-----------+                                |
|                    | AVAILABLE |                                |
|                    +-----------+                                |
|                        |                                        |
|       +----------------+-------------------+                     |
|       |                |                   |                     |
|       v                v                   v                     |
|  +----------+    +-----------+    +-----------+                  |
|  |RESERVED   |    |   SOLD    |    |MAINTENANCE|                  |
|  +----------+    +-----------+    +-----------+                  |
|       |                |                   |                     |
|       |                v                   v                     |
|       |          +-----------+    +-----------+                  |
|       +--------> |   SOLD    |<---+ AVAILABLE |                  |
|              +-----------+    +-----------+                  |
|                                                                   |
|  Transitions:                                                  |
|  - Car added → AVAILABLE                                       |
|  - AVAILABLE → RESERVED (Customer reserves)                   |
|  - AVAILABLE → SOLD (Car sold)                                 |
|  - AVAILABLE → MAINTENANCE (Needs maintenance)                 |
|  - RESERVED → SOLD (Sale completed)                            |
|  - RESERVED → AVAILABLE (Reservation cancelled)            |
|  - MAINTENANCE → AVAILABLE (Maintenance done)              |
|                                                                   |
+------------------------------------------------------------------+
```

---

## 12. Summary

### 12.1 Project Summary

| Aspect        | Backend       | Frontend           |
| ------------- | ------------- | ------------------ |
| Architecture  | Microservices | Next.js App Router |
| Communication | RabbitMQ RPC  | Axios              |
| Framework     | NestJS v11    | Next.js 16.1.6     |
| Language      | TypeScript    | TypeScript         |
| Database      | PostgreSQL    | N/A                |
| ORM           | TypeORM       | N/A                |

### 12.2 User Roles Summary

| Role     | Access Level | Description                 |
| -------- | ------------ | --------------------------- |
| ADMIN    | Full         | Complete system access      |
| STAFF    | Medium       | Manage content and bookings |
| CUSTOMER | Limited      | Personal account access     |
| GUEST    | Public       | Browse and inquire          |

### 12.3 Core Features Summary

| Feature         | Frontend Page       | Backend Endpoint     |
| --------------- | ------------------- | -------------------- |
| Car Catalog     | /cars               | /api/cars            |
| Car Details     | /cars/:slug         | /api/cars/slug/:slug |
| News            | /actualites         | /api/news            |
| Contact Form    | /contact            | /api/contacts        |
| Test Drive      | /test-drive         | /api/test-drives     |
| Admin Dashboard | /admin/dashboard    | /api/admin           |
| Customer Portal | /customer/dashboard | /api/customers       |

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
