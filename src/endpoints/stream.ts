import { Router, Request, Response } from 'express';
import * as defaults from '../defaults.json';
import * as Logger from '../modules/logger';

export const stream = Router();

type Stream = {
    name: string;
    description: string;
};

stream.get('/get', async (req: Request, res: Response) => {
    try {
        const videoApi = process.env.VIDEO_API || defaults.video.api;
        const adminUser = process.env.ADMIN_USERNAME || defaults.users.admin.username;
        const adminPass = process.env.ADMIN_PASSWORD || defaults.users.admin.password;

        if (!videoApi || !adminUser || !adminPass) {
            await res.status(500).json({ error: 'Missing required configuration for Video API or credentials.' });
            return;
        }

        const endpoint = `${videoApi}/v3/paths/list`;
        const credentials = Buffer.from(`${adminUser}:${adminPass}`).toString('base64');

        const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${credentials}`,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            await res.status(response.status).json({ 
                error: `Video API request failed: ${errorText}` 
            });
            return;
        }

        const data: { items: Array<{ name: string; tracks: string[] }> } = await response.json();
        if (!data || !data.items) {
            await res.status(500).json({ error: 'Unexpected response structure from Video API.' });
            return;
        }

        const streams: Stream[] = data.items.map((item) => ({
            name: item.name,
            description: item.tracks.join(' • '),
        }));

        await res.status(200).json({ streams });
        return;
    } catch (error) {
        Logger.error(`Stream error: ${(error as Error).message}`);
        await res.status(500).json({ error: 'An unexpected error occurred.' });
        return 
    }
});
