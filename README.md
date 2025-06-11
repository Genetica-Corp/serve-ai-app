# Serve AI - Restaurant Alert Notification System

![Serve AI Logo](./assets/icon.png)

> **"On-time restaurant alerts from their data"**

A React Native prototype demonstrating intelligent push notifications for restaurant operations management. Built for iOS to showcase real-time alert handling, smart prioritization, and professional presentation capabilities.

## 🎯 Project Overview

### Value Proposition
Serve AI transforms restaurant data into actionable alerts, ensuring critical issues are addressed immediately while reducing noise from low-priority notifications. The system intelligently prioritizes alerts based on business impact, time sensitivity, and operational context.

### Key Features
- **Smart Alert Prioritization**: Critical, High, Medium, and Low priority categorization
- **Real-time Notifications**: Local push notifications with custom sounds and actions
- **Operational Categories**: Inventory, Orders, Equipment, Staff, and Customer alerts
- **Professional Demo Experience**: Configurable scenarios for investor presentations
- **Offline Functionality**: Works without backend connectivity using intelligent mock data

### Target Use Cases
- **Restaurant Managers**: Immediate notification of critical operational issues
- **Multi-location Operators**: Centralized alert management across venues
- **Franchise Owners**: Standardized alert protocols and response tracking
- **Investor Demonstrations**: Professional prototype showcasing business value

## 🏗️ Architecture Overview

### System Design
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Presentation  │    │   Business      │    │   Data          │
│     Layer       │    │    Logic        │    │   Layer         │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • React Native  │◄──►│ • Alert Service │◄──►│ • AsyncStorage  │
│ • Expo Router   │    │ • Notification  │    │ • Mock Data     │
│ • Custom UI     │    │   Service       │    │ • State Store   │
│ • Navigation    │    │ • State Manager │    │ • Cache Layer   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack
- **Frontend**: React Native 0.79.3 with Expo SDK 53
- **Language**: TypeScript for type safety and development efficiency
- **State Management**: React Context API with AsyncStorage persistence
- **Navigation**: React Navigation v6 with stack and tab navigators
- **Notifications**: Expo Notifications with local push notification support
- **Storage**: AsyncStorage for offline data persistence
- **Testing**: Jest and React Native Testing Library

### Project Structure
```
serve-ai-app/
├── App.tsx                    # Main application entry point
├── src/                       # Source code directory
│   ├── components/           # Reusable UI components
│   │   ├── alerts/          # Alert-specific components
│   │   ├── navigation/      # Navigation components
│   │   └── ui/             # Basic UI elements
│   ├── screens/            # Screen components
│   │   ├── Dashboard/      # Main alert dashboard
│   │   ├── AlertDetail/    # Individual alert details
│   │   ├── Settings/       # App settings and preferences
│   │   └── History/        # Alert history and analytics
│   ├── services/           # Business logic services
│   │   ├── AlertService/   # Alert generation and management
│   │   ├── NotificationService/ # Push notification handling
│   │   ├── StorageService/ # Data persistence layer
│   │   └── MockDataService/ # Demo data generation
│   ├── contexts/           # React Context providers
│   │   ├── AlertContext/   # Global alert state management
│   │   ├── NotificationContext/ # Notification preferences
│   │   └── AppContext/     # Application state
│   ├── hooks/              # Custom React hooks
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Helper functions and constants
│   └── constants/          # App-wide constants
├── assets/                 # Static assets (images, icons)
├── docs/                   # Additional documentation
└── __tests__/             # Test files
```

## 🚀 Quick Start

### Prerequisites
- **Node.js**: Version 18.x or higher
- **npm**: Version 8.x or higher
- **Expo CLI**: `npm install -g @expo/cli`
- **iOS Simulator**: Xcode installed (macOS only)
- **Git**: For version control

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd serve-ai-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Launch iOS Simulator**
   ```bash
   npm run ios
   ```

### Alternative Setup (Expo Go)
1. Install Expo Go app on your iOS device
2. Scan the QR code from the terminal
3. The app will load directly on your device

## 📱 Running the Application

### Development Mode
```bash
# Start Metro bundler
npm start

# Run on iOS Simulator
npm run ios

# Run on Android Emulator  
npm run android

# Run in web browser
npm run web
```

### Production Build
```bash
# Create production build
expo build:ios

# Create development build for testing
expo install --fix
expo prebuild
npx expo run:ios --configuration Release
```

## 🎮 Demo Scenarios

The application includes three pre-configured demo scenarios designed for different presentation contexts:

### Scenario 1: Busy Lunch Rush
**Context**: High-volume service period with multiple concurrent issues
- **Critical**: Freezer temperature alert (45°F - food safety risk)
- **High**: 15+ orders in queue (customer service impact)
- **High**: Low stock on popular item (revenue risk)
- **Medium**: Staff scheduling conflict

### Scenario 2: Morning Prep Issues
**Context**: Pre-service preparation challenges
- **High**: Key staff member called in sick
- **Medium**: Delivery delays affecting menu availability
- **Medium**: Equipment maintenance due
- **Low**: Routine supply restocking

