# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UIGen is an AI-powered React component generator with live preview and code editing. Users describe components in natural language, Claude AI generates React code via tool calls into a virtual file system (no disk writes), and a live preview renders instantly in a sandboxed iframe.

## Commands

```bash
npm run setup          # Install deps, generate Prisma client, run migrations
npm run dev            # Start dev server (Next.js + Turbopack on :3000)
npm run build          # Production build
npm run lint           # ESLint
npm run test           # Vitest (all tests)
npx vitest run <path>  # Run a single test file
npm run db:reset       # Reset database (destructive)
```

## Tech Stack

- **Framework**: Next.js 15 (App Router, Turbopack), React 19, TypeScript 5 (strict)
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **AI**: Vercel AI SDK + Anthropic SDK, Claude Haiku 4.5 (falls back to mock provider without API key)
- **Database**: SQLite via Prisma ORM (schema in `prisma/schema.prisma`, client generated to `src/generated/prisma`)
- **Auth**: JWT (jose) + bcrypt, HTTP-only cookies, 7-day sessions
- **Editor**: Monaco Editor, Babel Standalone for client-side JSX transform
- **Testing**: Vitest + React Testing Library (jsdom)

## Architecture

### Request Flow for AI Generation
1. User sends chat message → `POST /api/chat` with message + serialized virtual file system
2. Server streams response via `streamText()` with Claude + two tools: `str_replace_editor` (view/create/edit files) and `file_manager` (rename/delete)
3. Client-side tool call handler in `ChatContext` applies file operations to the virtual FS
4. Preview pipeline: JSX → Babel transform → import map with blob URLs → sandboxed iframe

### Key Abstractions
- **VirtualFileSystem** (`src/lib/file-system.ts`): In-memory file tree that serializes to JSON for Prisma storage and API transmission. All file operations go through this class.
- **ChatContext** (`src/lib/contexts/chat-context.tsx`): Wraps Vercel `useChat()`, handles tool call routing to file system operations, manages AI conversation state.
- **FileSystemContext** (`src/lib/contexts/file-system-context.tsx`): React context for file operations and selection state.
- **Provider** (`src/lib/provider.ts`): Returns real Anthropic model or deterministic mock when no API key is set.

### Auth & Persistence
- Server actions in `src/actions/` handle sign-up/sign-in/sign-out and project CRUD
- Anonymous users get localStorage-based state tracking (`anon-work-tracker.ts`); signing in converts anonymous work into a persisted project
- Projects store messages and file system data as stringified JSON in SQLite

### Database Models
- **User**: id, email, password (hashed), projects (one-to-many)
- **Project**: id, name, userId (optional), messages (JSON string), data (JSON string of FileNode tree)

## Conventions

- Path alias `@/*` maps to `src/*` for all imports
- AI-generated components must have a root `/App.jsx` entry point styled with Tailwind (no inline styles, no HTML files)
- Server-only modules use `"server-only"` import guard
- shadcn/ui components live in `src/components/ui/`; config in `components.json`
- System prompt for generation is in `src/lib/prompts/generation.tsx`
- AI tool schemas use Zod validation (`src/lib/tools/`)
- Use comments sparingly. Only comment complex code.
