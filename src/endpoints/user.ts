import { Router, Request, Response } from 'express';
import * as defaults from '../defaults.json';
export const user = Router();
import { Permissions } from '../enums/permissions';
import * as Logger from '../modules/logger';
import * as jwt from 'jsonwebtoken';
import * as database from '../modules/database/database';
import bcrypt from 'bcrypt';

// Helper function to generate JWT token
const generateToken = (username: string, permissions: Permissions[]): string => {
    return jwt.sign(
        { username, permissions },
        process.env.JWT_SECRET || defaults.web.jwtSecret,
        { expiresIn: '1h' } // Set token expiration for security
    );
};

// Login route
user.post('/login', async (req: Request, res: Response) => {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
        res.status(400).json({ error: 'Missing username or password' });
        return;
    }

    try {
        const adminUser = process.env.ADMIN_USERNAME || defaults.users.admin.username;
        const adminPass = process.env.ADMIN_PASSWORD || defaults.users.admin.password;

        // Handle admin login
        if (username === adminUser && password === adminPass) {
            const token = generateToken(adminUser, [Permissions.ALL]);
            res.status(200).json({ token });
            return;
        }

        // Query for user data
        const query = 'SELECT * FROM users WHERE name = ?';
        const result = await database.query(query, [username]);

        if (result.length === 0) {
            res.status(401).json({ error: 'Invalid username or password' });
            return;
        }

        const user = result[0];

        // Compare password with the stored hash
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ error: 'Invalid username or password' });
            return;
        }

        // Generate JWT token
        const permissions: Permissions[] = user.permissions || [];
        const token = generateToken(user.name, permissions);

        res.status(200).json({ token });
    } catch (error) {
        Logger.error(`Failed to login user: ${(error as Error).message}`);
        res.status(500).json({ error: 'Internal server error' });
    }
});
