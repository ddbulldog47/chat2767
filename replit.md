# Aussie Chat - Real-time Chatroom Application

## Overview

This is a full-stack real-time chat application built with React, Express, and TypeScript. The application features an Australian-themed chatroom with AI bot integration, spam protection, and user role management. It uses PostgreSQL for data persistence and Socket.IO for real-time communication.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for client-side routing
- **Real-time Communication**: Socket.IO client
- **Build Tool**: Vite with custom configuration

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Real-time**: Socket.IO server for WebSocket connections
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **Session Management**: connect-pg-simple for PostgreSQL session storage

### Monorepo Structure
- `client/` - React frontend application
- `server/` - Express backend API and Socket.IO server
- `shared/` - Shared TypeScript schemas and types
- `migrations/` - Database migration files (Drizzle)

## Key Components

### Database Schema
- **Users Table**: Stores user information with roles (founder, bot, member)
- **Messages Table**: Chat messages with spam detection fields
- **Reactions Table**: Message reactions/emojis

### User Roles
- **Founder**: Administrative privileges with crown icon
- **Bot**: AI-powered chat assistant with robot icon
- **Member**: Regular users with standard permissions

### Real-time Features
- Live message broadcasting
- Typing indicators
- User status updates
- Reaction notifications

### UI Components
- Custom Australian-themed styling with gradients
- Responsive design with mobile support
- Comprehensive shadcn/ui component library
- Dark theme with custom CSS variables

## Data Flow

1. **Message Creation**: User types message → Frontend validates → API creates message → Socket.IO broadcasts to all clients
2. **Real-time Updates**: Socket.IO server receives events → Validates user permissions → Broadcasts to appropriate channels
3. **User Management**: In-memory storage for development, PostgreSQL for production
4. **Spam Protection**: Built-in spam scoring and filtering system

## External Dependencies

### Core Dependencies
- **Database**: Neon PostgreSQL serverless database
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Real-time**: Socket.IO for WebSocket communication
- **UI**: Radix UI primitives via shadcn/ui
- **Validation**: Zod for schema validation

### Development Tools
- **Build**: Vite with React plugin
- **Database**: Drizzle Kit for migrations
- **Styling**: PostCSS with Tailwind CSS
- **TypeScript**: Strict mode with path mapping

## Deployment Strategy

### Development
- Vite dev server for frontend hot reload
- tsx for TypeScript execution in development
- Replit-specific plugins for development environment

### Production Build
- Vite builds static frontend assets to `dist/public`
- esbuild bundles server code to `dist/index.js`
- Single production command serves both frontend and API

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (required)
- `NODE_ENV`: Environment mode (development/production)

## Changelog

Changelog:
- June 29, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.