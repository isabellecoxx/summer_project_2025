<?php

    require_once("init.php");
    
    // function that formats output, easier to read than var_dump()
    function debugOutput($array){

        $clean = htmlspecialchars( print_r( $array, true ) );

        echo"<pre>".$clean."</pre>";

    }

    // function to accept CORS requests from the Chrome extension
    function acceptCorsRequestsFromTheChromeExtension() {

        // Allow from any origin
        if (isset($_SERVER['HTTP_ORIGIN'])) {
            // Decide if the origin in $_SERVER['HTTP_ORIGIN'] is one
            // you want to allow, and if so:
            header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
            header('Access-Control-Allow-Credentials: true');
            header('Access-Control-Max-Age: 86400');    // cache for 1 day
        }
        
        // Access-Control headers are received during OPTIONS requests
        if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
            
            if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
                // may also be using PUT, PATCH, HEAD etc
                header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
            
            if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
                header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
        
            exit(0);
        }
    }

    function formatBoolean($value) {
        if ($value === true) {
            return "true";
        }
        else {
            return "false";
        }
    }

    // function to make OpenAIAPI request
    function callOpenAiAPI($input, $ThemeString, $RangeSlider, $ReturnFormatString){
        // send json file, authenticates with key
        $headers = [
            "Content-Type: application/json",
            "Authorization: Bearer ".openAIApiKey
        ];

        // send request to OpenAI API with the input as the prompt
        $data = [
            "model" => "gpt-4o", 
            "messages" => [
                ["role" => "user", "content" => "Given this information: ".$input."
                check for the presence of the following types of content:
                    ".$ThemeString." 
                
                Detect with a sensitivity setting of ".$RangeSlider." out of 100. The higher the score the more sensitive the output should be to even minor mentions of the content.
                If the score is low it should be relatively insensitive to mentions of the content except for extreme cases.

                If the information provided references any documented games, movies, or general media, take that into account when determining if the content is present or not.
                For example, if the video is about a game that has a lot of violence, and violence is a type of content being checked for the presence of, it should be flagged as violent even if there is no explicit mention of violence in the video.
                Or if a game, Youtuber, music artist, etc is known for its profanity, and profanity is a type of content being checked for the presence of, it should be flagged as profane even if there is no explicit mention of profanity in the video.
                    
                Please return the data in the following format. It must be valid JSON with no other content at all. Do not put ```json at the top. The first character should be {.
                $ReturnFormatString
                "
                ]
            ],
            "temperature" => 0.7
        ];

        // new curl session
        $ch = curl_init("https://api.openai.com/v1/chat/completions");
        // return response as string, attach headers, attach body as JSON
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

        // executes request and saves in response
        $response = curl_exec($ch);

        // error handling if curl_exec() failed to read request
        if (curl_errno($ch)) {
            die('request error: '.curl_error($ch));
        }

        // close session
        curl_close($ch);
        return $response;
    }
