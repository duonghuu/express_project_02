import { connectDB } from '@config/database';
import { Responsys } from '@models/Responsys';

export const ResponsysRepository = {
    async getRepo() {
        const db = await connectDB();
        return db.getMongoRepository(Responsys);
    },

    async create(data: Partial<Responsys>) {
        const repo = await this.getRepo();
        const result = await repo.insertOne({
            ...data,
            createdAt: new Date(),
        });
        return result;
    },
};
