import { Router, Request, Response } from 'express';
import * as defaults from '../defaults.json';
import { Permissions } from '../enums/permissions';
import * as Logger from '../modules/logger';
import * as jwt from 'jsonwebtoken';
import * as database from '../modules/database/database';
import bcrypt from 'bcrypt';
import { authorize } from '../middlewares/auth';
import { getUsernameFromToken } from '../helpers/token';

export const user = Router();

// Helper function to generate JWT token
const generateToken = (username: string, permissions: Permissions[]): string => {
    const secret = process.env.JWT_SECRET || defaults.web.jwtSecret;
    if (!secret) throw new Error('JWT secret is not configured.');
    return jwt.sign({ username, permissions }, secret, { expiresIn: '24h' });
};

// Helper function to validate user credentials
const validateCredentials = async (username: string, password: string) => {
    const adminUser = process.env.ADMIN_USERNAME || defaults.users.admin.username;
    const adminPass = process.env.ADMIN_PASSWORD || defaults.users.admin.password;

    if (username === adminUser && password === adminPass) {
        return { isAdmin: true, permissions: [Permissions.ALL] };
    }

    const query = 'SELECT * FROM users WHERE name = ?';
    const result = await database.query(query, [username]);
    if (result.length === 0) return null;

    const user = result[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    return isPasswordValid ? { isAdmin: false, user } : null;
};

// Login route
user.post('/login', async (req: Request, res: Response) => {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400).json({ error: 'Missing username or password' });
        return;
    }

    try {
        const credentials = await validateCredentials(username, password);
        if (!credentials) {
            res.status(401).json({ error: 'Invalid username or password' });
            return;
        }

        const token = generateToken(
            username,
            credentials.isAdmin ? [Permissions.ALL] : credentials.user.permissions || []
        );
        res.status(200).json({ token });
        return;
    } catch (error) {
        Logger.error(`Login error: ${(error as Error).message}`);
        res.status(500).json({ error: 'Internal server error' });
        return;
    }
});

// Authorization route
user.post('/auth', async (req: Request, res: Response) => {
    const { username, password, action } = req.body;
    if (!username || !password || !action) {
        res.status(400).json({ error: 'Missing username, password, or action' });
        return;
    }

    try {
        const credentials = await validateCredentials(username, password);
        if (!credentials) {
            res.status(401).json({ error: 'Invalid username or password' });
            return;
        }

        const permissions = credentials.isAdmin
            ? [Permissions.ALL]
            : credentials.user.permissions || [];

        if (!permissions.includes(action) && !permissions.includes(Permissions.ALL)) {
            res.status(403).json({ error: 'Forbidden. Insufficient permissions.' });
            return;
        }

        res.status(200).json({ message: 'Action authorized' });
        return;
    } catch (error) {
        Logger.error(`Auth error: ${(error as Error).message}`);
        res.status(500).json({ error: 'Internal server error' });
        return;
    }
});

// Create user route
user.post('/create', authorize([Permissions.CREATE_USER]), async (req: Request, res: Response) => {
    const { username, password, permissions } = req.body;
    if (!username || !password || !Array.isArray(permissions)) {
        res.status(400).json({ error: 'Invalid input. Missing or incorrect data.' });
        return;
    }

    if (!permissions.every((perm) => Object.values(Permissions).includes(perm))) {
        res.status(400).json({ error: 'Invalid permissions' });
        return;
    }

    if (username === (process.env.ADMIN_USERNAME || defaults.users.admin.username)) {
        res.status(400).json({ error: 'Username already exists' });
        return;
    }

    try {
        const existingUserQuery = 'SELECT * FROM users WHERE name = ?';
        const existingUser = await database.query(existingUserQuery, [username]);
        if (existingUser.length > 0) {
            res.status(400).json({ error: 'Username already exists' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const insertQuery = 'INSERT INTO users (name, password, permissions) VALUES (?, ?, ?)';
        await database.query(insertQuery, [username, hashedPassword, JSON.stringify(permissions)]);
        res.status(201).json({ message: 'User created' });
        return;
    } catch (error) {
        Logger.error(`Create user error: ${(error as Error).message}`);
        res.status(500).json({ error: 'Internal server error' });
        return;
    }
});

// Get user permissions
user.get('/permissions', authorize(), async (req: Request, res: Response) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        res.status(401).json({ error: 'Access denied. No token provided.' });
        return;
    }

    try {
        const username = await getUsernameFromToken(token);
        if (!username) {
            res.status(401).json({ error: 'Invalid or expired token' });
            return;
        }

        
        if (username === (process.env.ADMIN_USERNAME || defaults.users.admin.username)) {
            res.status(200).json({ permissions: [Permissions.ALL] });
            return;
        }

        const query = 'SELECT permissions FROM users WHERE name = ?';
        const result = await database.query(query, [username]);
        if (result.length === 0) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        res.status(200).json({ permissions: JSON.parse(result[0].permissions) });
        return;
    } catch (error) {
        Logger.error(`Get permissions error: ${(error as Error).message}`);
        res.status(500).json({ error: 'Internal server error' });
        return;
    }
});
