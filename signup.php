<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ChimeraChat</title>

    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="css/animate.css">

</head>
<body>
<nav>
    <div class="container">
        <ul>
            <li class="nav-item"> <a class="nav-link" href="index.html" >Home</a></li>
            <li class="nav-item"> <a class="nav-link" href="signup.php" >Sign up</a></li>
            <li class="nav-item"> <a class="nav-link" href="#" >Chat</a></li>
            <li class="nav-item"> <a class="nav-link" href="#" >Post</a></li>
            <li class="nav-item"> <a class="nav-link" href="#" >Log in</a></li>
            <li class="nav-item"> <a class="nav-link" href="#" >Log out</a></li>
            <li class="nav-item"> <a class="nav-link" href="#" >Faq</a></li>
            <li class="nav-item"> <a class="nav-link" href="#" >Contact</a></li>
        </ul>
    </div>
</nav>
<main>
    <div class="wrap">
        <div>
            <!-- Här skapar jag input-fält för registrering av användaruppgifter till databasen -->
            <form action="signup.php" method="POST">
                <div>
                    <label for="username">Username:</label>
                    <input type="text" id="username" name="username" required>
                </div>
                <div>
                    <label for="password">Password:</label>
                    <input type="password" id="password" name="password" required>
                </div>
                <div>
                    <label for="email">Email:</label>
                    <input type="email" id="email" name="email" required>
                </div>
                <div>
                    <input type="submit" name="send" value="Sign up">
                </div>
            </form>
        </div>
    </div>
</main>

<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get user inputs
    $username = $_POST['username'];
    $password = $_POST['password'];
    $email = $_POST['email'];

    // Hash the password securely
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    try {
        // Connect to PostgreSQL database
        $dsn = "pgsql:host=localhost;dbname=skola2;port=5432";
        $dbuser = "root"; // Change this to your actual DB user
        $dbpass = ""; // Change this to your actual DB password
        $pdo = new PDO($dsn, $dbuser, $dbpass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
        ]);

        // Insert user into `users` table
        $stmt = $pdo->prepare("INSERT INTO users (email, username) VALUES (:email, :username) RETURNING userID");
        $stmt->execute(['email' => $email, 'username' => $username]);

        // Get the newly created userID
        $userID = $stmt->fetchColumn();

        // Insert password into `passwords` table
        $stmt = $pdo->prepare("INSERT INTO passwords (userID, password, hashPassword) VALUES (:userID, '', :hashPassword)");
        $stmt->execute(['userID' => $userID, 'hashPassword' => $hashedPassword]);

        echo "Registreringen lyckades!";
    } catch (PDOException $e) {
        // Handle errors (e.g., username/email already exists)
        if ($e->getCode() == 23505) { // PostgreSQL unique violation
            echo "Användarnamnet eller e-posten är redan registrerad!";
        } else {
            echo "Fel: " . $e->getMessage();
        }
    }
}
?>
<p>Already have an account? Log in <a href="login.php">here</a>!</p>

<footer>
    <p>&copy; 2025 ChimeraChat. Alla rättigheter förbehållna.</p>
</footer>
</body>
</html>