### Scenario 3: Evening Service
**Context**: Dinner service with customer experience focus
- **High**: Negative review requiring immediate response
- **Medium**: Payment system issues
- **Medium**: Staff overtime threshold reached
- **Low**: Special event booking confirmation

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:
```env
# Demo Configuration
DEMO_MODE=true
DEMO_SCENARIO=BUSY_LUNCH_RUSH
RESTAURANT_TYPE=FAST_CASUAL

# Notification Settings
ENABLE_PUSH_NOTIFICATIONS=true
MAX_NOTIFICATIONS_PER_HOUR=10
QUIET_HOURS_START=22:00
QUIET_HOURS_END=08:00

# Performance Settings
CACHE_EXPIRY_HOURS=24
MAX_ALERTS_STORED=1000
```

### Customization Options
- **Restaurant Types**: Fast Casual, Fine Dining, Coffee Shop, Bar
- **Alert Categories**: Inventory, Orders, Equipment, Staff, Customer, Financial
- **Priority Levels**: Critical, High, Medium, Low
- **Notification Sounds**: System default, custom alert tones
- **Demo Timing**: Configurable intervals for realistic alert generation

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test suite
npm test -- AlertService.test.ts
```

### Test Categories
- **Unit Tests**: Individual component and service testing
- **Integration Tests**: Multi-component interaction testing
- **E2E Tests**: Complete user workflow testing
- **Performance Tests**: Memory usage and responsiveness
- **Demo Tests**: Scenario-specific functionality validation

## 📊 Performance Metrics

### Target Performance
- **App Launch Time**: < 3 seconds on iOS Simulator
- **Alert Response Time**: < 500ms for all interactions
- **Memory Usage**: < 100MB during normal operation
- **Battery Impact**: Minimal background processing
- **Notification Delivery**: < 2 seconds for critical alerts

### Monitoring
- Real-time performance metrics during demo
- Memory usage tracking and optimization
- Network request monitoring (for future backend integration)
- User interaction analytics for demo insights

## 🔐 Security Considerations

### Data Protection
- **Local Storage Encryption**: Sensitive alert data encrypted
- **Permission Management**: Granular notification permissions
- **Privacy Compliance**: No personal data collection in prototype
- **Demo Data Isolation**: Mock data clearly separated from production patterns

### Production Readiness
- **API Security**: Ready for secure backend integration
- **Authentication**: User management system architecture prepared
- **Data Validation**: Input sanitization and validation implemented
- **Error Handling**: Comprehensive error recovery and logging

## 🛠️ Troubleshooting

### Common Issues

**App won't start**
```bash
# Clear Metro cache
npx expo start --clear

# Reset node modules
rm -rf node_modules package-lock.json
npm install
```

**iOS Simulator issues**
```bash
# Reset iOS Simulator
Device → Erase All Content and Settings

# Restart Metro bundler
npm start
```

**Notification permissions**
- Ensure iOS Simulator allows notifications
- Check Device Settings → Notifications
- Verify app permissions in Settings → Serve AI

**Performance issues**
- Close other apps in simulator
- Restart iOS Simulator
- Check console for memory warnings

### Debug Mode
Enable debug logging by setting `DEBUG=true` in `.env`:
```env
DEBUG=true
LOG_LEVEL=verbose
```

## 🚢 Deployment

### Demo Deployment
1. **Prepare Demo Environment**
   - Clean iOS Simulator state
   - Configure demo scenario
   - Test notification permissions

2. **Pre-Demo Checklist**
   - [ ] App launches quickly
   - [ ] All demo scenarios work
   - [ ] Notifications appear correctly
   - [ ] Performance is smooth
   - [ ] Audio/visual elements function

3. **Demo Presentation**
   - Follow DEMO_GUIDE.md for detailed steps
   - Have backup scenarios ready
   - Monitor performance during demo

### Production Considerations
While this is a prototype, the architecture supports production deployment:
- **Backend Integration**: Ready for REST API or GraphQL integration
- **Authentication**: User management system architecture prepared
- **Scalability**: Component architecture supports multi-tenant usage
- **Monitoring**: Error tracking and analytics integration points ready

## 📚 Additional Documentation

- **[Demo Guide](./docs/DEMO_GUIDE.md)**: Detailed presentation instructions
- **[API Documentation](./docs/API.md)**: Service interfaces and component props
- **[Deployment Guide](./docs/DEPLOYMENT.md)**: Production deployment instructions
- **[Architecture Specification](./SERVE_AI_ARCHITECTURE.md)**: Detailed system design
- **[Technical Specification](./SERVE_AI_SPECIFICATION.md)**: Complete project requirements

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes with tests
4. Commit changes: `git commit -m 'Add amazing feature'`
5. Push to branch: `git push origin feature/amazing-feature`
6. Open Pull Request

### Code Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Code quality enforcement
- **Prettier**: Code formatting
- **Testing**: Minimum 80% coverage for new features
- **Documentation**: Update docs for any API changes

## 📄 License

This project is proprietary and confidential. All rights reserved.

## 📞 Support

For technical issues or questions:
- **Email**: support@serve-ai.com
- **Documentation**: Check docs/ directory
- **Issues**: GitHub Issues (internal repository)

---

**Built with ❤️ for Restaurant Operations Excellence**

*Serve AI - Transforming restaurant data into actionable intelligence*