# Content Generator API

## Setup Instructions

To run the project locally, follow these steps:

1. Create a copy of the `.env.example` file to `.env.local` and configure the necessary environment variables.

2. Install dependencies with `bun install`.

3. To start the server:
    - Use `bun run dev` to run in development mode.
    - Or `bun run dev:services` if you want to run with the database via Docker.

4. To shut down the Docker services, use `bun services:down`.

## Overview

This is a backend API for generating content, built with Express.js, TypeScript, and MongoDB. It includes user authentication, JWT handling, and dynamic routing.

## Implementing Services in Requests

To make services accessible via `req.services` (e.g., `req.services.UserService`) in your Express routes, you need to extend the Express Request interface and attach the services through a middleware. This approach ensures type safety and easy access to shared services across the application.

### 1. Typing the Request Interface

In `src/types/Global.d.ts`, extend the Express `Request` interface to include the `services` property. This provides TypeScript typings for autocompletion and error checking.

```typescript
//src/types/Global.d.ts
declare global {
	namespace Express {
		interface Request {
			services: {
				UserService: UserService;
				JwtService: JwtService;
				// Add more services here as needed
			};
		}
	}
}
```

### 2. Attaching Services in the Main Server File

In `src/index.ts`, add a middleware that instantiates and attaches the services to every incoming request. This is done early in the middleware chain.

```typescript
//src/index.ts
server.use((req, res, next) => {
	req.services = {
		UserService: new UserService(),
		JwtService: new JwtService(),
		// Add more services here
	};
	next();
});
```

### Usage in Routes

Once set up, you can access services in any route handler:

```typescript
router.get('/example', (req, res) => {
	const userService = req.services.UserService;
	// Use the service
});
```

This method promotes dependency injection and keeps your code modular and testable.

## Dynamic Routing with RouterService

The API uses a custom `RouterService` to handle dynamic route registration. This service scans directories for route files and registers them automatically, making it easy to add new endpoints without modifying the main server file.

### Initialization in index.ts

In `src/index.ts`, the `RouterService` is initialized and mounted to the Express app. It scans the specified base directory for route files.

```typescript
//src/index.ts
server.use(
	RouterService.Routes({
		baseDir: 'src/routes/api',
		routePath: '/api',
	}),
);
```

- **baseDir**: The directory to scan for route files.
- **routePath**: The base path for all registered routes (e.g., '/api').

### Creating Routes

Routes are defined in files named `route.ts` within the `src/routes/api` directory structure. The folder structure determines the URL path.

#### Static Routes

For a static route like `/api/users`, create `src/routes/api/users/route.ts`.

#### Dynamic Routes

For dynamic parameters, use brackets in folder names. For example, to create a route `/api/users/:userId`, use a folder named `[userId]` containing `route.ts`:

- Folder: `src/routes/api/users/[userId]`
- File: `src/routes/api/users/[userId]/route.ts`

Inside `route.ts`, export a `DynamicRoute` object defining HTTP methods:

```typescript
//src/routes/api/users/[userId]/route.ts
import type { DynamicRoute } from '@/services/routerService';

const route: DynamicRoute = {
	GET: (req, res) => {
		const userId = req.params.userId;
		res.json({ userId });
	},
};

export default route;
```

The `RouterService` will automatically register this as `GET /api/users/:userId`.

### Examples of Route Configurations

Here are different ways to configure routes using the `DynamicRoute` interface and `Route` type:

#### 1. Simple Function Handler

A basic GET handler without middlewares.

```typescript
// route.ts
import type { DynamicRoute } from '@/services/routerService';

const route: DynamicRoute = {
	GET: (req, res) => {
		res.json({ message: 'Hello World' });
	},
};

export default route;
```

#### 2. Handler with Per-Method Middlewares

Use an object for a method to add specific middlewares.

```typescript
// route.ts
import type { DynamicRoute } from '@/services/routerService';
import { authMiddleware } from '@/middlewares/auth';

const route: DynamicRoute = {
	POST: {
		middlewares: [authMiddleware],
		handler: (req, res) => {
			res.json({ message: 'Protected POST' });
		},
	},
};

export default route;
```

#### 3. Global Middlewares

Apply middlewares to all methods in the route.

```typescript
// route.ts
import type { DynamicRoute } from '@/services/routerService';
import { authMiddleware } from '@/middlewares/auth';

const route: DynamicRoute = {
	middlewares: [authMiddleware],
	GET: (req, res) => {
		res.json({ user: req.user });
	},
	DELETE: (req, res) => {
		res.json({ message: 'Deleted' });
	},
};

export default route;
```

#### 4. Mixed Configurations

Combine simple handlers and object-based configurations with multiple methods.

```typescript
// route.ts
import type { DynamicRoute } from '@/services/routerService';
import { authMiddleware, logMiddleware } from '@/middlewares';

const route: DynamicRoute = {
	middlewares: [logMiddleware],
	GET: (req, res) => {
		res.json({ data: 'GET response' });
	},
	PUT: {
		middlewares: [authMiddleware],
		handler: (req, res) => {
			res.json({ message: 'Updated' });
		},
	},
};

export default route;
```

These examples show the flexibility of the routing system.

#### 5. Separate Named Exports for Middlewares and Methods

With the recent update, you can now export middlewares and HTTP methods separately without using a default export. This allows for more modular route definitions.

```typescript
// route.ts
import type { Request, Response } from 'express';
import { isAuthenticated } from '@/middlewares/auth';

export const middlewares = [isAuthenticated];

export const GET = async (req: Request, res: Response) => {
  try {
    return res.status(200).json(req.user);
  }
  catch (err) {
    req.logger.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
}
```

This approach enables exporting components individually, which the RouterService will compose into a DynamicRoute.

### Features

- **Middlewares**: Add global or per-method middlewares in the route object.
- **Supported Methods**: GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD.
- **Logging**: Routes are logged upon registration.

This system allows scalable route management by simply adding files and folders.
