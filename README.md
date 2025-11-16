# NBLK Stability Calculator

A React + Vite application for evaluating political stability scores.

## Local Development

### Development Mode
```bash
npm install
npm run dev
```
Runs the app in development mode with hot reload at `http://localhost:5173`

### Production Build (Local Testing)
```bash
npm install
npm run build
npm start
```
Builds the app and serves it with Express at `http://localhost:8080`

## Azure Deployment

This app is configured to deploy to Azure App Service using GitHub Actions.

### How Azure Starts the App

The app uses an Express server (`server.cjs`) to serve the built static files from the `dist` folder. 

**IMPORTANT:** To ensure Azure uses `npm start` instead of auto-detecting a static site and using `npx serve`:

1. **In Azure Portal**, go to your App Service → **Configuration** → **General Settings**
2. **Set the Startup Command** to:
   ```
   npm start
   ```
3. **Save** the configuration
4. **Restart** the App Service

**Why this is needed:** Azure Oryx may auto-detect the `dist` folder and treat it as a static site, running `npx serve` instead of your Express server. Setting the Startup Command explicitly forces Azure to use your `npm start` script.

### What Happens During Deployment

1. GitHub Actions builds the app (`npm run build`)
2. Deploys the entire project to Azure
3. Azure Oryx runs `npm install` to install dependencies
4. Azure runs `npm start` which executes `node server.cjs`
5. The Express server serves static files from `/home/site/wwwroot/dist`

### Expected Azure Logs

After deployment, you should see logs like:
```
Stability Calculator running on port 8080
Serving from: /home/site/wwwroot/dist
```

**NOT** logs showing `npx serve` or `serve: not found`.

### Troubleshooting

If Azure is still using `npx serve`:
1. Check that `package.json` has `"start": "node server.cjs"` in scripts
2. Verify `express` is in `dependencies` (not `devDependencies`)
3. Set the Startup Command in Azure Portal to `npm start` explicitly
4. Redeploy the app

## Environment Variables

For Supabase integration, set these in Azure App Service Configuration:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Note: These are build-time variables. They need to be set before `npm run build` runs.

