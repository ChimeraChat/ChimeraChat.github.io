import express from 'express';
import pkg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import bcrypt from 'bcrypt';

const { Pool } = pkg;

dotenv.config();

// Koppla till Clever Cloud PostgreSQL (lägg till detta om du inte har det i server.js)
const pool = new Pool({
    user: process.env.POSTGRESQL_ADDON_USER,
    host: process.env.POSTGRESQL_ADDON_HOST,
    database: process.env.POSTGRESQL_ADDON_DB,
    password: process.env.POSTGRESQL_ADDON_PASSWORD,
    port: process.env.POSTGRESQL_ADDON_PORT,
});

// Hantera __dirname i ESM-modul
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// POST /signup – Lägg till användare i databasen
const router = express.Router();
router.post('/', async (req, res) => {
    const { email, username, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            'INSERT INTO users (email, username) VALUES ($1, $2) RETURNING userid',
            [email, username]
        );
        
        console.log("SQL Result:", result.rows);

        await pool.query(
            'INSERT INTO passwords (userid, password, hashpassword) VALUES ($1, $2, $3)',
            [userid, password, hashedPassword]
        );

        res.status(201).json({ message: 'Användare skapad!', userid });
    } catch (err) {
        console.error(err);
        res.status(500).send('Fel vid registrering');
    }
});

export default router;