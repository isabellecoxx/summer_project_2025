<?php
    date_default_timezone_set('America/Chicago');

    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    //session_start();

    include('connect.php');
		
    // This should happen right after connect.php (config)
    // so other functions have access to the database
    // include('db_query.php');
    // include('common_components.php');
    // include('helper_functions.php');
    // include('user.php');

    require_once('db_query.php');
    require_once('common_components.php');
    require_once('helper_functions.php');
    require_once('user.php');