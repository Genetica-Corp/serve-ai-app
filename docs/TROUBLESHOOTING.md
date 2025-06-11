# Serve AI - Troubleshooting Guide

This guide provides solutions to common issues encountered during development, testing, and demonstration of the Serve AI restaurant alert notification system.

## 🚨 Emergency Demo Issues

### App Won't Launch During Demo

**Symptoms**: App crashes on startup or shows loading screen indefinitely

**Immediate Solutions**:
1. **Quick Reset**:
   ```bash
   # Kill Metro bundler
   npx expo start --clear
   
   # Reset iOS Simulator
   xcrun simctl erase "iPhone 15 Pro"
   xcrun simctl boot "iPhone 15 Pro"
   
   # Restart with clean cache
   npm run setup:demo
   ```

2. **Backup Plan**: Switch to pre-recorded demo video located at `/backup/demo-video.mp4`

3. **Emergency Slides**: Use static screenshots in `/backup/emergency-presentation.pdf`

### Notifications Not Working

**Symptoms**: Push notifications don't appear or sound doesn't play

**Quick Fixes**:
1. **Check Simulator Settings**:
   - iOS Simulator → Device → Notifications → Allow
   - Settings → Serve AI → Notifications → Enable All

2. **Permission Reset**:
   ```bash
   # Reset notification permissions
   xcrun simctl privacy "iPhone 15 Pro" reset notifications com.serveai.restaurantalerts
   ```

3. **Alternative Demo**: Use in-app notification banners and explain that production uses push notifications

### Performance Issues During Demo

**Symptoms**: Slow app response, laggy animations, or crashes

**Immediate Actions**:
1. **Quick Performance Boost**:
   ```bash
   # Close all other simulator apps
   # Restart iOS Simulator with clean state
   xcrun simctl shutdown all
   xcrun simctl boot "iPhone 15 Pro"
   ```

2. **Switch Demo Mode**:
   ```bash
   # Use lighter demo scenario
   export DEMO_SCENARIO=MORNING_PREP
   npm run demo:prep
   ```

3. **Hardware Switch**: Move to backup device or use recorded demo

## 🔧 Development Issues

### Installation Problems

**Metro Bundler Won't Start**
```bash
# Clear all caches
npx expo start --clear --reset-cache
rm -rf node_modules/.cache
rm -rf /tmp/metro-*

# Reinstall dependencies
npm run reset
```

**Expo CLI Issues**
```bash
# Reinstall Expo CLI
npm uninstall -g @expo/cli
npm install -g @expo/cli@latest

# Clear Expo cache
expo logout
expo login
```

**Node Modules Corruption**
```bash
# Complete reset
rm -rf node_modules
rm package-lock.json
npm cache clean --force
npm install
```

### iOS Simulator Issues

**Simulator Won't Boot**
```bash
# Reset all simulators
xcrun simctl shutdown all
xcrun simctl erase all
xcrun simctl list devices

# Start specific device
xcrun simctl boot "iPhone 15 Pro"
open -a Simulator
```

**App Won't Install on Simulator**
```bash
# Reset app installation
xcrun simctl uninstall booted com.serveai.restaurantalerts
xcrun simctl install booted <path-to-app>

# Clear app data
xcrun simctl privacy booted reset all com.serveai.restaurantalerts
```

**Touch/Gesture Issues**
- Ensure Hardware → Touch ID is enabled
- Check Accessibility Inspector is disabled
- Restart simulator if gestures become unresponsive

### Build and Compilation Errors

**TypeScript Errors**
```bash
# Check TypeScript configuration
npm run type-check

# Clear TypeScript cache
rm -rf node_modules/.cache/typescript
npx tsc --build --clean
```

**Metro Resolution Errors**
```bash
# Reset Metro resolver cache
npx expo start --clear
rm -rf node_modules/.cache/metro

# Check babel.config.js path resolution
```

**Expo Prebuild Issues**
```bash
# Clean prebuild
rm -rf ios android
npx expo prebuild --clean

# Platform-specific prebuild
npx expo prebuild --platform ios
```

## 📱 Notification Debugging

### Permission Issues

**Notifications Denied**
1. **Check Permission Status**:
   ```javascript
   import * as Notifications from 'expo-notifications';
   
   const checkPermissions = async () => {
     const { status } = await Notifications.getPermissionsAsync();
     console.log('Permission status:', status);
   };
   ```

2. **Request Permissions Again**:
   ```javascript
   const requestPermissions = async () => {
     const { status } = await Notifications.requestPermissionsAsync({
       ios: {
         allowAlert: true,
         allowBadge: true,
         allowSound: true,
         allowAnnouncements: true,
       },
     });
   };
   ```

3. **Reset Permissions** (iOS Simulator):
   ```bash
   xcrun simctl privacy booted reset notifications
   ```

### Notification Delivery Issues

**Local Notifications Not Appearing**
```javascript
// Debug notification scheduling
const debugNotification = async () => {
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Test Notification",
        body: "This is a test",
        sound: true,
      },
      trigger: {
        seconds: 2,
      },
    });
    console.log('Notification scheduled:', notificationId);
  } catch (error) {
    console.error('Notification error:', error);
  }
};
```

**Sound Not Playing**
1. Check device volume and silent mode
2. Verify sound file exists in assets
3. Test with default system sound:
   ```javascript
   sound: 'default'
   ```

### Background Notifications

**App in Background Issues**
- Verify `expo-notifications` background handling is set up
- Check iOS background app refresh settings
- Test notification categories and actions

