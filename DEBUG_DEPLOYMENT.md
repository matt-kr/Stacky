# Debug System Deployment Checklist

## Pre-Deployment

- [ ] All debug files are committed to repository
- [ ] Environment variables are documented in `.env.example`
- [ ] Debug system is integrated into `main.jsx`
- [ ] API endpoints are in `/api/debug/` directory

## Vercel Configuration

### Environment Variables
Set these in Vercel Dashboard → Settings → Environment Variables:

- [ ] `VITE_DEBUG_OVERLAY=1` (enables debug overlay)
- [ ] `DEBUG_PASSWORD=your_secure_password` (set a strong password)

### Deployment
- [ ] Deploy to Vercel
- [ ] Verify API endpoint is accessible: `https://your-app.vercel.app/api/debug/login`
- [ ] Test environment variables are loaded correctly

## Post-Deployment Testing

### Access Flow
- [ ] Visit deployed app
- [ ] Click invisible area in top-right corner
- [ ] Password prompt appears
- [ ] Enter correct password
- [ ] Debug overlay appears
- [ ] All tabs (Logs, API, Photos, Errors) are functional

### Authentication
- [ ] Wrong password is rejected
- [ ] Correct password grants access
- [ ] Debug state persists on page refresh
- [ ] `stackyDebugLogout()` disables debug mode

### Functionality
- [ ] API calls appear in API tab
- [ ] Errors appear in Errors tab
- [ ] Photo uploads tracked in Photos tab
- [ ] Overlay can be moved around screen
- [ ] Export logs function works
- [ ] Clear logs function works

### Security
- [ ] Debug overlay only appears when authenticated
- [ ] API endpoint requires correct password
- [ ] No debug code visible in browser without authentication
- [ ] Environment variables are properly secured

## Troubleshooting

### Common Issues

**Debug button not responding:**
- Check if `VITE_DEBUG_OVERLAY=1` is set
- Verify button area (top-right, 20x20px)
- Check browser console for errors

**Authentication failing:**
- Verify `DEBUG_PASSWORD` is set in Vercel
- Check API endpoint `/api/debug/login` returns 200
- Verify password matches exactly

**Overlay not appearing:**
- Check localStorage for `stacky_debug=1`
- Verify React components are loading
- Check for JavaScript errors in console

**Missing data in tabs:**
- Verify collectors are importing correctly
- Check debug bus is receiving events
- Test with `window.stackyDebug.bus.log('test')`

## Rollback Plan

If debug system causes issues:

1. Set `VITE_DEBUG_OVERLAY=0` in Vercel
2. Redeploy application
3. Debug system will be completely disabled

## Security Notes

- Debug password should be strong and unique
- Consider rotating debug password periodically
- Monitor access logs for unauthorized attempts
- Disable debug overlay in production if not needed
