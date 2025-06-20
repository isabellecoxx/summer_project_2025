<?php

    include("include/init.php");
    include("env_constants.php");

    function getYoutubeData(){

        // specific video IDs, API key stored in env_constants
        $videoIds = ['xuCn8ux2gbs', '1rZ5VyxZmyM', 'WV29R1M25n8', 'fYH8eSiOf5I'];

        $importantContent = [];

        foreach($videoIds as $videoId){

            // video list youtube API 
            $apiUrl = "https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id={$videoId}&key=".ytApiKey;

            // fetches content of url and returns it as string
            $response = file_get_contents($apiUrl);

            // converts json returned from file_get_contents() to php array
            $data = json_decode($response, true);

            if (empty($data['items'])){
                echo "video not found";
                continue;
            }

            // access specific (and only) video in the array
            $video = $data['items'][0];

            // echo "<br>";
            // echo "<br>";

            // Title and Description
            // echo "Title: ".$video['snippet']['title']."<br>";
            $title = $video['snippet']['title'];
            // echo "<br>";
            // echo "Description: ".$video['snippet']['description']."<br>";
            $description = $video['snippet']['description'];

            // Tags (if available)
            // echo "<br>";
            $tags=[];
            if (!empty($video['snippet']['tags'])) {
                 // takes the array of tags and puts them into a single string, separated by a comma
                    foreach($video['snippet']['tags'] as $tag){
                        array_push($tags, $tag);
                    }
                 //echo "Tags: ".implode(', ',$video['snippet']['tags'])."<br>";
            }
            else{
                $tags = "none";
            }

            // Category Id
            // echo "<br>";
            // echo "Category Id: ".$video['snippet']['categoryId']."<br>";
            $categoryId = $video['snippet']['categoryId'];

            // Captions
            // echo "<br>";
            // echo "Captions: ".$video['contentDetails']['caption']."<br>";

            // Rating
            // echo "<br>";
            // if (!empty($video['contentDetails']['contentRating'])) {
                 if (!empty($video['contentDetails']['contentRating']['ytRating'])) {
                    //echo "Rating: ".$video['contentDetails']['contentRating']['ytRating']."<br>";
                    $rating = $video['contentDetails']['contentRating']['ytRating'];
                //  } else {
                //      //echo "rating info found, no age restriction tag.<br>";
                //      $rating = "rating info found, no age restriction tag";
                //  }
                } else {
                //echo "Rating: None<br>";
                $rating = "no rating";
                }

            // echo "<br>";
            // echo "<br>";

            // echo "<br><iframe width='560' height='315' src='https://www.youtube.com/embed/{$videoId}' frameborder='0' allowfullscreen></iframe>";

            array_push($importantContent, [$title, $description, $categoryId, $tags, $rating]);

            //debugOutput($importantContent);

                
        }

        return $importantContent;
    }
