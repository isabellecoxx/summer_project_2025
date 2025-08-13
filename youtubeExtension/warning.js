function isYouTubeVideoPage() {
  return window.location.href.includes("youtube.com/watch?v=");
}

function getYoutubevideoId() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('v');
}

function sendRatingToggles(videoId, reviewThemes, rangeSlider, onResponse) {

  // encode reviewThemes and rangeSlider as JSON strings to become URL parameters
  const jsonReviewThemes = encodeURIComponent(JSON.stringify(reviewThemes));
  const jsonRangeSlider = encodeURIComponent(rangeSlider);

  const xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function () {
    if (xhttp.readyState === 4 && xhttp.status === 200) {
      onResponse(xhttp.responseText.trim());
    }
  };

  xhttp.open(
    "GET",
    `http://localhost:8888/summer_project_2025/connectOpenAIAPI.php/?videoId=${videoId}&reviewThemes=${jsonReviewThemes}&rangeSlider=${jsonRangeSlider}`,
    true
  );

  xhttp.send();
}

function separateRatingResponse(fullResponse) {

  // seperates the response into summary and explanation
  if (fullResponse.startsWith("no content warnings")) {
    const phrase = "no content warnings";

    // summary is the phrase, explanation is the rest of the response
    return{
      summary: fullResponse.slice(0, phrase.length),
      explanation: fullResponse.slice(phrase.length).trim()
    };

  }
  else if (fullResponse.includes("detected")) {
    const detectedIndex = fullResponse.indexOf("detected");

    // summary is everything before "detected", explanation is everything after
    return{
      summary: fullResponse.slice(0, detectedIndex + "detected".length),
      explanation: fullResponse.slice(detectedIndex + "detected".length).trim()
    };

  }

  // if no specific format is found, return the full response as summary and empty explanation
  return { summary: fullResponse, explanation: "" };
}


function retrieveRating() {

  // retrieve toggle states and range slider values from storage
  chrome.storage.sync.get(['toggleStates', 'my-range'], function (items) {

    let reviewThemes = {};

    // checks for toggle object in storage and saves the object to reviewThemes
    if (items.toggleStates && typeof items.toggleStates === 'object') {
      reviewThemes = { ...items.toggleStates };
    }

    let checkboxes = document.querySelectorAll('#toggle-box input[type="checkbox"]');

    // updates save state of checkboxes in reviewThemes
    checkboxes.forEach(checkbox => {
      if (checkbox.id) {
        reviewThemes[checkbox.id] = checkbox.checked;
      }
    });

    const videoId = getYoutubevideoId();

    const rangeSlider = items['my-range'] || null;

    const summaryDiv = document.getElementById("custom-middle");
    const dropdownDiv = document.getElementById("rating-dropdown");

    // set initial text content for summary and dropdown elements while waiting for a response
    if (summaryDiv) {
      summaryDiv.textContent = "Loading...";
    }
    if (dropdownDiv) {
      dropdownDiv.textContent = "Checking content warnings...";
    }

    // send the rating request with the videoId, reviewThemes, and rangeSlider
    sendRatingToggles(videoId, reviewThemes, rangeSlider, function (fullResponse) {
      
      const { summary, explanation } = separateRatingResponse(fullResponse);
  
      // update summary and dropdown text content with the response
      if (summaryDiv) {
        summaryDiv.textContent = summary;
      }
      if (dropdownDiv) {
        dropdownDiv.textContent = explanation;
      }
    });
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
    ratingContainer.classList.add('rating-container');

    // insert img in container div
    const icon = document.createElement('img');
    icon.src = chrome.runtime.getURL('warning.png'); 
    icon.alt = 'Rating icon';
    icon.classList.add('icon');

    // insert rating in container div
    const rating = document.createElement('div');
    rating.id = 'custom-middle';
    rating.className = 'style-scope ytd-masthead';
    rating.textContent = "Loading...";
    rating.style.color = 'white';
      
    // dropdown tooltip text box
    const dropdown = document.createElement('div');
    dropdown.id = 'rating-dropdown';
    dropdown.textContent = "Filler description text goes here. More info about this rating.";
    dropdown.classList.add('dropdown');
      
    // show/hide dropdown on hover 
    ratingContainer.addEventListener('mouseenter', () => {
      dropdown.style.display = 'block';
    });
    ratingContainer.addEventListener('mouseleave', () => {
      dropdown.style.display = 'none';
    });
      
    ratingContainer.append(icon, rating, dropdown);

    // insert before center div
    container.insertBefore(ratingContainer, center);

    retrieveRating();
  }
}

function removeRating() {

  const rating = document.getElementById('rating-container');

  if (rating) {
    rating.remove();
  }

}


let lastVideoId = null;

// observer that watches for video changes
const observer = new MutationObserver(() => {

  if (isYouTubeVideoPage()) {
    const currentVideoId = getYoutubevideoId();

    // run only when the video has changed
    if (currentVideoId && currentVideoId !== lastVideoId) {
      console.log("new video: ", currentVideoId);
      lastVideoId = currentVideoId;

      // if container is already injected, just update the rating
      if (document.getElementById('custom-middle')) {
        retrieveRating();
      }
      else {
        insertRating();
      }
    }
  }
  else {
    // if not on a video page, remove the rating
    removeRating();
    lastVideoId = null;
  }

});

observer.observe(document.body, { childList: true, subtree: true });
