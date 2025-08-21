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

    // variable that will hold the message to ask ChatGPT
    $input = "The video has a title of '".$video['title']."' a description of '".$video['description']."' a category id of ".$video['categoryId']." a rating of ".$video['rating']." and the following tags: ".$video['tagsString'];

    $ThemeString = "";
    foreach($ThemesToReview as $Theme=>$Value) {
        if($Value){
            $cleanTheme = str_replace('-', ' ', $Theme);
            $ThemeString .= "- ".$cleanTheme."\n";
        }
    }

    $ReturnFormatString = "{\n";
    foreach($ThemesToReview as $Key => $Value){
        $cleanKey = str_replace('-', ' ', $Key);
        if($Value){
            $ReturnFormatString .= "\"$cleanKey\": true/false //".$cleanKey." present or not\n";
        }
        else{
            $ReturnFormatString .= "\"$cleanKey\": null //we aren't checking for this, so ignore it\n";
        }
    }

    $ReturnFormatString .= "\"Description\": \"A few sentence paragraph explaining which content was flagged and why, in simple terms, without referencing sensitivity settings, tags, metadata, or backend logic.
    It may vaguely reference content detected from the provided information or explain that a particular piece of media (e.g., a game, movie, or show) contains the flagged content, but should avoid any explicit mention of how the information was obtained or any technical details.\"\n}";
    $response = callOpenAiAPI($input, $ThemeString, $RangeSlider, $ReturnFormatString);

    // decode the response from OpenAI API
    $result = json_decode($response, true);
    $text = $result['choices'][0]['message']['content'];
    $textDecoded = json_decode($text, true);

    $warnings = [];
    $description = "";

    // separate flags from description
    foreach($textDecoded as $key => $value) {
        if ($key === "Description") {
            $description = $value;
        } elseif ($value === true) {
            array_push($warnings, $key);
        }
    }

    // output content warning summary
    if (empty($warnings)) {
        echo "no content warnings";
    } else if (count($warnings) == 1) {
        echo $warnings[0] . " detected";
    } else if (count($warnings) == 2) {
        echo implode(" and ", $warnings) . " detected";
    } else {
        echo implode(", ", $warnings) . " detected";
    }

    // output the detailed description
    if (!empty($description)) {
        echo "\n\n" . $description;
    }
