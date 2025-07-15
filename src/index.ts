import express from 'express';
import { config, logger, dbConnect } from '@/config';
import { RouterService } from '@/services/routerService'
import { UserService } from './services/userService';
import { JwtService } from './services/jwtService';
import { handleUser } from './middlewares/auth';
import { allowCors, cookieParser } from './middlewares';

async function main() {
    await dbConnect();
    const server = express();
    server.use(express.json());
    server.use(allowCors)
    server.use(cookieParser)
    server.use((req, res, next) => {
        req.logger = logger;
        req.services = {
            UserService: new UserService(),
            JwtService: new JwtService(),
        };
        next();
    });
    server.use(handleUser);

    server.use(
        RouterService.Routes({
            baseDir: 'src/routes/api',
            routePath: '/api',
        }),
    );

    server.listen(config.port, () => {
        logger.info(`Server is running on port ${config.port}`);
    });
}

main()
    .then(() => { })
    .catch((err) => {
        logger.error(err);
        process.exit(1);
    });
