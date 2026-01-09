# Star Trek Character Sheet

A Star Trek character sheet extension for Owlbear Rodeo.

## Features

This character sheet is designed for Star Trek RPGs and includes:

- **Characteristics Section**: Track character attributes and values
- **Skills by Category**: Organized sections for different skill types
- **Abilities Section**: Track character abilities and special traits
- **Character Info**: Name, Species, Rank, and Experience tracking
- **Notes**: Free-form notes section for additional information

## How to use

- **Edit Values**: Click on values in the right column to edit them directly
- **Edit Mode**: Click the `EDIT` button to modify stat names, section titles, and add/remove entries
- **Export/Import**: `EXPORT` your character to JSON and `IMPORT` it back anytime
- **GM View**: GMs can view all player sheets via the tabs at the top
- **Theme**: Customize colors by clicking on the theme editor

## Building

```bash
npm install
npm run build
```

The built files will be in the `dist` directory, ready to be loaded as an Owlbear Rodeo extension.

## Deployment

This extension is automatically deployed to GitHub Pages via GitHub Actions. See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment configuration and troubleshooting.

**Quick Install in Owlbear Rodeo:**
1. Go to Settings → Extensions
2. Click "Add Extension"
3. Enter: `https://whalecancer.github.io/star-trek-character-sheet/manifest.json`
