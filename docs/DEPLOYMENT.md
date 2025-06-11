# Serve AI - Deployment Documentation

This guide provides comprehensive instructions for deploying the Serve AI restaurant alert notification system prototype for demos, testing, and production scenarios.

## 📱 iOS Simulator Deployment

### Prerequisites
- **macOS**: Required for iOS development
- **Xcode**: Latest version from Mac App Store
- **Xcode Command Line Tools**: `xcode-select --install`
- **Node.js**: Version 18.x or higher
- **Expo CLI**: `npm install -g @expo/cli`

### Quick iOS Simulator Setup

1. **Install Xcode iOS Simulator**
   ```bash
   # Open Xcode and install iOS simulators
   # Xcode → Preferences → Components → iOS Simulators
   # Download iOS 17.0+ simulators
   ```

2. **Start iOS Simulator**
   ```bash
   # List available simulators
   xcrun simctl list devices

   # Start specific simulator (recommended: iPhone 15 Pro)
   xcrun simctl boot "iPhone 15 Pro"
   open -a Simulator
   ```

3. **Deploy to Simulator**
   ```bash
   cd serve-ai-app
   npm install
   npm run ios
   ```

### iOS Simulator Configuration

#### Recommended Device Settings
- **Device**: iPhone 15 Pro (iOS 17.0+)
- **Display**: Standard resolution for demo clarity
- **Orientation**: Portrait (locked)
- **Notifications**: Enabled for push notification testing

#### Simulator Setup Commands
```bash
# Reset simulator to clean state
xcrun simctl erase all

# Boot specific device
xcrun simctl boot "iPhone 15 Pro"

# Install app on simulator
xcrun simctl install booted <path-to-app>

# Launch app
xcrun simctl launch booted com.yourcompany.serveai
```

### Troubleshooting iOS Simulator

**Simulator Won't Start**
```bash
# Kill all simulator processes
sudo killall -9 com.apple.CoreSimulator.CoreSimulatorService
sudo killall -9 iOS\ Simulator

# Reset simulator service
sudo xcode-select --reset
sudo xcode-select --install
```

**App Won't Install**
```bash
# Clear Expo cache
npx expo start --clear

# Reset Metro bundler
rm -rf node_modules/.cache
npm start
```

**Notification Issues**
1. iOS Simulator → Device → Notifications → Allow
2. Settings → Serve AI → Notifications → Enable
3. Restart app after permission changes

## 🏗️ Production Build Process

### iOS Production Build

#### Using Expo Application Services (EAS)
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo account
eas login

# Configure build
eas build:configure

# Build for iOS
eas build --platform ios
```

#### Local Production Build
```bash
# Generate native iOS project
npx expo prebuild --platform ios

# Open in Xcode
npx expo run:ios --configuration Release

# Or build from command line
xcodebuild -workspace ios/ServeAI.xcworkspace \
           -scheme ServeAI \
           -configuration Release \
           -destination 'platform=iOS Simulator,name=iPhone 15 Pro' \
           build
```

### Build Configuration

#### app.json Production Settings
```json
{
  "expo": {
    "name": "Serve AI",
    "slug": "serve-ai-restaurant-alerts",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#1a365d"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.serveai.restaurantalerts",
      "buildNumber": "1",
      "infoPlist": {
        "NSUserNotificationsUsageDescription": "Serve AI needs notification access to alert you about critical restaurant operations.",
        "UIBackgroundModes": ["background-processing"]
      }
    }
  }
}
```

#### Production Environment Variables
```env
# Production Configuration
NODE_ENV=production
DEMO_MODE=false
API_BASE_URL=https://api.serve-ai.com
SENTRY_DSN=your_sentry_dsn_here

# Notification Configuration
ENABLE_PUSH_NOTIFICATIONS=true
NOTIFICATION_PROVIDER=firebase
FCM_SERVER_KEY=your_fcm_key_here

# Analytics
ANALYTICS_ENABLED=true
MIXPANEL_TOKEN=your_mixpanel_token
```

## 🎯 Demo Deployment Guide

### Pre-Demo Setup Checklist

**Environment Preparation**
- [ ] Clean iOS Simulator state
- [ ] Stable internet connection
- [ ] Backup presentation device ready
- [ ] Demo scenarios tested and working
- [ ] App performance verified (< 3s launch time)

**Demo Configuration**
```bash
# Set demo environment
export DEMO_MODE=true
export DEMO_SCENARIO=BUSY_LUNCH_RUSH
export RESTAURANT_TYPE=FAST_CASUAL

# Launch in demo mode
npm run demo
```

### Demo Deployment Steps

1. **Reset Demo Environment**
   ```bash
   # Clear all cached data
   npx expo start --clear --reset-cache
   
   # Reset iOS Simulator
   xcrun simctl erase "iPhone 15 Pro"
   xcrun simctl boot "iPhone 15 Pro"
   ```

2. **Configure Demo Scenario**
   ```bash
   # Available scenarios: BUSY_LUNCH_RUSH, MORNING_PREP, EVENING_SERVICE
   export DEMO_SCENARIO=BUSY_LUNCH_RUSH
   npm run ios
   ```

3. **Verify Demo Functionality**
   - App launches within 3 seconds
   - Push notifications work correctly
   - All demo scenarios load properly
   - Performance is smooth (60fps)
   - Audio alerts function

### Demo Backup Procedures

**Primary Demo Fails**
1. Switch to backup device/simulator
2. Use recorded demo video as fallback
3. Navigate to pre-loaded demo state
4. Explain features while showing static screenshots

**Network Issues**
- App works offline with cached demo data
- All scenarios pre-loaded locally
- No internet required for core functionality

## 🚀 Advanced Deployment Options

### Staging Environment

```bash
# Build staging version
export NODE_ENV=staging
export API_BASE_URL=https://staging-api.serve-ai.com
eas build --profile staging
```

### Test Flight Distribution (iOS)

```bash
# Build for TestFlight
eas build --platform ios --profile production

