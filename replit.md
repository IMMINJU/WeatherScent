# WeatherScent - AI-Powered Perfume Recommendation Service

## Overview

WeatherScent is a weather-based perfume recommendation platform that leverages AI and location data to provide personalized fragrance suggestions. The application combines real-time weather information with user preferences to create a unique perfume curation experience, enhanced by OpenAI-powered recommendations and local store integration.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Styling**: TailwindCSS with shadcn/ui component library for consistent UI design
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: Radix UI primitives wrapped in shadcn/ui components
- **Design System**: Custom color scheme with warm tones reflecting the perfume/scent theme

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Design**: RESTful API endpoints with JSON responses

### Development Environment
- **Full-stack Setup**: Single repository with client/server separation
- **Build Process**: Vite for frontend, esbuild for backend bundling
- **Development Server**: Integrated Vite dev server with Express middleware
- **Hot Reloading**: Vite HMR for frontend development

## Key Components

### Core Features
1. **Location-Based Weather Integration**
   - Browser geolocation API for user positioning
   - OpenWeather API integration for real-time weather data
   - Weather mood interpretation for perfume matching

2. **AI-Powered Recommendations**
   - OpenAI GPT-4o integration for intelligent perfume suggestions
   - Context-aware prompting based on weather, preferences, and user history
   - Confidence scoring for recommendation quality

3. **User Preference System**
   - Interactive preference testing with multiple-choice questions
   - Category-based preference storage (fresh, floral, woody, oriental)
   - Intensity and occasion-based filtering

4. **Interactive Chat Interface**
   - Real-time chat with AI perfume consultant
   - Context-aware responses incorporating weather and user data
   - Quick suggestion prompts for common queries

5. **Wishlist Management**
   - Personal perfume collection tracking
   - Add/remove functionality with persistence
   - Integration with recommendation system

### Database Schema
- **Users**: Basic user information and preferences storage
- **Perfumes**: Comprehensive perfume database with notes, ratings, and metadata
- **Recommendations**: Historical recommendation tracking with context
- **Wishlist**: User-specific perfume collections
- **Chat Messages**: Conversation history for personalized experience
- **Preference Tests**: User preference analysis results

## Data Flow

1. **Initial Setup**
   - User grants location permission
   - System fetches current weather data via OpenWeather API
   - Weather data processed to generate mood context

2. **Preference Collection**
   - Optional preference test guides user through fragrance categories
   - Results stored in database for future recommendations
   - Preferences influence AI prompting strategy

3. **Recommendation Generation**
   - Weather data + user preferences sent to OpenAI
   - AI generates personalized perfume suggestions with reasoning
   - Results cached and displayed with detailed information

4. **User Interaction**
   - Users can chat with AI for additional recommendations
   - Wishlist functionality allows saving preferred fragrances
   - All interactions logged for improving future suggestions

## External Dependencies

### APIs and Services
- **OpenWeather API**: Real-time weather data retrieval
- **OpenAI API**: GPT-4o for intelligent recommendations and chat
- **Neon Database**: Serverless PostgreSQL hosting
- **Kakao Map/Local API**: Planned for store location features

### Key Libraries
- **Frontend**: React, TanStack Query, Wouter, Radix UI, TailwindCSS
- **Backend**: Express, Drizzle ORM, OpenAI SDK
- **Development**: Vite, TypeScript, esbuild

### Database Provider
- **Neon Database**: Serverless PostgreSQL with connection pooling
- **Drizzle Kit**: Database migrations and schema management
- **Environment Variable**: `DATABASE_URL` for database connection

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds React app to `dist/public`
- **Backend**: esbuild bundles Express server to `dist/index.js`
- **Single Artifact**: Combined build output for unified deployment

### Environment Configuration
- **Development**: Local development with Vite dev server
- **Production**: Express serves static files and API routes
- **Environment Variables**: OpenAI API key, weather API key, database URL

### Database Management
- **Schema**: Defined in `shared/schema.ts` with Drizzle ORM
- **Migrations**: Generated in `./migrations` directory
- **Push Strategy**: `drizzle-kit push` for schema updates

The architecture prioritizes developer experience with TypeScript throughout, type-safe database operations, and a modern React development workflow while maintaining production readiness with proper build optimization and deployment strategies.