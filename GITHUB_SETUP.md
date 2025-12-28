# How to Push to GitHub - Step by Step

## Step 1: Create a GitHub Account (if you don't have one)
1. Go to [github.com](https://github.com)
2. Sign up for a free account
3. Verify your email

## Step 2: Create a New Repository on GitHub
1. Log into GitHub
2. Click the "+" icon in the top right
3. Select "New repository"
4. Name your repository (e.g., "clinical-reasoning-simulator")
5. Choose "Public" or "Private"
6. **DO NOT** check "Initialize with README" (we already have files)
7. Click "Create repository"

## Step 3: Copy Your Repository URL
After creating the repo, GitHub will show you a URL like:
- `https://github.com/YOUR-USERNAME/clinical-reasoning-simulator.git`

Copy this URL - you'll need it in the next step!

## Step 4: Push Your Code (Run these commands)

Open your terminal in the project folder and run:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit - Clinical Reasoning Simulator"

# Add GitHub as remote (replace with YOUR repository URL)
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

## Step 5: Enter Your Credentials
When you run `git push`, GitHub will ask for:
- **Username**: Your GitHub username
- **Password**: You'll need a Personal Access Token (not your regular password)

### How to Create a Personal Access Token:
1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name (e.g., "Clinical Simulator")
4. Select scopes: Check "repo" (this gives full repository access)
5. Click "Generate token"
6. **Copy the token immediately** (you won't see it again!)
7. Use this token as your password when pushing

## Troubleshooting

### "Repository not found" error
- Make sure you created the repository on GitHub first
- Check that the URL is correct
- Make sure you're using the right username

### "Authentication failed" error
- Make sure you're using a Personal Access Token, not your password
- Check that the token has "repo" permissions

### "Branch 'main' does not exist"
- Run: `git branch -M main` first
- Then try pushing again

## After Pushing Successfully

You'll see your code on GitHub! Then you can:
1. Deploy to Vercel or Netlify (see QUICK_DEPLOY.md)
2. Share your repository with others
3. Continue making changes and pushing updates

## Making Future Updates

After your initial push, whenever you make changes:

```bash
git add .
git commit -m "Description of your changes"
git push
```

That's it! Much simpler after the first time.

