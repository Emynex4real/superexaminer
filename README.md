# SuperExaminer

An AI-powered examination and quiz generation platform built with Next.js and Supabase.

## Features

- Document upload and processing (PDF, DOCX)
- AI-powered question generation
- Interactive quiz system
- Learning analytics and progress tracking
- User authentication and profiles
- Export functionality

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Backend**: Supabase (Database, Auth, Storage)
- **AI**: DeepSeek Integration
- **Deployment**: Vercel

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Run the development server: `npm run dev`

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

- Supabase project URL and keys
- DeepSeek API key for AI features
- Vercel Blob token for file uploads

## Database Setup

Run the SQL scripts in the `scripts/` folder on your Supabase instance:

1. `001_create_database_schema.sql`
2. `002_create_profile_trigger.sql`

## Deployment

This project is optimized for deployment on Vercel with automatic GitHub integration.