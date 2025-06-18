<?php

    $videoUrl = 'https://www.youtube.com/watch?v=-moW9jvvMr4'; 
    $videoId = '-moW9jvvMr4';


    // DOWNLOADING THE TRANSCRIPT TO A SRV1 FILE

    // error handling if video id is invalid
    if (!$videoId) {
        die("invalid video ID");
    }

    // run command to download subtitles
    $cmd = "yt-dlp --skip-download --write-auto-sub --sub-lang en --sub-format srv1 --output '$videoId.%(ext)s' ".escapeshellarg($videoUrl);
    // not sure how i can change this...
    exec($cmd, $output, $returnVar);

    // error handling if command in exec() fails 
    if ($returnVar !== 0) {
        die("failed to download subtitles");
    }


    // PRINTING THE CONTENTS OF THE SRV1 FILE

    $subtitleFile = "$videoId.en.srv1";

    // error handling if the file wasn't properly created
    if (!file_exists($subtitleFile)) {
        die("subtitle file not found");
    }

    // loads srv1 file as xml, error handling if conversion fails
    $xml = simplexml_load_file($subtitleFile);
    if (!$xml) {
        die("failed to parse subtitle XML");
    }

    // echo out the subtitles in the file
    foreach ($xml->text as $text) {
        echo trim((string)$text)."\n";
    }
