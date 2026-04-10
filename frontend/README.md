# Disaster Resilience Risk System - Frontend

A modern React-based frontend for managing disaster resilience projects. This application allows users to create, view, edit, and manage infrastructure projects with detailed information about their location, budget, and risk assessment status.

## Features

- **Project Management**: Create, read, update, and delete projects
- **Search & Filtering**: Filter projects by type, status, and search keywords
- **Pagination**: Browse through projects with pagination support
- **Responsive Design**: Mobile-friendly interface
- **Real-time Validation**: Form validation with immediate feedback
- **State Management**: Global state management using Zustand
- **API Integration**: Seamless integration with backend API

## Tech Stack

- **React 18**: UI library
- **Vite**: Build tool and dev server
- **React Router**: Client-side routing
- **Axios**: HTTP client
- **Zustand**: State management
- **CSS3**: Styling

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Navbar.jsx
│   │   ├── ProjectCard.jsx
│   │   ├── ProjectForm.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── ErrorAlert.jsx
│   │   └── SuccessAlert.jsx
│   ├── pages/              # Page components
│   │   ├── ProjectsList.jsx
│   │   ├── ProjectDetails.jsx
│   │   ├── CreateProject.jsx
│   │   └── EditProject.jsx
│   ├── services/           # API services
│   │   ├── api.js
│   │   └── projectService.js
│   ├── store/              # State management
│   │   └── projectStore.js
│   ├── App.jsx            # Main app component
│   ├── main.jsx           # Entry point
│   └── index.css           # Global styles
├── package.json
├── vite.config.js
└── index.html
```

## Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file for environment variables:
```env
VITE_API_URL=http://localhost:5000/api
```

## Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Building

Build for production:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## API Endpoints

The frontend communicates with the backend API at `/api`:

### Projects
- `GET /api/projects` - Get all projects with pagination and filtering
- `GET /api/projects/:id` - Get a single project
- `POST /api/projects` - Create a new project
- `PUT /api/projects/:id` - Update a project
- `DELETE /api/projects/:id` - Delete a project
- `PATCH /api/projects/:id/status` - Update project status (admin only)

## Authentication

The application uses JWT token-based authentication. The token is stored in `localStorage` and automatically attached to all API requests via the axios interceptor.

## Features in Detail

### Project Lists Page
- View all projects with pagination
- Search projects by title
- Filter by project type (bridge, road, building)
- Filter by status (draft, analyzing, approved, high risk)
- Delete projects directly from the list
- Navigate to project details

### Project Details Page
- View complete project information
- View creator information
- Edit project details
- Delete project
- Status badges with color coding
- Timeline information

### Create/Edit Project Form
- Input fields for all project properties
- Form validation
- Date range validation
- Responsive form layout
- Success/error feedback

## Styling

The application uses modern CSS3 with:
- CSS Grid for layouts
- Flexbox for alignment
- CSS variables for consistent theming
- Responsive design with media queries
- Smooth transitions and animations

## Error Handling

- Global error management with Zustand store
- User-friendly error messages
- Error alert components with dismiss option
- API error interception and handling

## Future Enhancements

- Authentication and login page
- User profile management
- Advanced project analytics
- Risk assessment integration
- Map visualization with coordinates
- Project export functionality
- Role-based access control
- Project collaboration features
- Notification system
