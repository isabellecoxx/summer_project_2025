/*
This script extracts professor names from the search results page using SLU's internal API.
It first replays the last search API request to get the list of courses. This is done via the webRequest listener in background.js.
Then it parses through the JSON response to get the course codes and CRNs. It constructs payloads for the details API requests.
For the first 10 courses, it sends details API requests to get the HTML containing FULL professor names.
The names are sent to background.js to fetch RateMyProf data. They are then displayed in the search results.
*/

// fetch the last API request details from background.js and replay it to get search results
async function fetchSearchResultsFromLastRequest() {

  return new Promise((resolve, reject) => {
    // send message to background to retrieve last API request
    chrome.runtime.sendMessage({ type: "getLastApiRequest" }, async (response) => {
      // if theres no response, reject with error message
      if (!response?.data) {
        return reject(new Error("no recent request found"));
      }

      // get the request URL and payload (body)
      const { url, body } = response.data;

      // make a new POST rquest to their server using the last URL and payload
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body
        });
        // throws error if unsuccessful in API call to their server
        if (!res.ok){
          throw new Error(`Search API failed: ${res.status}`);
        }
        // parse JSON response and resolve
        const jsonData = await res.json();
        resolve(jsonData);
      } catch (err) {
        reject(err);
      }
    });
  });
}

// parse the search results JSON to extract course codes and CRNs for details requests
function parseSearchResults(jsonData) {

  // if JSON doesnt exist or isnt an array logs error 
  if (!jsonData.results || !Array.isArray(jsonData.results)) {
    console.log("jsonData doesnt exist or isnt array");
    return [];
  }

  const {srcdb} = jsonData;

  // for each object creates custom payload
  const payloads = jsonData.results.map(course => ({
    group: `code:${course.code}`,
    key: `crn:${course.crn}`,
    srcdb: srcdb,
    matched: `crn:${course.crn}`,
    userWithRolesStr: "!!!!!!"
  }));

  console.log("payloads: ", payloads);
  return payloads;
}

// fetch course details including professor names using the details API
function fetchCourseDetails(payload) {

  const url = "/api/?page=fose&route=details";

  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Details API call failed: ${response.status} ${response.statusText}`);
    }
    return response.json();
  })
  .then(data => {
    const html = data.instructordetail_html || "";
    // dreate a temporary DOM element to parse the HTML string
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    // extract only the text content inside the div
    return tempDiv.textContent.trim();
  });

}

// fetch details for multiple courses by iterating through multiple payloads
async function fetchCourseDetailsBatch(payloads) {
  const results = await Promise.all(payloads.map(fetchCourseDetails));
  return results;
}

// function to insert the ratings for each listing on the page
function insertSearchRating(professorData) {

  const listings = document.querySelectorAll('div.result.result--group-start');

  // for each class listing, find header line
  listings.forEach((listing, i) => {
    const header = listing.querySelector('.result__headline');

    // if header line exists, create rating div and add to listing 
    if (header) {
      const ratingDiv = document.createElement('div');
      ratingDiv.className = 'rating';

      let rating = null;
      let profileLink = null;

      if(professorData[i]){
        rating = professorData[i][0];
        profileLink = professorData[i][1];
      }

      if (rating !== null && profileLink) {
        ratingDiv.innerHTML = `<a href="${profileLink}" target="_blank">${rating}</a>`;
        ratingDiv.style.color = 'blue';
      } else {
        ratingDiv.textContent = 'N/A';
        ratingDiv.style.color = 'black';
      }

      header.appendChild(ratingDiv);
    }
  });
}

// main function to orchestrate fetching and displaying professor info
async function renderSearchResultsColumn() {

  console.log("RENDERING SEARCH RESULTS COLUMN");

  try {
    // get JSON data from most recent API call (general search results info)
    const searchResults = await fetchSearchResultsFromLastRequest();

    // call helper function to retrieve the custom payloads of the first 10 listings
    const payloads = parseSearchResults(searchResults);
    const first10Payloads = payloads.slice(0, 10);

    // use the payloads to make second API call for specific course listing information
    const detailsResponses = await fetchCourseDetailsBatch(first10Payloads);

    // extract professor names from the JSON response of the second call
    const professorNames = detailsResponses
      .map(htmlText => {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = htmlText || "";
        return tempDiv.textContent.trim();
      })
      .filter(name => name && name.length > 0);

    console.log("professor names: ", professorNames);

    // send names to background and get RateMyProf API information on them
    const profData = await Promise.all(
      professorNames.map(name =>
        new Promise((resolve) => {
          chrome.runtime.sendMessage({ type: 'fetchProfessorData', name }, (response) => {
            resolve(response.success && response.data ? response.data : null);
          });
        })
      )
    );

    console.log("full professor data: ", profData);
    addProfessorToListings(profData);

  } catch (err) {
    console.error("error in renderSearchResultsColumn: ", err);
  }
}

function createProfessorInfoDiv(profData) {

  const listing = document.querySelectorAll('.result.result--group-start');

  // create main container div
  const container = document.createElement('div');
  container.classList.add('professor-search-info');

  // show difficulty as main text
  const text = document.createElement('span');
  text.textContent = `Rating: ${profData.rating}`;

  // create popup div (hidden by default)
  const popup = document.createElement('div');
  popup.classList.add('professor-search-popup');

  // fill popup with all professor details
  popup.innerHTML = `
    <strong>${profData.name}</strong><br>
    Department: ${profData.department}<br>
    Rating: ${profData.rating}<br>
    Difficulty: ${profData.difficulty}<br>
    Would Take Again: ${profData.wouldTakeAgain}%<br>
    Number of Ratings: ${profData.numRatings}<br>
    <a href="${profData.profileLink}" target="_blank" style="color: #aad">${profData.profileLink}</a>
  `;

  // show popup on hover
  container.addEventListener('mouseenter', () => {
    popup.classList.add('visible');
  });

  container.addEventListener('mouseleave', () => {
    popup.classList.remove('visible');
  });

  container.appendChild(text);
  container.appendChild(popup);

  return container;
}

function addProfessorToListings(profData) {

  const listings = document.querySelectorAll('.result.result--group-start');

  listings.forEach((listing, index) => {
    // if data exists at array index, insert info div with rating
    if (profData[index]) {
      const headline = listing.querySelector('.result__headline');
      if (headline) {
        const profDiv = createProfessorInfoDiv(profData[index]);
        headline.appendChild(profDiv);
      }
    }
  });
}


let currentSearchCriteria = null;
let currentCourseListing = null;

const targetNode = document.querySelector('.panels');
const observer = new MutationObserver(() => {

  // 50 ms delay to give DOM time to load elements, supporst async functions
  setTimeout( async () => {

    //the result-criteria class is only present on the search results column
    if(document.querySelector('.result-criteria')){
      const searchCriteria = document.querySelector('.result-criteria').innerHTML;
      // render search result ratings only if search results have actually changed
      if(currentSearchCriteria !== searchCriteria) {
        currentSearchCriteria = searchCriteria;
        renderSearchResultsColumn();
        insertSearchRating();
      }
      
    }

    //the detail-courseinfo class is only present on the course listing page
    if(document.querySelector('.detail-courseinfo')){
      const courseListing = document.querySelector('.detail-title').innerHTML;
      // render individual listing ratings only if listing has changed
      if(currentCourseListing !== courseListing) {
        currentCourseListing = courseListing;
        renderCourseListing();
      }

    }
    
  }, 50);

});
observer.observe(targetNode, { subTree: true, childList: true, subtree: true, characterData: true});
