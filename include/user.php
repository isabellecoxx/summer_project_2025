<?php

    // Functions that use queries to access information from the user table
    function getUsers(){

        $users = dbQuery("
            SELECT *
            FROM user
        ")->fetchAll();

        return $users;
    }

    function getUser($userId){

        $user = dbQuery("
            SELECT *
            FROM projects
            WHERE projectId :userId",
            [
                'userId' => $userId
            ]
        )->fetch();

        return $user;

    }
