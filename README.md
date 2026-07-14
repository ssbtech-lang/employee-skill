# Employee Skill Discovery Platform - Backend

## Overview

The **Employee Skill Discovery Platform** is a backend application that enables organizations to maintain a centralized repository of employee skills, certifications, profiles, and resume information. The platform helps discover employee expertise, supports advanced skill-based search, and assists Managers, HR, and Learning & Development teams in identifying suitable candidates for projects.

The backend is built using **Node.js**, **Express.js**, **MongoDB**, and integrates a **Python-based Resume Parser** for automatic skill extraction.

---

# Features

## Authentication & Authorization

- Employee Registration
- Employee Login
- JWT Authentication
- Protected Routes
- Role-Based Access Control (RBAC)

Supported Roles

- Employee
- Manager
- HR
- Learning & Development (L&D)

---

## Employee Profile Management

- Create Employee Profile
- View Employee Profile
- Update Employee Profile

Stores

- Department
- Designation
- Location
- Career Interests
- Education
- Experience
- Resume Metadata

---

## Skill Management

- Add Skills
- Update Skills
- Delete Skills
- View Employee Skills

Each skill stores

- Skill Name
- Category
- Proficiency Level
- Years of Experience
- Skill Source
- Endorsement Count

---

## Certification Management

Employees can manage professional certifications.

Features

- Add Certification
- View Certifications
- Update Certification
- Delete Certification

Stores

- Certification Name
- Issuing Organization
- Issue Date
- Expiry Date
- Credential ID
- Credential URL
- Verification Status
- Related Skills
- Source

---

## Resume Parser Integration

Supports

- PDF
- DOCX

Features

- Resume Upload
- Resume Parsing using Python
- Automatic Skill Extraction
- Resume Data Persistence
- Duplicate Skill Prevention
- Resume Metadata Storage

Extracts

- Name
- Email
- Skills
- Education
- Certifications
- Experience

---

## Employee Search

### Basic Search

Search employees using a single skill.

Features

- Skill Search
- Resume Skills
- Manual Skills
- Ranked Results

---

### Advanced Search

Supports multiple filters.

Available Filters

- Skills
- Department
- Designation
- Location
- Education
- Certification
- Minimum Experience
- Maximum Experience
- Minimum Proficiency

Supports

- Multi-skill Search
- Match Any
- Match All
- Pagination
- Ranked Results

---

## Employee Ranking

Search results are ranked using

```
Match Score

=

Skill Proficiency Score
+ Years of Experience
+ Endorsements
+ Resume Source Weight
```

Higher score indicates better employee suitability.

---

# Technology Stack

## Backend

- Node.js
- Express.js

## Database

- MongoDB
- Mongoose

## Authentication

- JWT
- bcryptjs

## File Upload

- Multer

## Resume Parsing

- Python
- spaCy
- pdfplumber
- python-docx

---

# Project Structure

```
backend
│
├── config
│   └── db.js
│
├── controllers
│   ├── authController.js
│   ├── profileController.js
│   ├── skillController.js
│   ├── certificationController.js
│   ├── resumeController.js
│   └── searchController.js
│
├── middleware
│   └── authMiddleware.js
│
├── models
│   ├── User.js
│   ├── EmployeeProfile.js
│   ├── Skill.js
│   └── Certification.js
│
├── routes
│   ├── authRoutes.js
│   ├── profileRoutes.js
│   ├── skillRoutes.js
│   ├── certificationRoutes.js
│   ├── resumeRoutes.js
│   └── searchRoutes.js
│
├── utils
│   └── searchUtils.js
│
├── uploads
│
├── resumeparser.py
├── aliases.json
├── skills.json
├── server.js
├── package.json
└── README.md
```

---

# Installation

Clone the repository

```bash
git clone <repository-url>
```

Navigate into the project

```bash
cd employee-skill-discovery-backend
```

Install Node.js dependencies

```bash
npm install
```

Install Python dependencies

```bash
pip install pdfplumber
pip install python-docx
pip install spacy
python -m spacy download en_core_web_sm
```

---

# Environment Variables

Create a `.env` file.

Example

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key
```

---

# Running the Backend

```bash
npm run dev
```

Server

```
http://localhost:5000
```

---

# Resume Parser

## Supported Formats

- PDF
- DOCX

## Parse Resume

```
POST /api/resume/parse-resume
```

Returns

- Employee Name
- Email
- Skills
- Education
- Experience
- Certifications

---

## Save Parsed Resume

```
POST /api/resume/save-parsed-resume
```

Stores

- Skills
- Education
- Certifications
- Experience
- Resume Status
- Resume Filename

Duplicate skills are automatically ignored.

---

# API Endpoints

---

## Authentication

### Register

```
POST /api/auth/register
```

### Login

```
POST /api/auth/login
```

### Get Logged-in User

```
GET /api/auth/me
```

---

## Profile

### Create Profile

```
POST /api/profile
```

### Get My Profile

```
GET /api/profile/me
```

### Get Profile by User ID

```
GET /api/profile/:userId
```

### Update My Profile

```
PUT /api/profile/me
```

---

## Skills

### Add Skill

```
POST /api/skills
```

### Get Skills

```
GET /api/skills
```

### Update Skill

```
PUT /api/skills/:id
```

### Delete Skill

```
DELETE /api/skills/:id
```

---

## Certifications

### Add Certification

```
POST /api/certifications
```

### Get Certifications

```
GET /api/certifications
```

### Update Certification

```
PUT /api/certifications/:id
```

### Delete Certification

```
DELETE /api/certifications/:id
```

---

## Resume

### Parse Resume

```
POST /api/resume/parse-resume
```

### Save Parsed Resume

```
POST /api/resume/save-parsed-resume
```

---

## Search

### Basic Search

```
GET /api/search?skill=React
```

Example

```
GET /api/search?skill=React
```

---

### Advanced Search

```
GET /api/search/advanced
```

Example

```
GET /api/search/advanced?skills=React,Node.js&matchMode=all&department=Engineering&minExperience=2&minProficiency=intermediate&page=1&limit=10
```

Supported Parameters

| Parameter | Description |
|------------|-------------|
| skills | Comma-separated skills |
| matchMode | any / all |
| department | Filter by department |
| designation | Filter by designation |
| location | Filter by location |
| education | Filter by education |
| certification | Filter by certification |
| minExperience | Minimum experience |
| maxExperience | Maximum experience |
| minProficiency | beginner/intermediate/advanced/expert |
| page | Page number |
| limit | Number of records per page |

---

# Ranking Logic

Employees are ranked using

```
Match Score

=

Proficiency Score
+ Years of Experience
+ Endorsements
+ Resume Source Bonus
```

Proficiency Mapping

| Level | Score |
|---------|------|
| Beginner | 1 |
| Intermediate | 2 |
| Advanced | 3 |
| Expert | 4 |

Resume Parsed Skills receive an additional ranking bonus.

---

# Error Handling

The backend handles

- Invalid Login
- Unauthorized Access
- Forbidden Access
- Invalid JWT
- Missing Resume
- Unsupported File Types
- Large File Uploads
- Parsing Errors
- MongoDB Errors
- Duplicate Skills
- Validation Errors

---

# Testing

Backend APIs were tested using

- Thunder Client
- Postman

Tested Modules

- Authentication
- Authorization
- Profile CRUD
- Skill CRUD
- Certification CRUD
- Resume Upload
- Resume Parsing
- Resume Persistence
- Basic Search
- Advanced Search
- Search Ranking
- Pagination
- Duplicate Prevention

---

# Deployment

Backend

- Render

Database

- MongoDB Atlas



