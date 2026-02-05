# Vercel Deployment Instructions

## Deploying the IoT Marketplace App to Vercel

This React Native/Expo app is configured for web deployment using Vercel.

### Prerequisites
1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. Vercel CLI installed: `npm i -g vercel`
3. Git repository (optional but recommended)

### Deployment Steps

#### Option 1: Vercel CLI (Recommended for first-time setup)

1. **Install dependencies:**
   ```bash
   cd iot-marketplace-app
   npm install
   ```

2. **Build the web version locally (test first):**
   ```bash
   npx expo export --platform web
   ```

3. **Login to Vercel:**
   ```bash
   vercel login
   ```

4. **Deploy to Vercel:**
   ```bash
   vercel
   ```
   - Follow the prompts
   - Accept the default settings or customize as needed
   - Vercel will use the `vercel.json` configuration

5. **Deploy to production:**
   ```bash
   vercel --prod
   ```

#### Option 2: GitHub Integration (Automated)

1. **Push your code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Import to Vercel:**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Vercel will auto-detect the Expo config
   - Click "Deploy"

#### Option 3: Vercel Dashboard Upload

1. **Build the project locally:**
   ```bash
   npm install
   npx expo export --platform web
   ```

2. **Upload to Vercel:**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "Add New..." → "Project"
   - Choose "Deploy from a folder"
   - Upload the `dist` folder

### Environment Variables

If your app requires environment variables, add them in Vercel:

1. Go to your project settings on Vercel
2. Navigate to "Environment Variables"
3. Add required variables:
   - `EXPO_PUBLIC_API_URL` - Your backend API URL
   - Any other environment-specific configs

### Build Configuration

The `vercel.json` file includes:
- **buildCommand**: `expo export --platform web` - Builds the web version
- **outputDirectory**: `dist` - Where the built files are output
- **devCommand**: `expo start --web` - For local development
- **installCommand**: `npm install` - Dependency installation

### Important Notes

1. **Web-Only Features**: Some React Native features may not work on web:
   - Camera/GPS may require browser permissions
   - Some native modules might need web alternatives
   - Test thoroughly in a browser before deploying

2. **API Configuration**: Update your API endpoints to point to production:
   ```typescript
   // src/services/api/client.ts
   const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://your-backend.com/api';
   ```

3. **Responsive Design**: The app uses responsive utilities - test on various screen sizes

4. **Performance**: Web bundles are larger than mobile - consider code splitting

### Deployment URL

After deployment, Vercel will provide:
- **Preview URL**: For testing (e.g., `your-app-abc123.vercel.app`)
- **Production URL**: Your custom domain or Vercel subdomain

### Custom Domain

To add a custom domain:
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed by Vercel

### Troubleshooting

**Build fails:**
- Check Node.js version compatibility (use Node 18+)
- Ensure all dependencies are installed
- Check for TypeScript errors: `npx tsc --noEmit`

**App doesn't load:**
- Check browser console for errors
- Verify API URLs are correct
- Test locally first: `npm run web`

**Styling issues:**
- Some React Native styles may need web-specific adjustments
- Test with `react-native-web` compatibility

### Continuous Deployment

Once connected to GitHub, Vercel automatically:
- Deploys on every `git push` to main branch
- Creates preview deployments for pull requests
- Runs build checks before deployment

### Support

- Vercel Docs: https://vercel.com/docs
- Expo Web: https://docs.expo.dev/workflow/web/
- Issues: Check the Vercel deployment logs for errors
