# Job Portal — Build Plan

**Stack:** Next.js (App Router, JS + Tailwind) frontend · Express + Mongoose backend · MongoDB Atlas · JWT auth in httpOnly cookies (learning-focused, fully commented code)

## Phase 1 — Backend scaffolding (`backend/`)
- `npm init`, install: `express mongoose dotenv cors bcryptjs jsonwebtoken cookie-parser`
- `src/server.js` + `src/config/db.js` — connection to Atlas via `.env` (with a `MONGODB_URI` placeholder and setup instructions)
- CORS config (`origin: http://localhost:3000`, `credentials: true`) — includes a note explaining same-site cookies work on localhost cross-port

## Phase 2 — Models & Auth
- `src/models/`: **User** (`role: seeker|recruiter`, hashed password), **Job**, **Application**
- `src/routes/auth.js`: `POST /register`, `POST /login`, `POST /logout`, `GET /me`
- JWT in httpOnly cookie (7d expiry), `bcryptjs` hashing, `middleware/auth.js` for protected routes

## Phase 3 — Jobs & Applications API
- `POST/GET /api/jobs`, `GET /api/jobs/:id`, `DELETE /api/jobs/:id` (recruiters own their posts)
- Search: `?q=&location=&type=` with MongoDB `$regex`/filters
- `src/routes/applications.js`: apply (with resume text upload), view my applications (seeker), view/update applicants (recruiter)

## Phase 4 — Frontend scaffolding (`frontend/`)
- `create-next-app` (App Router, Tailwind), `src/lib/api.js` fetch wrapper (`credentials: 'include'`, error handling), `src/context/AuthContext.jsx`

## Phase 5 — Frontend pages
- Landing → Login/Register forms (redirect by role)
- **Jobs browse** with search bar + filters → Job detail (apply button)
- **Recruiter dashboard**: post job, manage own jobs, see applicants, update statuses
- **Seeker dashboard**: my applications with status tracking

## Phase 6 — Verify & docs
- Test API with curl (register → login → cookie → create job → apply)
- End-to-end browser test of all flows, `README.md` with step-by-step run instructions

**Build order note:** Phases are followed top-to-bottom; each API route is tested before moving to the UI so each layer is learned in isolation. 

