import { MysqlDatabase } from "./mysql";
import { SqliteDatabase } from "./sqlite";
import * as defaults from '../../defaults.json';
import fs from 'fs';
import * as logger from '../logger';

let database: MysqlDatabase | SqliteDatabase | null = null;

export async function init(): Promise<void> {
    try {
        const useMysql = process.env.USE_MYSQL?.toLowerCase() === 'true' || defaults.database.useMySQL;

        if (useMysql) {
            logger.info('Initializing MySQL database connection...');
            database = new MysqlDatabase(
                process.env.MYSQL_HOST || defaults.database.mySQLLogin.host,
                process.env.MYSQL_USER || defaults.database.mySQLLogin.user,
                process.env.MYSQL_PASSWORD || defaults.database.mySQLLogin.password,
                process.env.MYSQL_DATABASE || defaults.database.mySQLLogin.database,
            );
        } else {
            logger.info('Initializing SQLite database connection...');
            const sqlitePath = process.env.SQLITE_PATH || defaults.paths.database;
            const sqliteFile = process.env.SQLITE_FILE || defaults.database.SQLiteName;

            if (!fs.existsSync(sqlitePath)) {
                logger.info(`SQLite path not found. Creating directory at: ${sqlitePath}`);
                fs.mkdirSync(sqlitePath, { recursive: true });
            }

            database = new SqliteDatabase(`${sqlitePath}/${sqliteFile}`);
        }

        if (!database) {
           logger.error('Failed to initialize database connection');
        }

        await database.connect();
        logger.info('Database successfully initialized.');
    } catch (error) {
        const errorMessage = (error as Error).message;
        logger.error(`Database initialization failed: ${errorMessage}`);
    }

    await initializeTables();
}

export async function getConnection() {
    try {
        if (!database) {
            logger.error('Database instance not initialized. Initiliazing...');
            await init();
        }
        return database.getConnection();
    } catch (error) {
        const errorMessage = (error as Error).message;
        logger.error(`Failed to get database connection: ${errorMessage}`);
    }
}

async function initializeTables() {
    try {
        const connection = await getConnection();
        
        logger.info('Initialized Tables');
    } catch (error) {
        logger.error(`Failed to initialize tables: ${(error as Error).message}`);
    }
}
