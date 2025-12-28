# Deployment Guide

This guide will help you deploy the Clinical Reasoning Simulator to the web so it can be accessed without downloading files.

## Quick Start - Vercel (Recommended)

Vercel is the easiest and fastest way to deploy this application.

### Step 1: Prepare Your Code

1. Make sure your code is in a Git repository (GitHub, GitLab, or Bitbucket)
2. If you haven't already, initialize git:
   ```bash
   git init
   git add .
   git commit -m "Ready for deployment"
   ```

### Step 2: Push to GitHub

1. Create a new repository on GitHub
2. Push your code:
   ```bash
   git remote add origin https://github.com/your-username/your-repo-name.git
   git branch -M main
   git push -u origin main
   ```

### Step 3: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up (free)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will automatically:
   - Detect it's a Vite project
   - Use the `vercel.json` configuration
   - Set up the build process
5. Click "Deploy"
6. Wait 1-2 minutes for deployment
7. Your site is live! 🎉

**Your URL will be:** `https://your-project-name.vercel.app`

## Alternative: Netlify

1. Go to [netlify.com](https://netlify.com) and sign up
2. Click "Add new site" → "Import an existing project"
3. Connect your GitHub account
4. Select your repository
5. Netlify will auto-detect settings from `netlify.toml`
6. Click "Deploy site"
7. Your site is live!

**Your URL will be:** `https://your-project-name.netlify.app`

## Testing the Build Locally

Before deploying, test your production build:

```bash
# Build the project
npm run build

# Preview the production build
npm run preview
```

This will start a local server showing how your site will look in production.

## Custom Domain (Optional)

Both Vercel and Netlify allow you to add a custom domain:

1. **Vercel:** Go to Project Settings → Domains → Add Domain
2. **Netlify:** Go to Site Settings → Domain Management → Add Custom Domain

Follow the instructions to configure your DNS settings.

## Environment Variables

If you need to add environment variables:

1. **Vercel:** Project Settings → Environment Variables
2. **Netlify:** Site Settings → Environment Variables

Access them in your code with `import.meta.env.VITE_YOUR_VARIABLE`

## Continuous Deployment

Both platforms automatically deploy when you push to your main branch:

- Push to GitHub → Automatic deployment
- Pull requests → Preview deployments
- No manual steps needed!

## Troubleshooting

### Build Fails

1. Check the build logs in your hosting platform
2. Make sure all dependencies are in `package.json`
3. Run `npm run build` locally to test

### 404 Errors on Refresh

The `vercel.json` and `netlify.toml` files include redirect rules to fix this. If you still have issues, make sure these files are in your repository root.

### Assets Not Loading

Make sure all assets are in the `public` folder or imported correctly in your components.

## Need Help?

- **Vercel Docs:** https://vercel.com/docs
- **Netlify Docs:** https://docs.netlify.com
- **Vite Deployment:** https://vitejs.dev/guide/static-deploy.html

