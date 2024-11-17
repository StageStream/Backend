import express from 'express';
import * as Logger from './modules/logger';
import * as defaults from './defaults.json';
import * as database from './modules/database/database';

// Endpoints
import { user } from './endpoints/user';

async function close(): Promise<void> {
    await Logger.info('Closing server');
    await Logger.close();
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/user', user);

const port = process.env.WEB_PORT || defaults.web.port;

app.listen(port, async () => {
    const logPath = process.env.LOG_PATH || defaults.paths.logs;
    await Logger.init(logPath);
    await Logger.info(`Server started on port ${port}`);

    await database.init();
});

process.on('SIGINT', async () => {
    await close();
    process.exit(0);
});

