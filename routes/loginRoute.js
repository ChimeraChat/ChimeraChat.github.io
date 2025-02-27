/*

import express from 'express';
import bcrypt from 'bcrypt';
import { pool } from '../config/db.js';

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Hämta användaren från databasen
        const query = `
            SELECT chimerachat_accounts.userid, chimerachat_accounts.username,
                   chimerachat_accounts.email, encrypted_passwords.hashpassword
            FROM chimerachat_accounts
            JOIN encrypted_passwords ON chimerachat_accounts.userid = encrypted_passwords.userid
            WHERE chimerachat_accounts.username = $1
        `;
        const result = await pool.query(query, [username]);

        if (result.rows.length === 0) {
            return res.status(401).json({ message: "Felaktigt användarnamn eller lösenord" });
        }

        const user = result.rows[0];

        // Verifiera lösenord
        const isMatch = await bcrypt.compare(password, user.hashpassword);
        if (!isMatch) {
            return res.status(401).json({ message: "Felaktigt användarnamn eller lösenord" });
        }

        // Ta bort hash innan vi skickar tillbaka data
        delete user.hashpassword;

        res.json({ message: "Inloggning lyckades!", user });
    } catch (err) {
        console.error("❌ Inloggningsfel:", err);
        res.status(500).json({ message: "Serverfel vid inloggning" });
    }
});

export default router;


*/