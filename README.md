# GitHub Integration Dashboard

A modern, responsive Angular application that provides seamless integration with GitHub through OAuth2 authentication, allowing users to explore and analyze their GitHub data in a professional, user-friendly interface.

## 🌟 Overview

The GitHub Integration Dashboard is a comprehensive Angular application built with Angular Material and AG Grid that enables users to connect their GitHub accounts and interact with their GitHub data through an intuitive, responsive interface. The application provides real-time data visualization, advanced search capabilities, and complete GitHub data management.

## ✨ Key Features

### 🔐 Secure Authentication
- **OAuth2 Integration**: Industry-standard OAuth2 authentication flow for secure GitHub account connection
- **Session Management**: Persistent connection state with automatic restoration
- **User Profile Display**: Shows connected user's avatar, username, and connection details

### 📊 Data Visualization
- **Multiple Data Types**: Access to various GitHub collections:
  - Organizations
  - Repositories
  - Pull Requests
  - Issues
  - Commits
  - Users
  - Changelogs

- **Advanced Data Grid**: Powered by AG Grid with:
  - Server-side pagination
  - Column sorting and filtering
  - Custom cell renderers for GitHub-specific data
  - Responsive column hiding based on screen size

### 🔍 Search & Filter
- **Global Search**: Search across all columns in the current data collection
- **Column Filters**: Individual column filtering with backend integration
- **Debounced Search**: Optimized search with 300ms delay for better performance

### 🎨 Modern UI/UX
- **Angular Material Design**: Professional, consistent design language
- **Responsive Layout**: Optimized for desktop, tablet, and mobile devices
- **Beautiful Welcome Screen**: Engaging first-time user experience
- **Loading States**: Skeleton UI and progress indicators for better UX
- **Smooth Animations**: Polished transitions and hover effects

### ♿ Accessibility
- **ARIA Labels**: Comprehensive accessibility support
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Friendly**: Proper semantic HTML and ARIA attributes
- **High Contrast Mode**: Support for high contrast preferences
- **Reduced Motion**: Respects user's motion preferences

## 🏗️ Architecture

### Project Structure

```
src/app/
├── integrations/
│   └── github/
│       ├── components/
│       │   ├── github-integration.component.ts
│       │   ├── github-integration.component.html
│       │   ├── github-integration.component.scss
│       │   └── confirmation-dialog.component.ts
│       ├── services/
│       │   ├── github-auth.service.ts          # OAuth2 authentication
│       │   ├── github-data.service.ts          # Data fetching & API calls
│       │   ├── github-state.service.ts         # State management
│       │   └── github-cache.service.ts         # Data caching
│       ├── models/
│       │   ├── github-interfaces.ts            # TypeScript interfaces
│       │   ├── github-cell-renderers.ts        # Custom AG Grid renderers
│       │   └── github-column-schemas.ts        # Column definitions
│       ├── utils/
│       │   └── data-transformation.utils.ts    # Data transformation utilities
│       └── github-integration.module.ts
└── app.routes.ts
```

### Core Components

#### 1. **GitHubIntegrationComponent**
The main component that orchestrates the entire GitHub integration experience:
- Manages authentication state
- Handles OAuth2 flow
- Displays data grid
- Manages user interactions

#### 2. **Services**

**GitHubAuthService**
- Initiates OAuth2 authentication flow
- Manages authentication tokens
- Handles connection state persistence
- Provides re-sync and disconnect functionality

**GitHubDataService**
- Fetches data from backend API
- Provides entity schemas for dynamic column generation
- Handles pagination, filtering, and search parameters
- Manages API error handling and retry logic

**GitHubStateService**
- Manages persistent application state
- Stores connection information in localStorage
- Provides reactive state updates via RxJS

**GitHubCacheService**
- Implements data caching mechanism
- Reduces API calls for frequently accessed data
- Improves application performance

#### 3. **Models & Interfaces**

**Core Interfaces:**
- `GitHubUserInfo`: User profile information
- `GitHubConnectionState`: Connection status and details
- `GitHubEntityConfig`: Entity configuration and metadata
- `PaginationParams`: Pagination parameters for API calls
- `FilterParams`: Filter and search parameters

**Entity Types:**
```typescript
enum GitHubEntityType {
  ORGANIZATIONS = 'organizations',
  REPOSITORIES = 'repositories',
  PULL_REQUESTS = 'pull_requests',
  ISSUES = 'issues',
  COMMITS = 'commits',
  USERS = 'users',
  CHANGELOGS = 'changelogs'
}
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Angular CLI (`npm install -g @angular/cli`)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd integrations-ui
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Backend API**
   Update the API endpoint in the service files to point to your backend server.

4. **Run the development server**
   ```bash
   npm start
   ```
   or
   ```bash
   ng serve
   ```

5. **Open the application**
   Navigate to `http://localhost:4200/` in your browser.

### Build for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## 🔧 Configuration

### Environment Variables

Configure your backend API endpoints in the service files:

```typescript
// src/app/integrations/github/services/github-auth.service.ts
private readonly API_BASE_URL = 'https://your-backend-api.com';
```

### OAuth2 Configuration

Ensure your backend is configured with:
- GitHub OAuth App credentials (Client ID and Secret)
- Proper redirect URIs
- Required GitHub API scopes

## 📱 Responsive Design

The application is fully responsive with breakpoints for:

- **Mobile**: ≤ 767px
  - Simplified layout
  - Touch-optimized controls
  - Reduced column visibility
  - Vertical navigation

- **Tablet**: 768px - 1023px
  - Balanced layout
  - Most features visible
  - Optimized spacing

- **Desktop**: ≥ 1024px
  - Full feature set
  - All columns visible
  - Maximum data density

## 🎨 Theming

The application uses Angular Material theming with a custom color palette:

**Primary Colors:**
- Primary: Purple gradient (#667eea to #764ba2)
- Accent: Material accent colors
- Warn: Material warn colors

**Background:**
- Light gradient background (#f5f7fa to #c3cfe2)

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run end-to-end tests
npm run e2e
```

## 📦 Dependencies

### Core Dependencies
- **Angular**: v20.x - Modern web framework
- **Angular Material**: v20.x - UI component library
- **AG Grid**: v34.x - Advanced data grid
- **RxJS**: v7.x - Reactive programming library

### Development Dependencies
- **TypeScript**: v5.x - Type-safe JavaScript
- **Jasmine**: v5.x - Testing framework
- **Karma**: v6.x - Test runner

## 🔐 Security

- OAuth2 authentication for secure GitHub access
- No storage of GitHub credentials in the application
- Token-based authentication with backend API
- Secure HTTP-only cookie handling (backend)
- HTTPS required for production deployment

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🐛 Known Issues

- None at this time

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.

## 🗺️ Roadmap

### Planned Features
- [ ] Dark mode support
- [ ] Export data to CSV/Excel
- [ ] Advanced analytics dashboard
- [ ] Custom column configuration
- [ ] Saved search filters
- [ ] Real-time data updates via WebSocket
- [ ] Multi-account support
- [ ] GitHub Actions integration

## 📚 Documentation

For detailed documentation, please refer to:
- [Requirements Document](.kiro/specs/github-integration-module/requirements.md)
- [Design Document](.kiro/specs/github-integration-module/design.md)
- [Implementation Tasks](.kiro/specs/github-integration-module/tasks.md)

## 🙏 Acknowledgments

- Angular Team for the amazing framework
- Material Design team for the design system
- AG Grid team for the powerful data grid component
- GitHub for the comprehensive API

---

**Built with ❤️ using Angular and Material Design**
