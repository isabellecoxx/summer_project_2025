<?php
    include("include/init.php");
    require_once("connectYTAPI.php");
    include("env_constants.php");

    // call function to retrieve video data from YouTube API
    $youtubeData = getYoutubeData();

    // array that will hold messages to ask ChatGPT
    $input = [];

    foreach($youtubeData as $video){
        $title = $video[0];
        $description = $video[1];
        $categoryId = $video[2];
        $tags = $video[3];
        $stringTags = implode(',', $tags);
        $rating = $video[4];

        array_push($input, "The video has a title of '".$title."' a description of '".$description."' a category id of ".$categoryId." a rating of ".$rating." and the following tags: ".$stringTags);

    }

    // send json file, authenticates with key
    $headers = [
        "Content-Type: application/json",
        "Authorization: Bearer ".openAIApiKey
    ];

    // tell OpenAI which model to use, gives message to interpret, temp is response variance
    $data = [
        "model" => "gpt-4o", 
        "messages" => [
            ["role" => "user", "content" => "Given this information: ".$input[1]." generate potential content warnings for the video in this EXACT format, no preceding words:
                Channel Name: NAME HERE
                Profanity: YES OR NO
                Violence: YES OR NO
                Political Content: YES OR NO
                Suggestive Content: YES OR NO
                Substance Use: YES OR NO
                Horror/Disturbing Themes: YES OR NO
                Safety Rating: G, PG, PG13, R"]
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

    // decode and print the result
    $result = json_decode($response, true);
    $text = $result['choices'][0]['message']['content'];
    debugOutput($text);
