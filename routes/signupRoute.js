/*

import express from 'express';
import bcrypt from 'bcrypt';
import { pool } from '../config/db.js';

const router = express.Router();

router.post('/', async (req, res) => {
    console.log("👉 Mottaget POST /signup:", req.body);
    const { email, username, password } = req.body;

    try {
        if (!email || !username || !password) {
            return res.status(400).json({ message: "Alla fält måste fyllas i." });
        }

        // Kontrollera om e-post finns
        const existingUser = await pool.query('SELECT userid FROM chimerachat_accounts WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: "E-postadressen används redan!" });
        }

        // Hasha lösenord
        const hashedPassword = await bcrypt.hash(password, 10);

        // Skapa användare
        const result = await pool.query(
            'INSERT INTO chimerachat_accounts(email, username) VALUES ($1, $2) RETURNING userid',
            [email, username]
        );

        if (result.rows.length === 0) {
            throw new Error("Misslyckades med att skapa användaren i databasen.");
        }

        const userid = result.rows[0].userid;

        // Spara lösenord i separat tabell
        await pool.query(
            'INSERT INTO encrypted_passwords(userid, hashpassword) VALUES ($1, $2)',
            [userid, hashedPassword]
        );

        res.status(201).json({
            message: 'Ditt konto har skapats! Omdirigerar till inloggningssidan...',
            redirect: '../login.html'
        });
    } catch (err) {
        console.error("❌ Fel vid registrering:", err);
        res.status(500).json({ message: "Registrering misslyckades.", error: err.message });
    }
});

export default router;

*/