# Submit to App Store Connect
eas submit --platform ios
```

### Enterprise Distribution

```bash
# Build enterprise version
eas build --platform ios --profile enterprise

# Generate IPA for internal distribution
eas build:inspect
```

## 🔧 Configuration Management

### Environment-Specific Configurations

**Development (app.config.js)**
```javascript
export default {
  expo: {
    name: process.env.NODE_ENV === 'production' ? 'Serve AI' : 'Serve AI Dev',
    slug: 'serve-ai-restaurant-alerts',
    extra: {
      demoMode: process.env.DEMO_MODE === 'true',
      apiUrl: process.env.API_BASE_URL || 'http://localhost:3000',
      enableNotifications: process.env.ENABLE_PUSH_NOTIFICATIONS === 'true'
    }
  }
};
```

**Production Optimizations**
```json
{
  "metro": {
    "transformer": {
      "minifierPath": "metro-minify-terser",
      "minifierConfig": {
        "keep_fnames": true,
        "mangle": {
          "keep_fnames": true
        }
      }
    }
  }
}
```

## 📊 Performance Optimization for Deployment

### Bundle Size Optimization

```bash
# Analyze bundle size
npx expo export --dump-assetmap

# Optimize images
npx expo optimize

# Remove unused dependencies
npm install -g depcheck
depcheck
```

### Runtime Performance

**Memory Management**
```javascript
// Memory-efficient alert loading
const ALERTS_PAGE_SIZE = 50;
const MAX_CACHED_ALERTS = 200;

// Image optimization
const optimizedImageConfig = {
  quality: 0.8,
  format: 'webp',
  resize: {
    width: 300,
    height: 300
  }
};
```

**Startup Optimization**
```javascript
// Lazy load non-critical components
const LazyAlertHistory = lazy(() => import('./screens/AlertHistory'));
const LazySettings = lazy(() => import('./screens/Settings'));

// Preload critical data
export const preloadCriticalData = async () => {
  await Promise.all([
    AlertService.preloadCriticalAlerts(),
    NotificationService.initializePermissions(),
    StorageService.validateCache()
  ]);
};
```

## 🛡️ Security for Production Deployment

### Code Obfuscation
```bash
# Install metro-react-native-babel-preset
npm install --save-dev metro-react-native-babel-preset

# Configure babel for production
# babel.config.js
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    ['transform-remove-console', { exclude: ['error', 'warn'] }]
  ]
};
```

### API Security
```javascript
// Secure API configuration
const apiConfig = {
  baseURL: process.env.API_BASE_URL,
  timeout: 10000,
  headers: {
    'Authorization': `Bearer ${getSecureToken()}`,
    'X-API-Version': '1.0',
    'Content-Type': 'application/json'
  }
};
```

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] Code review completed
- [ ] All tests passing (unit, integration, e2e)
- [ ] Performance benchmarks met
- [ ] Security scan completed
- [ ] Documentation updated
- [ ] Demo scenarios tested

### iOS Deployment
- [ ] Xcode project builds successfully
- [ ] App Store guidelines compliance
- [ ] Icon and splash screen optimized
- [ ] Push notification certificates configured
- [ ] Privacy policy and usage descriptions added
- [ ] TestFlight testing completed

### Demo Deployment
- [ ] Demo environment configured
- [ ] All scenarios working perfectly
- [ ] Backup demo options prepared
- [ ] Performance verified on target hardware
- [ ] Presentation materials synchronized

### Post-Deployment
- [ ] App functionality verified
- [ ] Push notifications working
- [ ] Performance monitoring active
- [ ] Error tracking configured
- [ ] Analytics data flowing
- [ ] User feedback collection ready

## 🚨 Emergency Procedures

### Demo Day Crisis Management

**App Crashes During Demo**
1. Restart app immediately
2. Switch to backup scenario
3. Continue narration while app loads
4. Have screenshots ready as backup

**Notification Issues**
1. Check iOS Simulator notification settings
2. Restart simulator if needed
3. Use in-app mock notifications
4. Explain notification flow verbally

**Performance Problems**
1. Close other simulator apps
2. Restart iOS Simulator
3. Use pre-recorded demo video
4. Switch to backup device

## 📞 Support During Deployment

### Immediate Support
- **Tech Lead**: Available during demo periods
- **Backup Contact**: Secondary technical contact
- **Emergency Escalation**: C-level contact for critical issues

### Self-Service Resources
- **Troubleshooting Guide**: Common issues and solutions
- **Demo Scripts**: Detailed presentation flow
- **FAQ**: Frequently asked questions and answers
- **Video Tutorials**: Step-by-step deployment guides

---

**Deployment Success Metrics**
- App launch time: < 3 seconds
- Demo completion rate: 100%
- Critical bug count: 0
- Performance score: > 95/100
- Investor feedback: Positive technical assessment

*Serve AI - Professional deployment for restaurant intelligence*