# Deployment Configuration

## GitHub Pages Setup

This extension is deployed to GitHub Pages using **GitHub Actions**. 

### Required GitHub Pages Configuration

1. Go to repository Settings → Pages
2. Under "Build and deployment":
   - **Source**: Select **"GitHub Actions"** (NOT "Deploy from a branch")
3. Save the changes

### Deployment Workflow

The `.github/workflows/deploy.yml` workflow automatically:
1. Builds the extension using `npm run build`
2. Deploys the `dist/` directory to GitHub Pages
3. Runs on every push to `main` branch

### File Structure

- **Source files**: `src/`, `public/`, `index.html` (source)
- **Built files**: `dist/` (deployed to GitHub Pages)
- **Base path**: `/star-trek-character-sheet/` (configured in `vite.config.ts`)

### Important Notes

- **DO NOT** commit files from `dist/` to the root directory
- The `dist/` folder is in `.gitignore` (not committed)
- GitHub Actions builds and deploys from `dist/` automatically
- All paths in `public/manifest.json` must use the base path prefix: `/star-trek-character-sheet/`

### Testing

After deployment, test these URLs (all should return 200):
- `https://whalecancer.github.io/star-trek-character-sheet/manifest.json`
- `https://whalecancer.github.io/star-trek-character-sheet/`
- `https://whalecancer.github.io/star-trek-character-sheet/assets/index-*.js`
- `https://whalecancer.github.io/star-trek-character-sheet/assets/index-*.css`
- `https://whalecancer.github.io/star-trek-character-sheet/icon.svg`

### Installing in Owlbear Rodeo

1. Go to Owlbear Rodeo → Settings → Extensions
2. Click "Add Extension"
3. Enter: `https://whalecancer.github.io/star-trek-character-sheet/manifest.json`
4. The extension should load without 404 errors

## Troubleshooting

### 404 Errors

If files return 404:
1. Check GitHub Actions workflow status (should be green/success)
2. Verify GitHub Pages is configured to use "GitHub Actions" (not "Deploy from a branch")
3. Wait 1-2 minutes after push for deployment to complete
4. Check that `dist/` contains all required files after build

### Path Issues

If paths are incorrect:
1. Verify `vite.config.ts` has correct `base` path: `/star-trek-character-sheet/`
2. Verify `public/manifest.json` paths use the base path prefix
3. Rebuild: `npm run build`
4. Check `dist/index.html` and `dist/manifest.json` have correct paths
