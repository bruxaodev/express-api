import type { Request, Response, NextFunction } from 'express';



export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
	try {
		if (!req.user) {
			throw new Error('Unauthorized');
		}
		return next();
	}
	catch (err) {
		return res.status(401).json({
			message: 'Unauthorized',
		});
	}
};

export const handleUser = async (req: Request, res: Response, next: NextFunction) => {
	try {
		if (!req.cookies.token) {
			req.user = undefined;
			return next();
		}

		const isValid = await req.services.JwtService.verify(req.cookies.token);
		if (!isValid) {
			req.user = undefined;
			return next();
		}

		const decoded = await req.services.JwtService.decode(req.cookies.token);
		if (!decoded || !decoded.id) {
			req.user = undefined;
			return next();
		}
		const user = await req.services.UserService.findById(decoded.id);
		if (!user) {
			req.user = undefined;
			return next();
		}
		req.user = user;
		return next();
	}
	catch (err) {
		req.user = undefined;
		return next(err);
	}
}