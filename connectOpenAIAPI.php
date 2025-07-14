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
            ["role" => "user", "content" => "Given this information: ".$input[0]."
            check for the presence of profanity, violence, political content, suggestive content, substance use, and horror/disturbing themes.
            Please return the data in the following format. It must be valid JSON with no other content at all. Do not put ```json at the top. The first character should be {.
{
    \"Channel Name\": \"NAME HERE\", // the name of the channel
    \"Profanity\": true/false, // profanity present or not
    \"Violence\": true/false, // violence present or not
    \"Political Content\": true/false, // political content present or not
    \"Suggestive Content\": true/false, // suggestive content present or not
    \"Substance Use\": true/false, // substance use present or not
    \"Horror/Disturbing Themes\": true/false, // horror/disturbing themes present or not
    \"Safety Rating\": G/PG/PG13/R // safety rating of the video
    
}"
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

    // decode and print the result
    $result = json_decode($response, true);
    $text = $result['choices'][0]['message']['content'];
    debugOutput($text);