## 🗄️ Data and Storage Issues

### AsyncStorage Problems

**Data Not Persisting**
```javascript
// Debug storage operations
import AsyncStorage from '@react-native-async-storage/async-storage';

const debugStorage = async () => {
  try {
    // Test write
    await AsyncStorage.setItem('test', 'value');
    
    // Test read
    const value = await AsyncStorage.getItem('test');
    console.log('Storage test:', value);
    
    // List all keys
    const keys = await AsyncStorage.getAllKeys();
    console.log('All storage keys:', keys);
  } catch (error) {
    console.error('Storage error:', error);
  }
};
```

**Storage Quota Exceeded**
```bash
# Clear all AsyncStorage data
xcrun simctl privacy booted reset all com.serveai.restaurantalerts

# Or programmatically:
AsyncStorage.clear()
```

**Corrupted Storage Data**
```javascript
// Validate and clean storage
const validateStorage = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    for (const key of keys) {
      const value = await AsyncStorage.getItem(key);
      try {
        JSON.parse(value);
      } catch {
        console.warn(`Corrupted data for key: ${key}`);
        await AsyncStorage.removeItem(key);
      }
    }
  } catch (error) {
    console.error('Storage validation error:', error);
  }
};
```

## 🔐 Permission and Security Issues

### iOS Permissions

**Camera/Microphone Access**
- Not currently used in prototype
- Future features may require camera permissions for QR codes

**Location Services**
- Not implemented in current version
- May be added for location-based alerts

**Background Processing**
```javascript
// Check background capabilities
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';

const checkBackgroundCapabilities = async () => {
  const status = await BackgroundFetch.getStatusAsync();
  console.log('Background fetch status:', status);
};
```

## 🧪 Testing Issues

### Jest Test Failures

**Test Environment Setup**
```bash
# Reset test environment
rm -rf coverage
npm run test -- --clearCache

# Run tests with verbose output
npm run test -- --verbose --no-cache
```

**Mock Issues**
```javascript
// Common mocks for testing
jest.mock('expo-notifications', () => ({
  scheduleNotificationAsync: jest.fn(),
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));
```

### E2E Testing Issues

**Detox Configuration**
```bash
# Rebuild Detox
npm run test:e2e:build

# Run specific test
npm run test:e2e -- --configuration ios.sim.debug
```

## 🔍 Debugging Tools and Techniques

### React Native Debugger

**Setup Remote Debugging**
1. Install React Native Debugger
2. Enable Debug JS Remotely in app
3. Open debugger on port 8081

**Console Logging**
```javascript
// Structured logging for debugging
const logger = {
  alert: (message, data) => console.log('[ALERT]', message, data),
  notification: (message, data) => console.log('[NOTIFICATION]', message, data),
  storage: (message, data) => console.log('[STORAGE]', message, data),
  error: (message, error) => console.error('[ERROR]', message, error),
};
```

### Performance Debugging

**Memory Leaks**
```javascript
// Monitor component mount/unmount
useEffect(() => {
  console.log('Component mounted:', ComponentName);
  return () => {
    console.log('Component unmounted:', ComponentName);
  };
}, []);
```

**Render Performance**
```javascript
// Track render times
const RenderTracker = ({ children, name }) => {
  const renderStart = performance.now();
  
  useEffect(() => {
    const renderEnd = performance.now();
    console.log(`${name} render time:`, renderEnd - renderStart, 'ms');
  });
  
  return children;
};
```

### Network Debugging

**API Request Monitoring**
```javascript
// Network request interceptor
const originalFetch = global.fetch;
global.fetch = (...args) => {
  console.log('[FETCH]', args[0]);
  return originalFetch(...args)
    .then(response => {
      console.log('[FETCH RESPONSE]', response.status);
      return response;
    });
};
```

## 🆘 When All Else Fails

### Complete Reset Procedure

**Nuclear Option**
```bash
# 1. Reset everything
rm -rf node_modules
rm package-lock.json
rm -rf ios android
npm cache clean --force

# 2. Reset Expo
expo logout
rm -rf ~/.expo

# 3. Reset iOS Simulator
xcrun simctl shutdown all
xcrun simctl erase all

# 4. Fresh install
npm install
expo login
npx expo prebuild
npm run ios
```

### Backup Demo Strategies

**Video Fallback**
- Pre-recorded demo video showing all features
- Narrate over video explaining key points
- Have screenshots ready for specific features

**Static Presentation**
- Comprehensive slide deck with screenshots
- Detailed technical explanations
- Business value propositions

**Live Code Walkthrough**
- Show source code and architecture
- Explain implementation details
- Demonstrate testing and deployment

## 📞 Support Contacts

### Technical Support
- **Primary**: tech-support@serve-ai.com
- **Emergency**: +1-xxx-xxx-xxxx
- **Slack**: #serve-ai-support

### Documentation
- **GitHub Issues**: Internal repository issues
- **Knowledge Base**: docs.serve-ai.com
- **FAQ**: /docs/FAQ.md

### Escalation Procedures
1. **Level 1**: Self-service troubleshooting (this guide)
2. **Level 2**: Team Slack channel (#serve-ai-support)
3. **Level 3**: Direct email to tech lead
4. **Level 4**: Emergency phone contact for demo days

---

**Remember**: During live demos, confidence is key. If you encounter an issue, acknowledge it briefly, implement a quick fix or move to backup plan, and continue with enthusiasm. The audience is more interested in the business value than perfect technical execution.

*Serve AI - Prepared for any technical challenge*