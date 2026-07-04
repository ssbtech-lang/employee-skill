# Employee Skill Discovery Platform - Backend

## Overview

The Employee Skill Discovery Platform is a backend application that enables organizations to maintain a centralized repository of employee skills, profiles, and resume information. The platform helps discover employee expertise, supports skill-based search, and assists managers and HR teams in identifying suitable candidates for projects.

This backend is built using **Node.js**, **Express.js**, **MongoDB**, and integrates a **Python-based Resume Parser** for automatic skill extraction.

---

## Features

### Authentication & Authorization

- Employee Registration
- Employee Login
- JWT Authentication
- Role-Based Access Control (RBAC)
  - Employee
  - Manager
  - HR
  - Learning & Development

---

### Employee Profile Management

- Create Employee Profile
- Update Employee Profile
- View Employee Profile
- Store:
  - Department
  - Designation
  - Location
  - Education
  - Career Interests

---

### Skill Management

- Add Skills
- Update Skills
- Delete Skills
- View Employee Skills
- Manual Skill Management

---

### Resume Parser Integration

- Upload Resume (PDF / DOCX)
- Resume Parsing using Python
- Automatic Skill Extraction
- Resume Data Persistence
- Duplicate Skill Prevention
- Resume Metadata Storage

---

### Employee Search

- Search Employees by Skill
- Search using Resume Skills
- Search using Manually Added Skills
- Ranking Based Search Results

Ranking Factors

- Skill Proficiency
- Years of Experience
- Skill Source
- Endorsements

---

### File Validation

- Supports:
  - PDF
  - DOCX

- File Size Validation
- Invalid File Type Handling
- Error Responses

---

## Technology Stack

### Backend

- Node.js
- Express.js

### Database

- MongoDB
- Mongoose

### Authentication

- JWT
- bcryptjs

### File Upload

- Multer

### Resume Parsing

- Python
- pdfplumber
- spaCy
- python-docx

---

## Project Structure

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
│   └── searchController.js
│
├── middleware
│   └── authMiddleware.js
│
├── models
│   ├── User.js
│   ├── Skill.js
│   └── EmployeeProfile.js
│
├── routes
│   ├── authRoutes.js
│   ├── profileRoutes.js
│   ├── skillRoutes.js
│   ├── resumeRoutes.js
│   └── searchRoutes.js
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

## Installation

Clone the repository

```bash
git clone <repository-url>
```

Navigate to project

```bash
cd employee-skill-discovery-backend
```

Install Node dependencies

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

## Environment Variables

Create a `.env` file.

Example:

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key
```

---

## Run the Backend

```bash
npm run dev
```

Server runs on

```
http://localhost:5000
```

---

## Resume Parser

Supported Formats

- PDF
- DOCX

Upload Endpoint

```
POST /api/resume/parse-resume
```

Returns

- Employee Name
- Email
- Skills
- Skill Source

---

## Resume Save API

Endpoint

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

## API Endpoints

### Authentication

```
POST /api/auth/register

POST /api/auth/login
```

---

### Profile

```
POST /api/profile

GET /api/profile/:userId

PUT /api/profile/:userId
```

---

### Skills

```
POST /api/skills

GET /api/skills

PUT /api/skills/:id

DELETE /api/skills/:id
```

---

### Resume

```
POST /api/resume/parse-resume

POST /api/resume/save-parsed-resume
```

---

### Search

```
GET /api/search?skill=React
```

---

## Resume Search Ranking

The employee ranking score is calculated using:

```
Match Score =
Proficiency Score
+ Years of Experience
+ Endorsements
+ Resume Source Weight
```

Higher score → Better ranking.

---

## Error Handling

The backend handles:

- Invalid Login
- Unauthorized Access
- Missing Resume
- Unsupported File Types
- Large File Uploads
- Parsing Errors
- MongoDB Errors
- Duplicate Skills

---

## Testing

Backend APIs were tested using:

- Postman

Tested Scenarios

- Authentication
- Profile CRUD
- Skill CRUD
- Resume Upload
- Resume Parsing
- MongoDB Persistence
- Employee Search
- Ranking
- Duplicate Prevention



This project is developed for educational and academic purposes.
