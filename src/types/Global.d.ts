import { logger } from '@/config';
import { JwtService } from './../services/jwtService';
import { UserService } from './../services/userService';
import type { User } from './models/User';

declare global {
    namespace Express {
        interface Request {
            user?: Omit<User, 'password'>,
            services: {
                UserService: UserService,
                JwtService: JwtService,
            }
            logger: logger
        }
    }
}