import { Router } from 'express';
import type { Request, Response, NextFunction, RequestHandler } from 'express';
import path from 'path';
import fs from 'fs';
import { logger } from '@/config';

type Route =
    RequestHandler | {
        middlewares: RequestHandler[],
        handler: RequestHandler,
    }

export interface DynamicRoute {
    middlewares?: RequestHandler[]
    GET?: Route
    POST?: Route
    PUT?: Route
    DELETE?: Route
    PATCH?: Route
    OPTIONS?: Route
    HEAD?: Route
}

export class RouterService {
    private router: Router;

    constructor() {
        this.router = Router();
        this.router.use((req: Request, res: Response, next: NextFunction) => {
            logger.info(`[Router] ${req.method} ${req.url}`);
            next();
        });
    }

    static Routes({
        baseDir,
        routePath,
    }: {
        baseDir: string;
        routePath: string;
    }) {
        const routerService = new RouterService();
        routerService.scanRoutes({ baseDir, routePath });
        return routerService.router;
    }

    scanRoutes({
        baseDir,
        routePath,
    }: {
        baseDir: string;
        routePath: string;
    }) {
        const fullPath = path.join(process.cwd(), baseDir);
        const allFiles = fs.readdirSync(fullPath);

        for (const file of allFiles) {
            try {
                if (file === 'route.ts') {
                    const routeModule = require(path.join(fullPath, file)).default as DynamicRoute;

                    if (typeof routeModule !== 'object' || routeModule === null) {
                        logger.error(`Error ${path.join(fullPath, file)}: invlid type`);
                        continue;
                    }

                    // Middlewares globais da rota (aplicados a todos os métodos)
                    const globalMiddlewares = Array.isArray(routeModule.middlewares)
                        ? routeModule.middlewares
                        : [];

                    const supportedMethods = [
                        'GET',
                        'POST',
                        'PUT',
                        'DELETE',
                        'PATCH',
                        'OPTIONS',
                        'HEAD',
                    ];

                    let registeredMethods: string[] = [];

                    for (const method of supportedMethods) {
                        const methodKey = method.toUpperCase();
                        if ((routeModule as any)[methodKey]) {
                            const methodConfig = (routeModule as any)[methodKey];
                            let methodMiddlewares: any[] = [];
                            let handler: (req: Request, res: Response) => void;

                            if (typeof methodConfig === 'function') {
                                handler = methodConfig;
                            } else if (
                                typeof methodConfig === 'object' &&
                                typeof methodConfig.handler === 'function'
                            ) {
                                methodMiddlewares = Array.isArray(methodConfig.middlewares)
                                    ? methodConfig.middlewares
                                    : [];
                                handler = methodConfig.handler;
                            } else {
                                continue;
                            }

                            (this.router as any)[method.toLowerCase()](
                                routePath,
                                ...globalMiddlewares,
                                ...methodMiddlewares,
                                handler
                            );
                            registeredMethods.push(method.toUpperCase());
                        }
                    }

                    if (registeredMethods.length > 0) {
                        logger.info(
                            `New route registered: ${routePath} with methods: ${registeredMethods.join(', ')}`
                        );
                    } else {
                        logger.warn(
                            `No valid HTTP method found in ${path.join(fullPath, file)}.`
                        );
                    }
                } else {
                    const _path = file.replace('[', ':').replace(']', '');
                    this.scanRoutes({
                        baseDir: path.join(baseDir, file),
                        routePath: `${routePath}/${_path}`,
                    });
                }
            } catch (err) {
                logger.error(`Fail to register route ${routePath}: ${err}`);
            }
        }
    }
}