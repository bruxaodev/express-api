import type { Request, Response } from 'express';
import type { DynamicRoute } from '@/services/routerService';

export default {
    middlewares: [],
    GET: (req: Request, res: Response) => {
        res.json({ route: req.params, message: 'GET ok' });
    },
    POST: (req: Request, res: Response) => {
        res.json({ route: req.params, message: 'POST ok' });
    },
} as DynamicRoute;