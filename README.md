# Event Planner

A modern web application for creating and sharing local events, built with the MERN stack (MongoDB, Express.js, React, Node.js).

## Features

- 🎉 Create and manage events
- 👥 User authentication and authorization
- 📍 Local event discovery
- 📱 Responsive design
- 🔒 Secure API with JWT authentication

## Tech Stack

### Frontend
- [React](https://reactjs.org) - UI library
- [TailwindCSS](https://tailwindcss.com) - Utility-first CSS framework
- [React Router](https://reactrouter.com) - Client-side routing
- [Axios](https://axios-http.com) - HTTP client

### Backend
- [Node.js](https://nodejs.org) - Runtime environment
- [Express](https://expressjs.com) - Web framework
- [MongoDB](https://www.mongodb.com) - NoSQL database
- [Mongoose](https://mongoosejs.com) - MongoDB object modeling
- [JWT](https://jwt.io) - Authentication

## Development

### Prerequisites

- Node.js (v18 or higher)
- MongoDB
- Yarn or npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/KarnesTH/event-planner.git
cd event-planner
```

2. Install dependencies:
```bash
# Backend
cd backend
yarn install

# Frontend
cd ../frontend
yarn install
```

3. Set up environment variables:
```bash
# Backend
cp backend/.env.example backend/.env
# Edit .env with your values
```

4. Start development servers:
```bash
# Backend (from backend directory)
yarn start

# Frontend (from frontend directory, in a new terminal)
yarn dev
```

### Testing

```bash
# Backend tests
cd backend
yarn test

# With coverage
yarn test:coverage
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Get current user

### Events
- `GET /api/v1/events` - Get all events
- `POST /api/v1/events` - Create new event
- `GET /api/v1/events/:id` - Get specific event
- `PUT /api/v1/events/:id` - Update event
- `DELETE /api/v1/events/:id` - Delete event

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### OpenStreetMap

This OpenStreetMap is made available under the Open Database License: [ODBL](http://opendatacommons.org/licenses/odbl/1.0/). Any rights in individual contents of the database are licensed under the Database Contents License: [DBCL](http://opendatacommons.org/licenses/dbcl/1.0/)