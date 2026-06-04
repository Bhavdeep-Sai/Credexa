# Credexa - "Verify Before You Trust"

Credexa is a complete, production-ready, AI-powered scam, phishing, fraud, and misinformation detection platform. 

It is designed to inspect text messages, WhatsApp notifications, email alerts, links, screenshots, and audio voice notes, translating complex security indicators into simplified, color-coded safety metrics (Safe, Suspicious, Dangerous). 

It features a specialized accessibility layout (**Grandparent Mode**) for senior citizens, complete with text-to-speech feedback, alongside an **Admin Control Panel** for monitoring user logs, system configuration parameters, and stats.

---

## 🛠️ Technology Stack
- **Frontend Framework**: Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Framer Motion, Zustand, React Hook Form, Recharts, Lucide Icons, Axios, Zod.
- **Backend Core**: Next.js 16 Proxy and Serverless API Routes (No separate backend or FastAPI).
- **Database Layer**: MongoDB Atlas, Mongoose ODM.
- **Security Protocols**: HTTP-only JWT cookies, bcryptjs password hashes, custom memory rate-limiting, secure headers.
- **AI Core**: Google Gemini 1.5 Multimodal API (processing text, image Vision OCR, and speech Audio inline base64 data).

---

## 📂 Project Directory Structure

```text
credexa/
├── app/
│   ├── api/
│   │   ├── admin/
│   │   │   ├── logs/route.ts          # Retrieves administrative audit logs
│   │   │   ├── settings/route.ts      # Seeding and editing system configuration
│   │   │   ├── stats/route.ts         # User count, scan count, risk distribution
│   │   │   └── users/route.ts         # Promoting, listing, and deleting users
│   │   ├── analyze/
│   │   │   └── route.ts               # Executes scan and saves to MongoDB
│   │   ├── auth/
│   │   │   ├── login/route.ts         # Handles logins and returns JWT cookies
│   │   │   ├── logout/route.ts        # Clears authentication cookies
│   │   │   ├── me/route.ts            # Retrieves and updates profile details
│   │   │   └── register/route.ts      # Registers new users and returns cookies
│   │   └── history/
│   │       ├── [id]/route.ts          # Deletes or retrieves single scan reports
│   │       └── route.ts               # Paginated history search and filters
│   ├── about/page.tsx                 # About mission page
│   ├── admin/page.tsx                 # Administration interface
│   ├── analyze/page.tsx               # Main scanning terminal
│   ├── contact/page.tsx               # Zod-validated contact page
│   ├── dashboard/page.tsx             # Interactive dashboard with Recharts
│   ├── features/page.tsx              # Feature breakdown lists
│   ├── grandparent/page.tsx           # Accessible UI with Speech TTS
│   ├── history/page.tsx               # Paginated history log table
│   ├── login/page.tsx                 # Auth entry screen
│   ├── pricing/page.tsx               # Subscription comparison plans
│   ├── privacy/page.tsx               # Privacy guidelines
│   ├── register/page.tsx              # Auth creation screen
│   ├── terms/page.tsx                 # Service clauses
│   ├── globals.css                    # Color tokens and animations
│   ├── layout.tsx                     # Main wrapper with ToastProvider
│   ├── not-found.tsx                  # Custom 404 page
│   └── page.tsx                       # SaaS Landing page
├── components/
│   ├── ui/
│   │   └── Toast.tsx                  # Context provider for alerts
│   ├── Footer.tsx                     # Footer navigation
│   ├── LayoutWrapper.tsx              # Conditional layout display
│   └── Navbar.tsx                     # Top navigation & theme toggler
├── hooks/
│   └── useAuth.ts                     # Zustand store for user sessions
├── lib/
│   ├── auth.ts                        # Password hashing and token utilities
│   ├── db.ts                          # Mongoose connection singleton
│   ├── gemini.ts                      # Gemini SDK wrapper services
│   └── limiter.ts                     # In-memory sliding rate-limiter
├── models/
│   ├── AdminSettings.ts               # Maintenance, upload limits, prompts
│   ├── Analysis.ts                    # Scan results and AI summaries
│   ├── ScanHistory.ts                 # Searchable user scan items
│   ├── SystemLog.ts                   # Log of critical system actions
│   └── User.ts                        # Profile and credentials schema
├── types/
│   └── index.ts                       # Mongoose model interfaces
├── proxy.ts                           # Next.js Request Proxy (JWT Interceptor)
├── tsconfig.json                      # Type configuration settings
├── package.json                       # Core dependencies
└── README.md                          # Comprehensive documentation
```

