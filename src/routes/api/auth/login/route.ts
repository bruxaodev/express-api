import type { Request, Response, NextFunction } from 'express';
import type { DynamicRoute } from '@/services/routerService';
import bcrypt from 'bcrypt';
import { COOKIE_OPTIONS } from '@/config';

const POST = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user = await req.services.UserService.findByEmail(email);
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const token = await req.services.JwtService.sign({
            id: user._id,
            email: user.email,
        })

        res.cookie('token', token, { ...COOKIE_OPTIONS }).status(200).json({
            message: 'Login successful',
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