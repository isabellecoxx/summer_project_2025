<?php
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type");

    include("include/init.php");
    require_once("connectYTAPI.php");
    include("env_constants.php");

    acceptCorsRequestsFromTheChromeExtension();

    // save videoId, ThemesToReview, and RangeSlider from GET request as variables
    $videoId = $_GET['videoId'];
    $ThemesToReviewJSON = $_GET['reviewThemes'];
    $ThemesToReview = json_decode($ThemesToReviewJSON, true);
    $RangeSliderJSON = $_GET['rangeSlider'];
    $RangeSlider = json_decode($RangeSliderJSON, true);


    // retrieves video data from YouTube API and returns an array with important content
    $video = getYoutubeData($videoId);
    $stringTags = $video['tagsString'];

    // variable that will hold the message to ask ChatGPT
    $input = "The video has a title of '".$video['title']."' a description of '".$video['description']."' a category id of ".$video['categoryId']." a rating of ".$video['rating']." and the following tags: ".$stringTags;

    // send json file, authenticates with key
    $headers = [
        "Content-Type: application/json",
        "Authorization: Bearer ".openAIApiKey
    ];

    //This array maps type codes (what's sent to us from the frontend) with English descriptions for ChatGPT
    $ContentWarningTypes = [
        'Profanity' => 'Profanity',
        'Violence' => 'Violence',
        'Politics' => 'Political Content',
        'Horrer' => 'Horrer/Disturbing Themes',
        'Substances' => 'Substance Use'
    ];

    $ThemeString = "";
    foreach($ThemesToReview as $Theme=>$Value) {
        if($Value){
            $ThemeString .= "- ".$ContentWarningTypes[$Theme]."\n";
        }
    }


    $ReturnFormatString = "{\n";
    foreach($ContentWarningTypes as $Key => $Type){
        if($ThemesToReview[$Key]){
             $ReturnFormatString .= "\"$Key\": true/false //".$Type." present or not\n";
        }
        else{
            $ReturnFormatString .= "\"$Key\": null //we aren't checking for this, so ignore it\n";
        }
    }
    $ReturnFormatString .= "\n}";

    
    

    // send request to OpenAI API with the input as the prompt
    $data = [
        "model" => "gpt-4o", 
        "messages" => [
            ["role" => "user", "content" => "Given this information: ".$input."
            check for the presence of the following types of content:
                ".$ThemeString." 
            
            Detect with a sensitivity setting of ".$RangeSlider." out of 100. The higher the score the more sensitive the output should be to even minor mentions of the content.
            If the score is low it should be relatively insensitive to mentions of the content except for extreme cases.
                
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

    // decode the response from OpenAI API
    $result = json_decode($response, true);
    $text = $result['choices'][0]['message']['content'];
    $textDecoded = json_decode($text, true);
    

    // create array with keys for each content warning that was detected
    $warnings = [];
    foreach($textDecoded as $key => $value) {
        if ($value == true){
            array_push($warnings, $key);
        }
    }

    // output the warnings in a readable format
    if (empty($warnings)) {
        echo "no content warnings";
    }
    else if (count($warnings) == 1) {
        echo $warnings[0]." detected";
    }
    else if (count($warnings) == 2) {
        echo implode(" and ", $warnings)." detected";
    }
    else {
        echo implode(", ", $warnings)." detected";
    }
