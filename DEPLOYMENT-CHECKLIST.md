# Deployment Troubleshooting Checklist

## Current Status Check ✅

- ✅ Workflow file exists: `.github/workflows/deploy.yml`
- ✅ Workflow file is committed to git (checked in HEAD)
- ✅ Local build works: `npm run build` succeeds
- ✅ Latest commit (68b2a0c) includes DiceRoller and ScienceSpecialSkills
- ✅ Workflow file syntax is correct
- ✅ Build creates correct output in `dist/` folder

## ⚠️ MOST LIKELY ISSUE: GitHub Pages Configuration

**The #1 reason deployments don't update is that GitHub Pages is set to deploy from a branch instead of GitHub Actions.**

### How to Fix:

1. Go to: `https://github.com/WhaleCancer/star-trek-character-sheet/settings/pages`
2. Under **"Build and deployment"** → **"Source"**:
   - **MUST SELECT: "GitHub Actions"** (NOT "Deploy from a branch")
   - If it's set to "Deploy from a branch", change it to "GitHub Actions"
3. Save the changes
4. Go to the **Actions** tab: `https://github.com/WhaleCancer/star-trek-character-sheet/actions`
5. You should see a workflow run starting automatically after changing the source
6. If not, manually trigger it:
   - Go to Actions tab
   - Click "Deploy to GitHub Pages" workflow
   - Click "Run workflow" button (top right)
   - Select branch: `main`
   - Click "Run workflow"

## Other Common Issues to Check:

### 1. GitHub Actions Not Enabled
- Go to: `https://github.com/WhaleCancer/star-trek-character-sheet/settings/actions`
- Under **"Actions permissions"**:
  - Should be set to **"Allow all actions and reusable workflows"**
  - OR at minimum: **"Allow local actions and reusable workflows"**

### 2. Workflow Runs But Fails
- Go to: `https://github.com/WhaleCancer/star-trek-character-sheet/actions`
- Check if there are any failed workflow runs
- Click on a failed run to see error messages
- Common issues:
  - Missing dependencies in package.json
  - Build errors
  - Permission errors

### 3. Workflow Not Running at All
- Check if the workflow file exists in the remote repository:
  - `https://github.com/WhaleCancer/star-trek-character-sheet/tree/main/.github/workflows`
- Verify the file name is exactly: `deploy.yml` (not `deploy.yaml`)
- Verify it's on the `main` branch

### 4. Caching Issues
- GitHub Pages might be serving cached content
- Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
- Try an incognito/private window
- Wait 5-10 minutes after deployment for CDN cache to clear

### 5. Verify Deployment
After fixing configuration, check:
- Workflow run shows as ✅ (green) in Actions tab
- Deployment appears under: `https://github.com/WhaleCancer/star-trek-character-sheet/deployments`
- Files are accessible:
  - `https://whalecancer.github.io/star-trek-character-sheet/manifest.json`
  - `https://whalecancer.github.io/star-trek-character-sheet/assets/index-*.js` (new hash)

## Manual Deployment (If GitHub Actions Still Fails)

If GitHub Actions continues to fail, you can manually build and deploy:

1. **Build locally:**
   ```bash
   cd Owlbear-Rodeo-Extensions/star-trek-sheet-main
   npm run build
   ```

2. **Create a `gh-pages` branch manually:**
   ```bash
   git checkout -b gh-pages
   git add dist/
   git commit -m "Deploy latest build"
   git push origin gh-pages
   ```

3. **Then set GitHub Pages to deploy from `gh-pages` branch** (temporary workaround)

## Quick Verification Commands

```bash
# Check if workflow file is in git
git ls-files .github/workflows/deploy.yml

# Check latest commit includes our changes
git log --oneline -5

# Verify build works
npm run build
ls dist/assets/

# Check file sizes (should be ~206KB for JS, ~46KB for CSS)
Get-ChildItem dist/assets/ | Select-Object Name, Length
```
