<?php

    include("include/init.php");
    include("env_constants.php");

    function getYoutubeData(){

        // specific video IDs, API key stored in env_constants
        $videoIds = ['xuCn8ux2gbs', '1rZ5VyxZmyM', 'WV29R1M25n8', 'fYH8eSiOf5I'];

        // array that will store important information from each youtube video
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

            // Title and Description
            $title = $video['snippet']['title'];
            $description = $video['snippet']['description'];

            // Tags (if available)
            $tags=[];
            if (!empty($video['snippet']['tags'])) {
                foreach($video['snippet']['tags'] as $tag){
                    array_push($tags, $tag);
                }
            }
            else{
                $tags = "none";
            }

            // Category Id
            $categoryId = $video['snippet']['categoryId'];

            // Captions (NOT USEFUL YET SO COMMENTED OUT FOR NOW)
            // echo "<br>";
            // echo "Captions: ".$video['contentDetails']['caption']."<br>";

            // Rating
            if (!empty($video['contentDetails']['contentRating'])) {
                 if (!empty($video['contentDetails']['contentRating']['ytRating'])) {
                    $rating = $video['contentDetails']['contentRating']['ytRating'];
                 } else {
                      $rating = "rating info found, no age restriction tag";
                  }
                } else {
                $rating = "no rating";
                }

            array_push($importantContent, [$title, $description, $categoryId, $tags, $rating]);
        }

        return $importantContent;
    }
