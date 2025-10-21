import { redis } from '@config/redis';
import { Queue } from 'bullmq';

export const jobQueue = new Queue('taskQueue', { connection: redis });
