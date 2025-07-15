import type { Request, Response, NextFunction } from 'express';
import type { DynamicRoute } from '@/services/routerService';
import bcrypt from 'bcrypt';

const POST = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user = await req.services.UserService.findByEmail(email);
        if (user) {
            return res.status(400).json({ message: 'fail to register account' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await req.services.UserService.create({
            email,
            password: hashedPassword,
        })

        res.status(200).json({
            message: 'Register successful',
        })
    }
    catch (err) {
        req.logger.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export default {
    POST
} as DynamicRoute;