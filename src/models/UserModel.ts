import type { User } from '@/types/models/User';
import { Schema, model } from 'mongoose';

const userSchema = new Schema<User>({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

export const UserModel = model<User>('User', userSchema);
