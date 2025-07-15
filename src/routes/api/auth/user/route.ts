import type { Request, Response, NextFunction } from 'express';
import type { DynamicRoute } from '@/services/routerService';
import { isAuthenticated } from '@/middlewares/auth';

const GET = async (req: Request, res: Response) => {
    try {
        return res.status(200).json(req.user);
    }
    catch (err) {
        req.logger.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export default {
    middlewares: [isAuthenticated],
    GET,
} as DynamicRoute;