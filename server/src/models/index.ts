import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

import { config } from '../config/config';

if (!config.databaseUrl) {
	throw new Error('DATABASE_URL is required to initialize Prisma');
}

const pool = new Pool({
	connectionString: config.databaseUrl,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

export default prisma;
