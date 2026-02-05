# Vercel Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Code Quality
- [x] Fixed all syntax errors in CartScreen.tsx
- [x] Removed duplicate `_updated.tsx` files
- [x] All TypeScript errors resolved in cart screens
- [ ] Test app locally: `npm run web`
- [ ] Check for console errors in browser

### 2. Environment Configuration
- [ ] Update API base URL for production in `src/services/api/client.ts`
- [ ] Set up environment variables in Vercel dashboard
- [ ] Configure CORS on backend to allow Vercel domain

### 3. Build Configuration
- [x] Created `vercel.json` with build settings
- [x] Added `.vercelignore` file
- [x] Updated `package.json` with build scripts
- [ ] Test build locally: `npm run build`

### 4. Dependencies
- [ ] Run `npm install` to ensure all packages are installed
- [ ] Check for any deprecated or vulnerable packages: `npm audit`
- [ ] Update critical dependencies if needed

## 🚀 Deployment Options

### Option A: Quick Deploy (Vercel CLI)
```bash
# 1. Install Vercel CLI globally
npm i -g vercel

# 2. Navigate to project
cd iot-marketplace-app

# 3. Install dependencies
npm install

# 4. Test build locally
npm run build

# 5. Login to Vercel
vercel login

# 6. Deploy (follow prompts)
vercel

# 7. Deploy to production
vercel --prod
```

### Option B: GitHub Integration (Recommended)
```bash
# 1. Initialize git (if not already)
git init

# 2. Add all files
git add .

# 3. Commit changes
git commit -m "Prepare for Vercel deployment"

# 4. Create GitHub repo and push
git remote add origin <your-github-repo-url>
git push -u origin main

# 5. Connect to Vercel
# - Go to vercel.com/dashboard
# - Click "Add New Project"
# - Import from GitHub
# - Deploy!
```

### Option C: Manual Build Upload
```bash
# 1. Build locally
npm install
npm run build

# 2. Upload dist/ folder to Vercel dashboard
# - Go to vercel.com/dashboard
# - Add New → Project
# - Upload dist folder
```

## 📋 Post-Deployment Tasks

### 1. Verify Deployment
- [ ] Open deployed URL (provided by Vercel)
- [ ] Test navigation between screens
- [ ] Test cart functionality
- [ ] Test API calls (if backend is deployed)
- [ ] Check mobile responsiveness
- [ ] Test on different browsers

### 2. Configure Domain (Optional)
- [ ] Add custom domain in Vercel settings
- [ ] Update DNS records
- [ ] Wait for SSL certificate generation
- [ ] Verify HTTPS works

### 3. Set Environment Variables
In Vercel Dashboard → Project Settings → Environment Variables:

```
EXPO_PUBLIC_API_URL=https://your-backend-api.com/api
```

### 4. Enable Analytics (Optional)
- [ ] Enable Vercel Analytics in project settings
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure performance monitoring

## 🔍 Testing Checklist

### Functionality Tests
- [ ] Home screen loads with products
- [ ] Product search works
- [ ] Catalog filtering works
- [ ] Cart add/remove items
- [ ] Coupon validation
- [ ] Checkout flow
- [ ] User authentication (if implemented)
- [ ] Profile management

### Performance Tests
- [ ] Initial load time < 3 seconds
- [ ] Images load properly
- [ ] No console errors
- [ ] Smooth animations
- [ ] API calls complete successfully

### Responsive Design Tests
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

### Browser Compatibility
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers

## 🐛 Troubleshooting

### Build Fails
**Error**: Module not found
- **Fix**: Run `npm install` again
- **Fix**: Check import paths are correct

**Error**: TypeScript errors
- **Fix**: Run `npx tsc --noEmit` to find errors
- **Fix**: Fix type issues before deploying

**Error**: Out of memory
- **Fix**: Increase Node memory: `export NODE_OPTIONS=--max_old_space_size=4096`

### Deployment Succeeds but App Doesn't Load
**Issue**: Blank screen
- **Check**: Browser console for errors
- **Check**: Network tab for failed API calls
- **Fix**: Update API URLs to production

**Issue**: Styling broken
- **Check**: React Native Web compatibility
- **Fix**: Test locally with `npm run web`

**Issue**: Images not loading
- **Check**: Image URLs are absolute, not relative
- **Fix**: Update image paths or use proper CDN

### API Connection Issues
**Issue**: CORS errors
- **Fix**: Add Vercel domain to backend CORS whitelist
- **Example**: Allow `https://your-app.vercel.app`

**Issue**: API calls fail
- **Fix**: Update `EXPO_PUBLIC_API_URL` environment variable
- **Fix**: Ensure backend is deployed and accessible

## 📚 Resources

- **Vercel Docs**: https://vercel.com/docs
- **Expo Web Docs**: https://docs.expo.dev/workflow/web/
- **React Native Web**: https://necolas.github.io/react-native-web/
- **Deployment Guide**: See `DEPLOYMENT.md` for detailed instructions

## 🎉 Success Criteria

Your deployment is successful when:
- ✅ App loads at Vercel URL without errors
- ✅ All core features work (cart, products, navigation)
- ✅ No console errors in browser
- ✅ Responsive on mobile and desktop
- ✅ API calls work (if backend is configured)

## 🔄 Continuous Deployment

Once connected to GitHub:
1. Push to `main` branch → Automatic production deployment
2. Open PR → Automatic preview deployment
3. Merge PR → Deploys to production

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Review browser console errors
3. Test locally first: `npm run web`
4. Check DEPLOYMENT.md for detailed solutions
