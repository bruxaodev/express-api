import { connect } from 'mongoose';
import { config, logger } from '@/config';

export async function dbConnect() {
    return await connect(config.dbUrl).then(() => logger.info('db connected'));
}
