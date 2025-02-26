import express from 'express';
import { pool } from '../server.js'; // Se till att server.js exporterar pool
import bcrypt from 'bcrypt';

const router = express.Router();

/**
 * Huvudroute för inloggning.
 */
router.post('/', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Hämta användaren från databasen
        const user = await getUserByUsername(username);
        if (!user) return res.status(401).json({ message: "Felaktig användarnamn eller lösenord" });
        console.log(result.rows);
        // Verifiera lösenordet
        const isMatch = await verifyPassword(password, user.hashpassword);
        if (!isMatch) return res.status(401).json({ message: "Felaktig användarnamn eller lösenord" });
        console.log(result.rows);
        // Skicka tillbaka användarinfo (OBS! Bäst att använda JWT eller sessionshantering för säkerhet)
        res.json({ message: "Inloggning lyckades!", user });

    } catch (err) {
        console.error("Inloggningsfel:", err);
        res.status(500).send("Serverfel vid inloggning");
    }
});

/**
 * Hämtar en användare från databasen baserat på e-post.
 * @param {string} username - Användarens e-postadress.
 * @returns {object|null} - Returnerar användarobjektet om det finns, annars null.
 */
async function getUserByUsername(username) {
    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
        console.error("Fel vid hämtning av användare:", error);
        return null;
    }
}

/**
 * Jämför användarens lösenord med det hashade lösenordet i databasen.
 * @param {string} inputPassword - Användarens inskrivna lösenord.
 * @param {string} hashedPassword - Hashat lösenord från databasen.
 * @returns {boolean} - Returnerar true om lösenorden matchar, annars false.
 */
async function verifyPassword(inputPassword, hashedPassword) {
    try {
        return await bcrypt.compare(inputPassword, hashedPassword);
    } catch (error) {
        console.error("Fel vid lösenordsverifiering:", error);
        return false;
    }
}

export default router;
