<?php

    include("include/init.php");

    // specific video IDs, API key stored in env_constants
    $videoIds = ['xuCn8ux2gbs', '1rZ5VyxZmyM', 'WV29R1M25n8', 'fYH8eSiOf5I'];

    foreach($videoIds as $videoId){

        // video list youtube API 
        $apiUrl = "https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id={$videoId}&key=".apiKey;

        // fetches content of url and returns it as string
        $response = file_get_contents($apiUrl);

        // converts json returned from file_get_contents() to php array
        $data = json_decode($response, true);

        if (!empty($data['items'])) {

            // access specific (and only) video in the array
            $video = $data['items'][0];

            echo "<br>";
            echo "<br>";

            // Title and Description
            echo "Title: ".$video['snippet']['title']."<br>";
            echo "<br>";
            echo "Description: ".$video['snippet']['description']."<br>";

            // Tags (if available)
            echo "<br>";
            if (!empty($video['snippet']['tags'])) {
                // takes the array of tags and puts them into a single string, separated by a comma
                echo "Tags: ".implode(', ',$video['snippet']['tags'])."<br>";
            } else {
                echo "Tags: None<br>";
            }

            // Category Id
            echo "<br>";
            echo "Category Id: ".$video['snippet']['categoryId']."<br>";

            // Captions
            echo "<br>";
            echo "Captions: ".$video['contentDetails']['caption']."<br>";

            // Rating
            echo "<br>";
            if (!empty($video['contentDetails']['contentRating'])) {
                if (!empty($video['contentDetails']['contentRating']['ytRating'])) {
                    echo "Rating: ".$video['contentDetails']['contentRating']['ytRating']."<br>";
                } else {
                    echo "rating info found, no age restriction tag.<br>";
                }
            } else {
                echo "Rating: None<br>";
            }

            echo "<br>";
            echo "<br>";

            echo "<br><iframe width='560' height='315' src='https://www.youtube.com/embed/{$videoId}' frameborder='0' allowfullscreen></iframe>";
            

        }
        else {

            echo "video not found";

        }
    }
