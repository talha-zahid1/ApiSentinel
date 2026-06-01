# ApiSentinel Frontend

A premium, production-ready developer dashboard for **ApiSentinel**, an API Key Management Service. Inspired by modern developer-tool platforms like Vercel, Stripe, and Railway.

Built using:
- **React 19** & **Vite**
- **Tailwind CSS v4** (Dark Theme by default)
- **React Router v6**
- **Axios** (with automatic JWT refreshing interceptors)
- **Recharts** (responsive statistics analytics graphs)
- **Lucide React** (high-quality UI iconography)

---

## Project Folder Structure

The project code is structured following modular frontend design practices:

```text
apisentinel-frontend/
├── dist/                     # Static production bundle outputs
├── src/
│   ├── main.jsx              # App DOM attachment point
│   ├── App.jsx               # Navigation router configuration
│   ├── index.css             # Tailwind v4 imports, global styles, scrollbars, keyframe animations
│   ├── components/
│   │   ├── ProtectedRoute.jsx # Guard blocking unauthenticated views
│   │   └── ui/               # Modular UI component library
│   │       ├── Button.jsx    # Action controls with loading overlays
│   │       ├── Input.jsx     # Glowing text/pass inputs with errors
│   │       ├── Card.jsx      # Glassmorphic display containers
│   │       ├── Modal.jsx     # Backdrop-blurred confirmation dialogs
│   │       ├── Badge.jsx     # Active, Revoked, Expired tags
│   │       └── Toast.jsx     # Notification alerts manager & context
│   ├── layouts/
│   │   └── DashboardLayout.jsx # Persistent side-navbar with mobile drawer overlays
│   ├── pages/
│   │   ├── Login.jsx         # Sign-in validation inputs
│   │   ├── Register.jsx      # Account creation inputs
│   │   ├── Dashboard.jsx     # Key creation, Warning banner, Copy board, Revoke/Rotate triggers
│   │   ├── Analytics.jsx     # Interactive Recharts graphs & statistics
│   │   └── ApiTester.jsx     # Request log simulator & response viewer
│   ├── services/
│   │   └── api.js            # Axios settings & Bearer/refresh interceptors
│   └── contexts/
│       ├── AuthContext.jsx   # Register/login JWT localStorage persistence
│       └── ApiKeyContext.jsx # Session-bound API Key manager (metadata saved, raw key in memory)
```

---

## Setup & Running Locally

### 1. Prerequisites
- **Node.js**: v18+ is recommended
- **npm** or **yarn**

### 2. Installation Steps
1. Navigate to the project root folder:
   ```bash
   cd apisentinel-frontend
   ```
2. Install all required package dependencies:
   ```bash
   npm install
   ```

### 3. Configuration
The application relies on an environment variable for the backend endpoint. A `.env` file has been created in the root directory:
```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```
API services dynamically consume this variable using `import.meta.env.VITE_API_BASE_URL`.

### 4. Running the Development Server
Start the local Vite server:
```bash
npm run dev
```
The server will boot up (typically at `http://localhost:5173`). Open this URL in your web browser.

---

## Production Build & Bundling

To generate a highly optimized static bundle for production deployment:
```bash
npm run build
```
This compile step uses Vite and Rolldown/Rollup to minify stylesheets and bundle React assets into the `dist/` directory.

### Previewing the Production Build
To spin up a local preview server serving the production `dist/` bundle:
```bash
npm run preview
```

---

## Deployment Instructions

### Deploying to Vercel
Vercel supports Vite SPAs natively out-of-the-box. You can deploy either via GitHub Integration or the Vercel CLI:

#### Option A: GitHub Integration (Recommended)
1. Commit the project to a GitHub repository.
2. Log into the [Vercel Dashboard](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. In the **Build & Development Settings**:
   - **Framework Preset**: `Vite` (automatically detected)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. In **Environment Variables**, add:
   - Name: `VITE_API_BASE_URL`
   - Value: `<your_production_backend_url>`
6. Click **Deploy**. Vercel will automatically trigger a build and assign a domain name.

#### Option B: Vercel CLI
If you prefer terminal-based deployment:
1. Install Vercel CLI globally:
   ```bash
   npm install -g vercel
   ```
2. Run the deployment command in the project directory:
   ```bash
   vercel
   ```
3. Follow the CLI prompts to configure the project settings.
4. Set the environment variable `VITE_API_BASE_URL` when prompted, or configure it in your Vercel settings panel.
5. Deploy to production:
   ```bash
   vercel --prod
   ```

---

## Architecture details

### JWT Authentication Interceptors
Axios interceptors automatically manage tokens stored in `localStorage`. 
- Every outgoing request is intercepted and injected with `Authorization: Bearer <access_token>` in its headers.
- If the request fails with a `401 Unauthorized` status (due to token expiration), the response interceptor temporarily pauses request lines, requests a new access token via `POST /ApiSentinel/api/token/refresh/`, updates the stored token, updates headers, and automatically retries the original request line.
- If the refresh token is expired or invalid, the interceptor automatically clears browser storage, redirects the user to the Login page, and flashes a warning toast.

### Safe API Key State Management
For security compliance:
- The **raw API key** generated or rotated is stored **only in memory** inside `ApiKeyContext` state. It is never written to `localStorage` or `sessionStorage`.
- Key metadata (such as Key Prefix, App Name, Expiry Date, and Revocation Status) is stored in `localStorage` so that the user's dashboard view persists across browser page refreshes.
- After a page refresh, the raw key is cleared from memory. The UI detects this state and displays a warning note explaining that actions requiring the raw key (Rotate, Revoke) are disabled for safety, prompting them to generate a new key if needed.
