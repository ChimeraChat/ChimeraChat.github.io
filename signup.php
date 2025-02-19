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
            <li class="nav-item"> <a class="nav-link" href="" >Home</a></li>
            <li class="nav-item"> <a class="nav-link" href="#" >Sign up</a></li>
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
                    <label for="user">Username:</label>
                    <input type="text" id="user" name="user" required>
                </div>
                <div>
                    <label for="pass">Password:</label>
                    <input type="password" id="pass" name="pass" required>
                </div>
                <div>
                    <input type="submit" name="send" value="Sign up">
                </div>
            </form>
        </div>
    </div>
</main>

        <?php
        //Här skapar jag funktion för registrering.
        function register(){
            //Här lägger jag variabler för användaruppgifterna
            $username = $_POST['user'];
            $password = md5($_POST['pass']);
            //Här ansluter vi till localhost, root.
            $con = mysqli_connect("localhost","root","");
            //Här kopplar jag till databasen.
            $database = mysqli_select_db($con, "skola2");
            $sql = "select * from users2 where username = '$username'";
            $result = mysqli_query($con, $sql);
            /*If sats där användaruppgifterna läggs in i databasen men endast om
            uppgifterna inte redan finns i databasen.
            */
            if(!($row = mysqli_fetch_array($result))){
                $sql = "insert into users2(username, password) value('$username', '$password')";
                mysqli_query($con, $sql);
                echo "Registreringen lyckades!";
            }
            else{
                echo "Användarnamnet är redan taget!";
            }
            mysqli_close($con);
        }
        //If sats där användaruoppgifterna registreras OM användaren klickar på skicka/registrera.
        if(isset($_POST['skicka'])){
            register();
        }
        ?>
        <p>Har du redan ett konto? Logga in <a href="login.php">här</a>!</p>
    </div>
    </body>
    </html>

