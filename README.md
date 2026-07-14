HEAD
# employee-skill
=======
# Employee Skill Discovery Platform – Backend

## Project Overview
Backend implementation for Employee Skill Discovery Platform.

This system helps employees maintain profiles and skills while enabling future employee discovery, analytics, and AI integration.

---

## Tech Stack

Backend:

* Node.js
* Express.js
* 
 AI / Parsing:

* Python
* spaCy
* pdfplumber
* python-docx

Database:

* MongoDB

Authentication:

* JWT
* bcrypt

Testing:

* Thunder Client

---

## Completed Features

### Authentication

* Register User
* Login User
* JWT Authentication
* Protected Routes

### Employee Profile

* Create Profile

### Skill Management

* Add Skill
* View Skills
* Update Skill
* Delete Skill

### Resume Parser
* Upload Resume (PDF/DOCX)
* Parse Resume using Python
* Extract Name
* Extract Email
* Extract Skills
* Normalize Skills using aliases
* Return Parsed JSON

---

## Current API Endpoints

Authentication:

POST /api/auth/register

POST /api/auth/login

GET /api/auth/me

Profile:

POST /api/profile

Skills:

POST /api/skills

GET /api/skills

PUT /api/skills/:id

DELETE /api/skills/:id

Resume:

POST /api/resume/parse-resume

---

## Setup Instructions

Clone repository:

git clone REPO_LINK

Move inside project:

cd backend

Install dependencies:

npm install

Install parser dependencies:

pip install pdfplumber python-docx spacy

Download spaCy model:

python -m spacy download en_core_web_sm

Create .env file:

PORT=5000

MONGO_URI=your_mongodb_connection

JWT_SECRET=your_secret

Run backend:

npm run dev
