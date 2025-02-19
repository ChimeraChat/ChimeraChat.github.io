const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Koppla till Clever Cloud PostgreSQL (lägg till detta om du inte har det i server.js)
const pool = new Pool({
    user: process.env.POSTGRESQL_ADDON_USER,
    host: process.env.POSTGRESQL_ADDON_HOST,
    database: process.env.POSTGRESQL_ADDON_DB,
    password: process.env.POSTGRESQL_ADDON_PASSWORD,
    port: 5432,
});

// POST /signup – Lägg till användare i databasen
router.post('/', async (req, res) => {
    const { email, username, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            'INSERT INTO users (email, username) VALUES ($1, $2) RETURNING userID',
            [email, username]
        );

        const userID = result.rows[0].userid;

        await pool.query(
            'INSERT INTO passwords (userid, password, hashpassword) VALUES ($1, $2, $3)',
            [userID, password, hashedPassword]
        );

        res.status(201).json({ message: 'Användare skapad!', userID });
    } catch (err) {
        console.error(err);
        res.status(500).send('Fel vid registrering');
    }
});

module.exports = router;