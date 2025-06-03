# Ship Maintenance Dashboard

![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-38B2AC?logo=tailwind-css&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-6.x-CA4245?logo=react-router&logoColor=white)
![Context API](https://img.shields.io/badge/Context_API-Built_in-61DAFB?logo=react&logoColor=white)
![localStorage](https://img.shields.io/badge/localStorage-Web_API-yellow?logo=javascript&logoColor=white)

A comprehensive internal system for ENTNT to efficiently manage ships, components, and maintenance jobs with an intuitive interface and powerful features for maritime fleet management.

## 📋 Table of Contents

- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Application Architecture](#-application-architecture)
- [Setup and Installation](#-setup-and-installation)
- [Usage Guide](#-usage-guide)
- [Demo Credentials](#-demo-credentials)
- [Folder Structure](#-folder-structure)
- [Data Persistence Strategy](#-data-persistence-strategy)
- [Responsive Design](#-responsive-design)
- [Known Issues and Limitations](#-known-issues-and-limitations)
- [Technical Decisions](#-technical-decisions)
- [Deployment Information](#-deployment-information)
- [Future Enhancements](#-future-enhancements)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

## 🚀 Features

### Authentication and Authorization
- **Role-based Access Control**: Different permissions for Admin, Inspector, and Engineer roles
- **Secure Login**: Form validation and credential verification
- **Protected Routes**: Authentication state persistence between sessions

### Ships Management
- **Comprehensive Fleet Overview**: List view with filtering and sorting options
- **Detailed Ship Profiles**: Technical specifications, status tracking, and history
- **Ship Registration**: Add new vessels with extensive detail fields
- **Ship Modification**: Update vessel information and status
- **Decommissioning**: Archive ships no longer in service

### Components Management
- **Component Catalog**: Categorized listing of all ship components
- **Component Details**: Specifications, installation date, maintenance history
- **Component Health Monitoring**: Status indicators and health metrics
- **Component Registration**: Add new components with linking to specific ships
- **Component Updates**: Modify specifications and track changes

### Maintenance Jobs
- **Job Creation Workflow**: Step-by-step interface for creating maintenance tasks
- **Job Assignment**: Allocate tasks to specific personnel
- **Status Tracking**: Monitor job progress from creation to completion
- **Priority Levels**: Visual indicators for job urgency
- **Filtering and Sorting**: Find relevant jobs quickly
- **Job History**: Complete audit trail of maintenance activities

### Maintenance Calendar
- **Monthly/Weekly Views**: Visualize scheduled maintenance
- **Event Details**: Click-through for comprehensive job information
- **Color Coding**: Visual differentiation of job types and statuses
- **Schedule Management**: Drag-and-drop interface for rescheduling (where implemented)

### Notification Center
- **Real-time Alerts**: Instant notifications for critical events
- **Notification History**: Log of all past notifications
- **Custom Preferences**: Configure notification types per user role

### Dashboard and Analytics
- **Key Performance Indicators**: Visual metrics of fleet health and maintenance status
- **Maintenance Efficiency Tracking**: Charts showing completion rates and times
- **Component Failure Analysis**: Identify problematic components
- **Fleet Health Overview**: At-a-glance status of all vessels

### UI/UX Features
- **Responsive Design**: Optimized for desktop, tablet, and mobile interfaces
- **Maritime Theme**: Nautical design elements and color scheme
- **Accessibility**: Designed with a11y best practices
- **Dark/Light Mode**: User preference for interface theme (where implemented)
- **Intuitive Navigation**: Logical information architecture

## 🛠️ Technology Stack

- **Frontend Framework**: React 18+
- **Routing**: React Router v6
- **State Management**: React Context API
- **Styling**: Custom CSS with maritime theme
- **UI Components**: Custom components with responsive design
- **Icons**: React Icons
- **Charts**: Recharts (if implemented)
- **Form Handling**: Custom form components with validation
- **Data Storage**: localStorage (simulating backend)
- **Animations**: CSS transitions and React animation hooks

## 🏗️ Application Architecture

The application follows a component-based architecture using React functional components with Hooks. The primary architectural elements include:

### Core Architecture
- **Component Structure**: Modular components with single responsibilities
- **Context API**: Global state management
- **Custom Hooks**: Reusable logic extraction
- **Render Props Pattern**: For component composition where needed

### State Management
The application uses React's Context API for global state management:

```jsx
// Sample context implementation
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Authentication logic
  const login = async (email, password) => {
    // Validate credentials against stored users
    // Set user state on success
  };
  
  const logout = () => {
    // Clear user state and localStorage
  };
  
  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Data Flow
1. **User Events**: UI interactions trigger event handlers
2. **State Updates**: Context providers update relevant state
3. **Re-rendering**: Components consuming context re-render with new data
4. **Side Effects**: useEffect hooks handle data persistence to localStorage

### Application Layers
- **Presentation Layer**: UI components that render data
- **State Management Layer**: Context providers that manage application state
- **Data Access Layer**: Services that interact with localStorage
- **Utility Layer**: Helper functions for common operations

## 🚀 Setup and Installation

### Prerequisites
- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher) or yarn (v1.22.0 or higher)
- Git

### Installation Steps

1. Clone the repository:
```bash
git clone https://github.com/your-username/ship-maintenance-dashboard.git
cd ship-maintenance-dashboard
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm start
# or
yarn start
```

4. The application will be available at `http://localhost:3000`

### Building for Production

```bash
npm run build
# or
yarn build
```

The build artifacts will be stored in the `build/` directory.

## 📘 Usage Guide

### Login Process
1. Navigate to the login page
2. Enter credentials for one of the pre-configured users (see [Demo Credentials](#-demo-credentials))
3. Click "Sign In"

### Navigation
- The sidebar/navbar provides access to all main sections:
  - Dashboard
  - Ships
  - Components
  - Maintenance Jobs
  - Calendar
  - Notifications

### Fleet Management
1. Navigate to the Ships section
2. View all ships in the fleet
3. Click on a ship card/row to view details
4. Use the "Add Ship" button to register a new vessel
5. Edit ship details through the ship detail page

### Managing Components
1. Navigate to the Components section
2. Browse components by category or search
3. Add new components using the "Add Component" button
4. Associate components with specific ships

### Maintenance Workflow
1. Create a new job through the Jobs section
2. Assign personnel and set priority
3. Update job status as work progresses
4. Close the job when maintenance is complete

## 🔑 Demo Credentials

Use these credentials to access the system with different role permissions:

```
Admin User:
- Email: admin@entnt.in
- Password: admin123
- Access: Full system access

Inspector:
- Email: inspector@entnt.in
- Password: inspect123
- Access: Read-only for ships, components; Can create/update jobs

Engineer:
- Email: engineer@entnt.in
- Password: engine123
- Access: Limited to assigned maintenance jobs, component details
```

## 📁 Folder Structure

The project follows a feature-based organization pattern:

```
src/
├── assets/            # Static assets like images, fonts
├── components/        # Reusable UI components
│   ├── Authentication/  # Login and auth-related components
│   ├── Calendar/        # Calendar view components
│   ├── Components/      # Ship components management
│   ├── Dashboard/       # Dashboard and analytics
│   ├── Jobs/            # Maintenance jobs management
│   ├── Layout/          # Layout components (header, footer, etc.)
│   ├── navigation/      # Navigation components
│   ├── Notifications/   # Notification system
│   ├── shared/          # Shared utility components
│   ├── Ships/           # Ship management components
│   └── ui/              # Basic UI elements (buttons, cards, etc.)
├── contexts/          # Context API providers
├── hooks/             # Custom React hooks
├── pages/             # Page components for routing
├── styles/            # Global styles and theme
└── utils/             # Utility functions and helpers
```

### Key Files
- `src/App.jsx`: Main application component with routing setup
- `src/main.jsx`: Application entry point
- `src/contexts/AuthContext.js`: Authentication state management
- `src/contexts/DataContext.js`: Global data state management

## 💾 Data Persistence Strategy

The application simulates a backend API using localStorage for data persistence:

### Implementation Approach
- **Initial Data Seeding**: Default data is loaded on first run
- **CRUD Operations**: All create, read, update, and delete operations are intercepted and persisted
- **Data Structure**: JSON objects stored with defined schema
- **Data Integrity**: Validation before storage
- **Simulated Latency**: Optional setTimeout calls to simulate API calls

### Sample Data Model
```javascript
// Ships data structure
const ships = [
  {
    id: "ship-1",
    name: "Northern Star",
    type: "Cargo Vessel",
    status: "Active",
    lastMaintenance: "2023-05-15",
    components: ["comp-1", "comp-2", "comp-3"],
    // Additional properties
  },
  // More ships
];

// Storage utility example
const shipStorage = {
  getAll: () => JSON.parse(localStorage.getItem('ships')) || [],
  add: (ship) => {
    const ships = shipStorage.getAll();
    ships.push(ship);
    localStorage.setItem('ships', JSON.stringify(ships));
  },
  // Other CRUD operations
};
```

## 📱 Responsive Design

The application is fully responsive with these key breakpoints:

- **Mobile**: 320px - 639px
- **Tablet**: 640px - 1023px
- **Desktop**: 1024px+

### Implementation Approach
- **Mobile-First**: Base styles are for mobile, then enhanced for larger screens
- **Fluid Layouts**: Using relative units and flexible grid systems
- **Breakpoint-Specific Layouts**: Different UI arrangements based on screen size
- **Touch-Friendly**: Larger hit areas on touch devices
- **Responsive Typography**: Font sizes that scale with viewport

```css
/* Example responsive component styling */
.dashboard-card {
  padding: 1rem;
  width: 100%;
  
  /* Tablet */
  @media (min-width: 640px) {
    width: calc(50% - 1rem);
  }
  
  /* Desktop */
  @media (min-width: 1024px) {
    width: calc(33.333% - 1rem);
  }
}
```

## ⚠️ Known Issues and Limitations

- **Backend Simulation**: localStorage has limited capacity (~5MB) and data can be lost if browser storage is cleared
- **No Real Authentication**: User credentials are stored and checked client-side only
- **Performance**: Complex data operations may be slow with large datasets in localStorage
- **No Offline Support**: Changes made offline may not persist correctly
- **Cross-Device Sync**: Data is device-specific and not synchronized across devices
- **Image Handling**: Limited capability for storing and managing ship/component images
- **Calendar Performance**: May slow down with many scheduled maintenance events
- **Browser Compatibility**: Best experience in modern browsers (Chrome, Firefox, Safari, Edge)

## 💡 Technical Decisions

### React + Context API
**Decision**: Used React's Context API instead of Redux for state management.
**Rationale**: The application has moderate complexity where Context API provides sufficient state management without the additional boilerplate of Redux. This approach keeps the codebase smaller and more approachable.

### localStorage for Data Persistence
**Decision**: Used localStorage to simulate a backend API.
**Rationale**: Enables creating a fully functional frontend application without requiring actual backend infrastructure. This approach allows for demonstrating all CRUD operations while keeping the project self-contained.

### Functional Components with Hooks
**Decision**: Exclusively used functional components with hooks instead of class components.
**Rationale**: Hooks provide a more concise way to use state and other React features, resulting in more readable code and better reuse of stateful logic between components.

### Feature-Based Folder Structure
**Decision**: Organized code by feature rather than by technical role.
**Rationale**: This organization makes it easier to find all files related to a specific feature (like ships or maintenance jobs) and facilitates better code cohesion and maintainability.

### Role-Based Access Control
**Decision**: Implemented role-based permissions using React Router and Context.
**Rationale**: This approach provides a secure, declarative way to control UI access based on user roles, while keeping the implementation entirely in the frontend.

## 🚀 Deployment Information

The application is deployed on [Deployment Platform] and can be accessed at:

[Live Demo URL]

### Deployment Configuration
- **Build Command**: `npm run build`
- **Output Directory**: `build/`
- **Environment Variables**: None required for the current implementation
- **Deployment Frequency**: Manual deployment upon feature completion

## 🔮 Future Enhancements

### Planned Features
1. **Real Backend Integration**: Replace localStorage with actual API calls
2. **Advanced Analytics**: More comprehensive dashboards with predictive maintenance
3. **Offline Support**: Implement service workers for offline functionality
4. **Mobile App**: Native mobile version using React Native
5. **Multi-language Support**: Internationalization for global teams
6. **Document Management**: Attach manuals and documentation to ships/components
7. **Advanced Search**: Full-text search across all entities
8. **Integration Options**: APIs for connecting with other systems
9. **Real-time Collaboration**: WebSocket integration for live updates
10. **Approval Workflows**: Multi-step approval process for critical maintenance

## 🔧 Troubleshooting

### Common Issues

#### Login Problems
- Ensure you're using credentials exactly as provided in [Demo Credentials](#-demo-credentials)
- Clear browser cache and localStorage if experiencing persistent issues
- Check browser console for error messages

#### Data Not Persisting
- Verify your browser has localStorage enabled
- Check if you've reached localStorage capacity limits
- Ensure you're not in private/incognito browsing mode

#### UI Display Issues
- Try different browsers if experiencing layout problems
- Clear cache and reload the application
- Ensure your browser is updated to the latest version

## 👥 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards
- Follow the existing code style and organization
- Write meaningful commit messages
- Add appropriate comments for complex logic
- Ensure responsive design works across breakpoints
- Write tests for new features (if applicable)

Developed for ENTNT Ship Maintenance Management System

