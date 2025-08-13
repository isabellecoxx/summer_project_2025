function isYouTubeVideoPage() {
    return window.location.href.includes("youtube.com/watch?v=");
}

function getYoutubevideoId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('v');
}

function retrieveRating(){
    console.log("RETRIEVE RATING CALLED");
    chrome.storage.sync.get(['Profanity', 'Violence', 'Politics', 'Substances', 'Horrer', "my-range"], function(settings) {

        // retrieve the videoId from the URL
        var videoId = getYoutubevideoId();

        const {'my-range': rangeSlider, ...reviewThemes} = settings;

        //retrieve the review themes and range slider
        var jsonReviewThemes = encodeURIComponent(JSON.stringify(reviewThemes));
        console.log("JSON REVIEW THEMES: ", jsonReviewThemes);

        var jsonRangeSlider = encodeURIComponent(JSON.stringify(rangeSlider));
        console.log("JSON RANGE SLIDER: ", jsonRangeSlider);

        // create a new XMLHttpRequest object
        var xhttp = new XMLHttpRequest();

        // connect to the PHP script
        xhttp.onreadystatechange = function(){

            console.log("READY STATE: ", xhttp.readyState);
            console.log("STATUS: ", xhttp.status);

            // if the request is complete and successful then insert the response text into the custom div
            if (xhttp.readyState === 4 && xhttp.status === 200){
                document.getElementById("custom-middle").innerHTML = this.responseText;
            }
        }
        
        // open a GET request to the PHP script with the videoId as a parameter
        xhttp.open("GET", "http://localhost:8888/summer_project_2025/connectOpenAIAPI.php/?videoId=" + videoId + "&reviewThemes=" + jsonReviewThemes +"&rangeSlider=" + jsonRangeSlider, true);
        xhttp.send();
    });

}

function insertRating() {

    console.log("Inserting rating...");

    // select and save divs as variables
    const container = document.querySelector('div#container.style-scope.ytd-masthead');
    const start = container?.querySelector('#start');
    const center = container?.querySelector('#center');

    // if all divs are present and the new div hasn't already been created...
    if (container && start && center && !document.getElementById('custom-middle')) {

      // create container div for img and rating
      const ratingContainer = document.createElement('div');
      ratingContainer.id = "rating-container";
      ratingContainer.style.display = 'flex';
      ratingContainer.style.background = 'rgb(235, 25, 67)';
      ratingContainer.style.padding = '14px 25px';
      ratingContainer.style.borderRadius = '30px';
      ratingContainer.style.fontWeight = 'bold';
      ratingContainer.style.alignSelf = 'center';
      ratingContainer.style.margin = '0 12px';

      // insert img in container div
      const icon = document.createElement('img');
      icon.src = chrome.runtime.getURL('warning.png'); 
      icon.alt = 'Rating icon';
      icon.style.width = '18px';
      icon.style.height = '15px';
      icon.style.marginRight = '10px';

      // insert rating in container div
      const rating = document.createElement('div');
      rating.id = 'custom-middle';
      rating.className = 'style-scope ytd-masthead';
      rating.textContent = "Loading...";
      rating.style.color = 'white';
      retrieveRating();
      
      ratingContainer.appendChild(icon);
      ratingContainer.appendChild(rating);

      // insert before center div
      container.insertBefore(ratingContainer, center);

    }
}

function removeRating() {
    const rating = document.getElementById('rating-container');
    if (rating) {
        rating.remove();
    }
}

let lastSentVideoId = null;

// mutation observer that ensures new div remains visible when page changes
const observer = new MutationObserver(() => {
    if(isYouTubeVideoPage()){
        const currentVideoId = getYoutubevideoId();
        insertRating();

        if (currentVideoId && currentVideoId !== lastSentVideoId) {
            sendVideoIdToServer(currentVideoId);
            lastSentVideoId = currentVideoId;
        }
    }
    else{
        removeRating();
        lastSentVideoId = null;
    }
});

observer.observe(document.body, { childList: true, subtree: true });

const waitForMasthead = setInterval(() => {
    const masthead = document.querySelector('div#container.style-scope.ytd-masthead');

    if(isYouTubeVideoPage()){
        insertRating();
    }

    observer.observe(document.body, { childList: true, subtree: true });

}, 500);
