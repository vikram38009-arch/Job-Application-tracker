# 💼 JobTracker — Unified Full-Stack Application Tracker

**JobTracker** is a visual and analytics-first job application tracking suite. It is designed to replace cluttered spreadsheets with a structured CRM pipeline, enabling candidates to organize their target roles, track interviewing timelines, and execute AI-powered resume tailoring analysis.

Built as a robust full-stack solution, **JobTracker** integrates a responsive **React (Vite) + Tailwind CSS** frontend with a high-performance **Django REST Framework** backend backed by a relational **PostgreSQL** database.

---

## ✨ Primary Features

### 1. Unified CRM Pipeline & Status Board
- **Workflows**: Move candidate applications smoothly through interactive pipeline columns (`WISHLIST`, `APPLIED`, `INTERVIEW`, `OFFERED`, `REJECTED`).
- **Granular Meta-Data**: Track company name, exact target role title, application touchpoint/sources (e.g., LinkedIn, Referral, Indeed), submission date, and structured contextual notes.
- **Transactional Consistency**: All changes immediately persist to the secure relational database backend, protecting your application history from data loss.

### 2. High-Fidelity Analytics Dashboard
- **Progress Tracking**: Responsive visual progress metrics highlighting conversion rates, high-priority stages, and historical progress.
- **Recharts Visualizations**: Interactive visual representations of job applications across different roles, companies, pipelines, and submission sources.
- **Quick-Filters**: Instant filter bars for swift keyword queries, status breakdowns, and date ranges.

### 3. Integrated Candidate Authentication & Key Security
- **JWT Authentication Flow**: Fully secure JWT authentication system utilizing continuous Access and Refresh token rotational protocols.
- **Secure Access Control**: Protect user-specific pipelines so that candidates only see their authorized application dataset.

### 4. 📄 Client-Side Resume Extraction & Upload Suite *(New Feature)*
- **Drag-And-Drop Support**: A dedicated client-side dropspace matching high-fidelity interactive standards. Drag and drop file formats or search local file managers with responsive state triggers.
- **Multiple Document Parsing**:
  - **PDF Extraction**: Extracts text layers using client-side asynchronous worker execution with `pdfjs-dist` (completely offline, high security).
  - **DOCX Extraction**: Parses XML-based `.docx` files on-the-fly using `mammoth.js` structures.
  - **Text-Based Documents**: Handlers for `.txt`, `.md`, and standard JSON structures.
- **AI Matching & Deep Tailoring**: Direct matching of extracted resume copies against targeted Job Descriptions to provide structured performance matrices, keyword gaps, and alignment indicators.

---

## 🛠️ Technological Architecture

```
                      +-----------------------------+
                      |         Web Client          |
                      |  - React 19 + TypeScript    |
                      |  - Vite, Tailwind CSS       |
                      |  - Recharts, Motion         |
                      |  - Client-side PDF/DOCX     |
                      +--------------+--------------+
                                     |
                                     | (JWT Bearer Token REST APIs)
                                     v
                      +-----------------------------+
                      |       Django Backend        |
                      |  - Django REST Framework    |
                      |  - JWT token management     |
                      |  - Application APIs         |
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      |     Relational Database     |
                      |  - PostgreSQL Database       |
                      +-----------------------------+
```

---

## 🚀 Getting Started (Local Development)

### 📂 Directory Overview
- `/backend`: The Django REST Framework service. Includes custom route handlers, authentication models (`User`), and transactional database serializers.
- `/src`: The React components, custom layout managers, Recharts graphs, and file-parsing suites.
- `/public`: Static web assets, fallback scripts, and UI helpers.

---

### Step 1: Configure Environment Variables

Create your local `.env` configuration file based on the provided sample template:

```bash
cp .env.example .env
```

Define the configuration keys securely:
- `GEMINI_API_KEY`: API Key needed for executing smart job matching and tailoring algorithms.
- `DATABASE_URL`: Connection string connecting to your local or host PostgreSQL database instance.

---

### Step 2: Launch Backend Service (Django)

1. **Activate Virtual Environment**:
   ```bash
   # Windows PowerShell
   .\venv\Scripts\Activate.ps1
   
   # Unix/macOS
   source venv/bin/activate
   ```

2. **Navigate and Install Dependencies**:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Verify Database Migrations**:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

4. **Boot Up Dev Server**:
   ```bash
   python manage.py runserver 8000
   ```
   The backend endpoints will now accept request queries on `http://127.0.0.1:8000/`.

---

### Step 3: Launch Front-End Client (React + Vite)

1. **Return to Workspace Root**:
   ```bash
   cd ..
   ```

2. **Install Asset Packages**:
   ```bash
   npm install
   ```

3. **Execute Compiler and Dev Server**:
   ```bash
   npm run dev
   ```
   Vite will serve the visual client application directly over port `3000`. Open `http://localhost:3000` in your web browser.

---

## 🔍 Module-Level Inspection

### Client-Side Engine Configuration (`/src/components/AIAnalysisModal.tsx`)
This interface manages document upload state and coordinates extracting texts cleanly before routing payload packages to our AI processing models:
- Dynamic script-injection triggers:
  ```typescript
  const pdfjsLib = await loadExternalScript('pdfjsLib', 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js');
  const mammoth = await loadExternalScript('mammoth', 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js');
  ```
- Drag-and-drop event management blocks keeping visual elements synchronized elegantly based on UI activity hooks.

### Back-End Route Map (`/backend/jobtracker`)
- `models.py`: Custom database schema mapped to secure candidate users. It holds structure, application date indices, current stages, and candidate notes safely.
- `serializers.py`: Marshals objects into lightweight JSON transfers.
- `views.py`: API endpoints supporting creation, retrieval, updates, and deletes (CRUD).

---

## 🔒 Security Practices
- **Token Isolation**: Strictly preserves continuous Bearer tokens dynamically within high-speed client memory storage wrappers.
- **Client-Side Parsing Safety**: Extracts and manages resume text in the secure web client environment. No intermediate server storage or remote scraping is required.
- **CORS Constraints**: Explicitly structured around whitelist setups, preventing remote attackers from initiating cross-origin attacks.
