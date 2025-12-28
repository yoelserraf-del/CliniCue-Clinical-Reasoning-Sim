# Clinical Reasoning Simulator

A comprehensive medical education application that simulates clinical reasoning scenarios for medical students, residents, and attending physicians.

## Features

- **Procedural Case Engine**: Cases are driven by a JSON configuration file (`CaseLibrary.json`)
- **State Machine**: Manages case flow through Triage → Investigation → Diagnosis → Treatment → Debrief
- **Patient Stability System**: Dynamic stability metric (0-100%) that responds to actions and time
- **Difficulty Modes**:
  - **Student**: Color-coded vitals, hints in clinical notes
  - **Resident**: Raw vitals, manual interpretation required
  - **Attending**: Fluctuating vitals, red herring symptoms
- **Science Debrief**: Comprehensive pathophysiology explanations with LaTeX formulas
- **Modern UI**: Patient monitor-style interface with ECG visualization

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will start on `http://localhost:5173` (or the next available port).

### Build

```bash
npm run build
```

The production build will be in the `dist` directory.

## Deployment

This application can be easily deployed to various hosting platforms. Configuration files are already included.

### Option 1: Deploy to Vercel (Recommended - Easiest)

1. **Push your code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login with your GitHub account
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect Vite and use the `vercel.json` configuration
   - Click "Deploy"
   - Your site will be live in minutes!

**Your site will be available at:** `https://your-project-name.vercel.app`

### Option 2: Deploy to Netlify

1. **Push your code to GitHub** (same as above)

2. **Deploy to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Sign up/login with your GitHub account
   - Click "Add new site" → "Import an existing project"
   - Select your GitHub repository
   - Netlify will automatically detect the `netlify.toml` configuration
   - Click "Deploy site"
   - Your site will be live in minutes!

**Your site will be available at:** `https://your-project-name.netlify.app`

### Option 3: Deploy to GitHub Pages

1. **Install gh-pages package:**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Update package.json:**
   Add these scripts:
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```

3. **Update vite.config.js:**
   ```javascript
   export default defineConfig({
     plugins: [react()],
     base: '/your-repo-name/', // Replace with your GitHub repo name
   })
   ```

4. **Deploy:**
   ```bash
   npm run deploy
   ```

5. **Enable GitHub Pages:**
   - Go to your GitHub repository settings
   - Navigate to "Pages"
   - Select source: "gh-pages branch"
   - Your site will be available at: `https://your-username.github.io/your-repo-name/`

### Option 4: Deploy to Any Static Hosting

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Upload the `dist` folder** to any static hosting service:
   - AWS S3 + CloudFront
   - Firebase Hosting
   - Cloudflare Pages
   - Any web server

The `dist` folder contains all the static files needed to run the application.

## Project Structure

```
src/
├── components/
│   ├── PatientMonitor.jsx      # Top bar with vitals and ECG
│   ├── LeftSidebar.jsx         # Patient history and notes
│   ├── ExaminationRoom.jsx     # Test results display
│   ├── ActionMenu.jsx          # Order tests, give medications
│   └── ScienceDebrief.jsx      # Pathophysiology debrief modal
├── data/
│   └── CaseLibrary.json        # Case definitions
├── utils/
│   ├── stateMachine.js         # State management logic
│   └── stabilityManager.js     # Patient stability calculations
├── App.jsx                     # Main application component
└── main.jsx                    # Entry point
```

## Adding New Cases

Edit `src/data/CaseLibrary.json` to add new cases. Each case requires:

- `id`: Unique identifier
- `title`: Case name
- `difficulty`: "student", "resident", or "attending"
- `patientProfile`: Patient demographics and history
- `initialVitals`: HR, BP, RR, SpO₂, Temperature
- `investigations`: Array of available tests with results
- `correctTreatment`: Sequence of correct actions
- `scienceBridge`: Pathophysiology explanation with LaTeX formulas

## Technologies

- **React 19**: UI framework
- **Vite**: Build tool
- **Tailwind CSS**: Styling
- **Lucide React**: Icons
- **React Markdown**: Markdown rendering
- **KaTeX**: LaTeX formula rendering

## License

MIT