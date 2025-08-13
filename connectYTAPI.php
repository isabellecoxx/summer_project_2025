<?php

    include("include/init.php");
    include("env_constants.php");


    function getYoutubeData($videoId){

        // API URL to fetch video data
        $apiUrl = "https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id={$videoId}&key=".ytApiKey;

        // fetches content of the URL and returns it as string
        $response = file_get_contents($apiUrl);

        // converts json returned from file_get_contents() to php array
        $data = json_decode($response, true);

        // error handling if video not found
        if (empty($data['items'])){
            echo "video not found";
            return null;
        }
                
        // access specific (and only) video in the array  
        $video = $data['items'][0];


        // Tags (if available)
        if (!empty($video['snippet']['tags'])) {
            $tags = $video['snippet']['tags'];
            $tagsString = implode(',', $tags);
        }
        else{
            $tags = [];
            $tagsString = "none";
        }

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
        
        // return an array with keys for each important piece of information
        return [
            'title' => $video['snippet']['title'],
            'description' => $video['snippet']['description'];,
            'categoryId' => $video['snippet']['categoryId'],
            'tags' => $tags,
            'tagsString' => $tagsString,
            'rating' => $rating
        ];
    }
