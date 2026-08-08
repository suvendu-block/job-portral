# Job Portal

A full-stack job portal built with a Next.js frontend and an Express + MongoDB backend. The app supports job browsing, job posting, applications, and role-based dashboards for both seekers and recruiters.

## Stack

- Frontend: Next.js, React, Tailwind CSS
- Backend: Node.js, Express, MongoDB, Mongoose
- Auth: JWT stored in HTTP-only cookies
- Testing: Node.js built-in test runner + Supertest

## Features

- User registration and login
- Role-based access: seeker and recruiter
- Browse and search jobs
- View job details
- Recruiter dashboard to create and manage job listings
- Seeker dashboard to track applications
- Apply to jobs and update application status
- Protected API routes and JWT auth flow

## Project Structure

```text
job-portal/
├── backend/
│   ├── src/
│   ├── tests/
│   ├── scripts/
│   ├── .env.example (optional if present)
│   ├── package.json
│   └── ...
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
├── plan.md
├── README.md
└── .gitignore
```

## Prerequisites

Before running the app, make sure you have:

- Node.js 18+ installed
- MongoDB running locally or a MongoDB Atlas connection string
- A terminal open for both frontend and backend services

## Environment Setup

### Backend

Create a `.env` file inside the `backend` folder:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/job_portal
JWT_SECRET=your-super-secret-key
CLIENT_URL=http://localhost:3000
PORT=5000
```

If you use MongoDB Atlas, set:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/job_portal
```

### Frontend

Create a `.env.local` file inside the `frontend` folder:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Installation

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd frontend
npm install
```

## Running the App

Start the backend in one terminal:

```bash
cd backend
npm run dev
```

Start the frontend in another terminal:

```bash
cd frontend
npm run dev
```

Then open:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`

## Seed Demo Data

To populate the database with sample jobs and users:

```bash
cd backend
npm run seed
```

## API Overview

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Jobs

- `GET /api/jobs`
- `GET /api/jobs/:id`
- `POST /api/jobs` (recruiters only)
- `PUT /api/jobs/:id` (recruiters only)
- `DELETE /api/jobs/:id` (recruiters only)

### Applications

- `POST /api/jobs/:id/apply` (seekers only)
- `GET /api/applications/my` (seekers only)
- `GET /api/jobs/:id/applications` (recruiters only)
- `PATCH /api/applications/:applicationId/status` (recruiters only)

## Testing

Run backend tests:

```bash
cd backend
npm test
```

The project uses Node's built-in test runner and Supertest to validate HTTP behavior.

## Notes

- The backend uses JWT tokens stored in HTTP-only cookies for authentication.
- CORS is configured to allow requests from the frontend at `http://localhost:3000`.
- For production, update environment values and use a secure secret and production-safe MongoDB configuration.

## Common Troubleshooting

### Backend fails to start

Check that:

- your MongoDB URI is valid
- `.env` exists in `backend/`
- `JWT_SECRET` is set

### Frontend cannot reach backend

Check that:

- backend is running on port `5000`
- `NEXT_PUBLIC_API_URL` matches the backend URL
- CORS is configured correctly

### Login or auth issues

Check that:

- requests include cookies in the browser
- the frontend is using `credentials: "include"`
- the JWT secret is the same across app restarts

## License

This project is for learning and development purposes.
