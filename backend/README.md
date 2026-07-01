# Employee Skill Discovery Platform – Backend

## Project Overview

Employee Skill Discovery Platform is a backend system designed to centralize employee skill information and enable internal talent discovery.

The platform allows employees to maintain profiles and skills while enabling managers and organizational teams to discover talent using role-based search and filtering.

Current implementation focuses on secure authentication, employee skill management, role-based access control, and employee search functionality.

---

# Tech Stack

## Backend

* Node.js
* Express.js

## Database

* MongoDB
* Mongoose

## Authentication & Security

* JWT (JSON Web Token)
* bcryptjs

## Testing

* Thunder Client

---

# Implemented Features

## Authentication

* Register User
* Login User
* JWT Authentication
* Protected Routes
* Get Logged-in User

---

## Role-Based Access Control (RBAC)

Supported Roles:

* Employee
* Manager
* HR
* Learning & Development (L&D)

Permissions:

| Role     | Access                        |
| -------- | ----------------------------- |
| Employee | Manage own profile and skills |
| Manager  | Search employees              |
| HR       | Search employees              |
| L&D      | Search employees              |

Implemented:

* JWT verification middleware
* Role authorization middleware
* Access restriction for protected APIs

---

## Employee Profile

Features:

* Create Profile

Profile Data:

* Department
* Designation
* Location
* Education
* Career Interests

---

## Skill Management

Features:

* Add Skill
* View My Skills
* Update Skill
* Delete Skill

Skill Fields:

* Skill Name
* Category
* Proficiency Level
* Years of Experience
* Source
* Endorsement Count

Security:

* Users can update only their own skills
* Users can delete only their own skills

---

## Employee Search

Implemented Filters:

* Search by Skill
* Filter by Minimum Experience
* Filter by Proficiency Level

Supported Access:

* Manager
* HR
* L&D

Search Ranking:

Match Score =
Proficiency +
Years of Experience +
Endorsements +
Skill Source

---

# Current Architecture

Frontend (React)

↓

Backend APIs (Node.js + Express)

↓

MongoDB Database

↓

Future AI Resume Parsing Layer

---

# API Endpoints

## Authentication APIs

### Register User

POST

```http
/api/auth/register
```

### Login User

POST

```http
/api/auth/login
```

### Get Current User

GET

```http
/api/auth/me
```

---

## Profile APIs

### Create Profile

POST

```http
/api/profile
```

---

## Skill APIs

### Add Skill

POST

```http
/api/skills
```

### View My Skills

GET

```http
/api/skills
```

### Update Skill

PUT

```http
/api/skills/:id
```

### Delete Skill

DELETE

```http
/api/skills/:id
```

---

## Search APIs

### Search Employees

GET

```http
/api/search/employees
```

Examples:

```http
/api/search/employees?skill=React
```

```http
/api/search/employees?skill=React&minYears=2
```

```http
/api/search/employees?skill=React&proficiencyLevel=advanced
```

---

# Project Structure

```text
backend
│
├── config
├── controllers
│   ├── authController.js
│   ├── profileController.js
│   ├── skillController.js
│   └── searchController.js
│
├── middleware
│   └── authMiddleware.js
│
├── models
│   ├── User.js
│   ├── EmployeeProfile.js
│   └── Skill.js
│
├── routes
│   ├── authRoutes.js
│   ├── profileRoutes.js
│   ├── skillRoutes.js
│   └── searchRoutes.js
│
├── server.js
├── package.json
└── .env
```

---

# Setup Instructions

## Clone Repository

```bash
git clone REPOSITORY_LINK
```

---

## Move into Backend Folder

```bash
cd backend
```

---

## Install Dependencies

```bash
npm install
```

---

## Create Environment File

Create:

```text
.env
```

Add:

```env
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
```

---

## Run Backend

Development:

```bash
npm run dev
```

Production:

```bash
npm start
```

Server:

```text
http://localhost:5000
```

---

# Current Status

Completed:

* Authentication
* RBAC
* Employee Profile (Basic)
* Skill CRUD
* Ownership Validation
* Employee Search

Planned:

* Resume Upload
* AI Resume Parsing
* Analytics Dashboard
* Learning Recommendations
* Profile-Based Search