---

## ⚙️ Setup & Configuration Guide

### 1. Prerequisites
- [Node.js](https://nodejs.org/) v20+ installed.
- [MongoDB Atlas](https://www.mongodb.com/atlas/database) account (or local MongoDB community server running).
- [Google AI Studio](https://aistudio.google.com/) account for a Gemini API key.

### 2. Environment Setup
Create a `.env.local` file in the root directory and specify the following parameters:

```env
# MongoDB Connection String
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/credexa?retryWrites=true&w=majority

# JWT Token sign secret key
JWT_SECRET=super_secret_session_token_key_change_in_production

# Google Gemini API key
GEMINI_API_KEY=AIzaSyD_your_valid_gemini_api_key_here
```

### 3. Installation
Install the project packages using peer-dependency legacy flags:
```bash
npm install --legacy-peer-deps
```

### 4. Running Locally
Start the development hot-reloaded server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📡 API Reference Documentation

### 🔓 Public Authentication Endpoints

#### `POST /api/auth/register`
Creates a new account and logs the user in.
- **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "securepassword123"
  }
  ```
- **Returns**: Secure HTTP-only cookie `token` and `201 Created` status with user profile.

#### `POST /api/auth/login`
Checks credentials and issues a JWT token.
- **Request Body**:
  ```json
  {
    "email": "jane@example.com",
    "password": "securepassword123"
  }
  ```
- **Returns**: Secure HTTP-only cookie `token` and `200 OK` status with user profile.

#### `POST /api/auth/logout`
Deletes the HTTP-only cookie.
- **Returns**: `200 OK` status.

---

### 🛡️ Scanning & Analysis

#### `POST /api/analyze`
Submits a scam check. Supports guests (rate-limited to 5/hour) and authenticated users.
- **Request Body**:
  - For **text** or **url**:
    ```json
    {
      "contentType": "text",
      "content": "Urgent alert: Call this number to verify your bank status."
    }
    ```
  - For **screenshot** or **voice**:
    ```json
    {
      "contentType": "screenshot",
      "content": "data:image/png;base64,iVBORw0KGgo...",
      "fileType": "image/png"
    }
    ```
- **Returns**:
  ```json
  {
    "success": true,
    "analysisId": "603d2153...",
    "contentType": "text",
    "result": {
      "riskLevel": "Dangerous",
      "confidence": 98.4,
      "category": "Bank Impersonation",
      "redFlags": ["Urgent tone", "Unofficial contact"],
      "explanation": "This is a scam message...",
      "recommendations": ["Do not reply", "Call official number"],
      "safeReply": "I will contact the support center directly."
    }
  }
  ```

---

### 🔒 Authenticated Routes (Requires JWT Cookie)

#### `GET /api/auth/me`
Retrieves current profile metadata.

#### `PUT /api/auth/me`
Edits profile details or changes passwords.

#### `GET /api/history`
Retrieves paginated scan history.
- **Query Filters**: `page`, `limit`, `search`, `riskLevel` (Safe/Suspicious/Dangerous), `contentType` (text/url/screenshot/voice).

#### `DELETE /api/history/[id]`
Deletes a single scan record.

---

### 👑 Admin Routes (Requires Admin Cookie)

#### `GET /api/admin/stats`
Returns system totals, category density, and historical scan timeline data.

#### `GET /api/admin/logs`
Lists recent audit entries.

#### `PUT /api/admin/settings`
Updates base Safety prompts, maximum upload sizes, and maintenance mode status.

---

## 🚀 Deployment Guide

### Deploying on Vercel

Credexa is configured to run out-of-the-box on Vercel:

1. **Push your code** to a GitHub, GitLab, or Bitbucket repository.
2. **Import the repository** into Vercel.
3. In **Project Settings**, add the Environment Variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `GEMINI_API_KEY`
4. Click **Deploy**. Vercel will build the Next.js frontend pages and mount all API paths to serverless cloud functions automatically.

### Running Tests
To run Jest unit checks:
```bash
npm run test
```
*Note: Test configurations run independently of MongoDB Atlas, verifying services and encryption algorithms with deterministic mock models.*
