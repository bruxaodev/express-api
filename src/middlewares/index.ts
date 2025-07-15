import type { Request, Response, NextFunction } from "express";

export function cookieParser(req: Request, res: Response, next: NextFunction) {
    if (req.headers.cookie) {
        const cookies = req.headers.cookie.split(";");
        req.cookies = cookies.reduce((acc: any, cookie: string) => {
            const [key, value] = cookie.split("=");
            if (!key?.trim()) return
            acc[key.trim()] = value?.trim();
            return acc;
        }, {});
    }
    next();
}

export function allowCors(req: Request, res: Response, next: NextFunction) {
    const origin = req.headers.origin || "";
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization",
    );
    res.setHeader("Access-Control-Allow-Credentials", "true");
    next();
}