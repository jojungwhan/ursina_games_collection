# MkDocs Deployment Guide

## Overview

MkDocs generates a **static website** (HTML, CSS, JavaScript) in the `site/` directory. You can deploy this to any web server that serves static files.

## Quick Answer

**Yes, you just copy the files!** Upload the entire contents of the `site/` directory to your web server's document root.

## Deployment Methods

### Method 1: Manual Copy (SCP/SFTP)

1. **Build the site** (if not already built):
   ```bash
   mkdocs build
   ```

2. **Upload using SCP** (Linux/Mac):
   ```bash
   scp -r site/* user@your-server.com:/var/www/html/
   ```

3. **Or using SFTP** (any OS):
   - Use FileZilla, WinSCP, or similar
   - Connect to your server
   - Upload all files from `site/` to your web root

### Method 2: Using rsync (Recommended for Updates)

```bash
# Build first
mkdocs build

# Sync to server (excludes unnecessary files)
rsync -avz --delete site/ user@your-server.com:/var/www/html/
```

The `--delete` flag removes files on the server that no longer exist locally.

### Method 3: Git-based Deployment

If your server has Git access:

1. **On your server:**
   ```bash
   cd /var/www/html
   git clone https://github.com/yourusername/ursina_games_collection.git
   cd ursina_games_collection
   mkdocs build
   # Copy site/ contents to web root or configure web server to serve from site/
   ```

2. **For updates:**
   ```bash
   git pull
   mkdocs build
   ```

### Method 4: Automated CI/CD (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy MkDocs

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.x'
      - run: pip install mkdocs-material
      - run: mkdocs build
      - name: Deploy to server
        uses: SamKirkland/FTP-Deploy-Action@4.3.0
        with:
          server: ${{ secrets.FTP_SERVER }}
          username: ${{ secrets.FTP_USERNAME }}
          password: ${{ secrets.FTP_PASSWORD }}
          local-dir: ./site/
```

## Web Server Configuration

### Nginx Example

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Apache Example

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /var/www/html

    <Directory /var/www/html>
        Options Indexes FollowSymLinks
        AllowOverride None
        Require all granted
    </Directory>
</VirtualHost>
```

## Alternative Hosting Options

### GitHub Pages (Free)

1. Install `mkdocs-material` and `mkdocs-git-revision-date-localized-plugin`
2. Use `mkdocs gh-deploy` command:
   ```bash
   mkdocs gh-deploy
   ```
   This automatically builds and deploys to `gh-pages` branch.

### Netlify / Vercel

1. Connect your Git repository
2. Set build command: `mkdocs build`
3. Set publish directory: `site`
4. Deploy automatically on push

## Important Notes

- **Always rebuild** before deploying if you've changed content:
  ```bash
  mkdocs build
  ```

- **The `site/` directory** contains everything needed - no Python/MkDocs required on the server

- **File permissions**: Ensure web server can read files:
  ```bash
  chmod -R 755 /var/www/html
  chown -R www-data:www-data /var/www/html
  ```

- **Base URL**: If deploying to a subdirectory (e.g., `/docs/`), update `mkdocs.yml`:
  ```yaml
  site_url: https://your-domain.com/docs/
  ```

## Testing Locally Before Deploy

Test the built site locally:
```bash
# Python 3
python -m http.server 8000 --directory site

# Or use mkdocs serve (but this serves from source, not built site)
mkdocs serve
```

Then visit `http://localhost:8000` to verify everything works.
