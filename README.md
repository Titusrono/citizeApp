# CitizenConnect Monorepo

This is a monorepo containing both the frontend (UI) and backend (API) applications for the CitizenConnect platform.

## 📁 Project Structure

```
citizeApp/
├── api/              # Backend application
├── ui/               # Frontend application
├── package.json      # Root package.json with workspace configuration
└── README.md         # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

Install all dependencies for both projects:

```bash
npm install
```

This will install dependencies for the root workspace and all sub-projects (api and ui).

## 🛠️ Available Scripts

### Development

```bash
# Run both api and ui in development mode concurrently
npm run dev

# Run only the API
npm run dev:api

# Run only the UI
npm run dev:ui
```

### Build

```bash
# Build both projects
npm run build

# Build only the API
npm run build:api

# Build only the UI
npm run build:ui
```

### Testing

```bash
# Run tests for all projects
npm run test

# Run tests for API only
npm run test:api

# Run tests for UI only
npm run test:ui
```

### Clean

```bash
# Clean all node_modules
npm run clean
```

## 📦 Workspace Management

This monorepo uses npm workspaces. You can run commands in specific workspaces using:

```bash
# Run a command in a specific workspace
npm run <script> --workspace=<workspace-name>

# Example: Start the UI project
npm run start --workspace=ui

# Install a package in a specific workspace
npm install <package-name> --workspace=<workspace-name>

# Example: Install axios in the API workspace
npm install axios --workspace=api
```

## 🏗️ Project Details

### UI (Frontend)
- **Location**: `./ui`
- **Framework**: Angular 19.x
- **Port**: Default Angular port (4200)
- **Tech Stack**: Angular, TypeScript, TailwindCSS, RxJS

### API (Backend)
- **Location**: `./api`
- **Framework**: Angular (or your backend framework)
- **Tech Stack**: TypeScript, Angular

## 📝 Notes

- Each workspace maintains its own dependencies
- Shared dependencies can be hoisted to the root level
- Use workspace-specific commands when you need to work on individual projects

## 🤝 Contributing

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a feature branch
4. Make your changes
5. Test your changes: `npm run test`
6. Build to ensure no errors: `npm run build`
7. Submit a pull request

## � Deployment to Vercel

This project is configured for deployment on Vercel. The frontend and backend are deployed as separate projects.

### Prerequisites
- Vercel account (https://vercel.com)
- Vercel CLI installed: `npm install -g vercel`

### Deploy Backend (API)

1. Navigate to the API directory:
   ```bash
   cd api
   ```

2. Deploy to Vercel:
   ```bash
   vercel
   ```

3. Set environment variables in Vercel dashboard:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Your JWT secret key
   - `FRONTEND_URL`: Your frontend URL (for CORS)

4. After deployment, note your API URL (e.g., `https://your-api.vercel.app`)

### Deploy Frontend (UI)

1. Update the production API URL in `ui/src/environments/environment.prod.ts`:
   ```typescript
   export const environment = {
     production: true,
     apiUrl: 'https://your-api.vercel.app' // Your deployed API URL
   };
   ```

2. Navigate to the UI directory:
   ```bash
   cd ui
   ```

3. Deploy to Vercel:
   ```bash
   vercel
   ```

### Environment Variables

#### API (.env)
| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT tokens |
| `FRONTEND_URL` | Frontend URL for CORS |
| `PORT` | Server port (optional, default: 3000) |

#### UI (environment.prod.ts)
| Variable | Description |
|----------|-------------|
| `apiUrl` | Backend API base URL |

## �📄 License

ISC
