import jwt from "jsonwebtoken";
import type { JwtPayload } from "@/types/Jwt";
import { config } from '@/config'

export class JwtService {
    constructor() { }


    public async sign(payload: any): Promise<string> {
        return jwt.sign(payload, config.jwtSecret, { expiresIn: "30d" });
    }

    public async verify(token: string) {
        try {
            return jwt.verify(token, config.jwtSecret)
        }
        catch (e) {
            return false
        }
    }

    public async decode(token: string): Promise<JwtPayload> {
        return jwt.decode(token, {
            json: true,
        }) as JwtPayload;
    }
}
