<?php 
    include("include/init.php");

    echo "

    <!DOCTYPE html>

    <head>
        <meta charset='utf-8' name='viewport' content='width=device-width'>
        <link rel='stylesheet' href='mainPageStyle.css'>
    </head>

    <h1 class='titleText'>Testing Summer Project Webpage</h1>

    <body style='background-color:pink;'>
    ";

    // Retrieve users from database and iterate through rows to print values

    $users = getUsers();

    foreach($users as $user){

        $id = $user['userId'];
        $name = $user['userName'];

        echo "
            <br>
            <div class='classParagraph'>
                ID: $id
            </div>
            <br>
            <div class='classParagraph'>
                Name: $name
            </div>
            <br>

        ";
    }
