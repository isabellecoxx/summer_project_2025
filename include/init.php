<?php
    date_default_timezone_set('America/Chicago');

    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    include('connect.php');
		
    // This should happen right after connect.php (config)
    // so other functions have access to the database

    require_once('db_query.php');
    require_once('helper_functions.php');
    require_once('user.php');
	require_once("env_constants.php");
