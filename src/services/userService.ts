import { UserModel } from "@/models/UserModel";
import type { User } from "@/types/models/User";

export class UserService {
    constructor() { }

    async create(user: Omit<User, '_id'>) {
        return await UserModel.create(user);
    }

    async findById(id: string): Promise<Omit<User, 'password'> | null> {
        return await UserModel.findOne({ _id: id }, { password: 0, __v: 0 }).lean()
    }

    async findByEmail(email: string): Promise<User | null> {
        return await UserModel.findOne({ email }).lean()
    }
}