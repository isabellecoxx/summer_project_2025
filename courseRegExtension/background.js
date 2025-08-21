
const proxyURL = "https://www.ratemyprofessors.com/graphql";
const SCHOOL_ID = "U2Nob29sLTg1MA=="; // SLU GraphQL ID
const AUTHORIZATION_TOKEN = "Basic dGVzdDp0ZXN0";

function cleanName(name) {
  return name
    .replace(/(To be Announced|TBA)/gi, '')
    .replace(/\b([A-Z])\./g, '$1')
    .trim()
    .replace(/\s+/g, ' ');
}

export async function fetchProfessorData(rawName) {
  const name = cleanName(rawName);

  console.log("FECTHING DATA FOR PROFESSOR", name);

  // builds query to RateMyProfessor for information using professor name and school ID
  const query = {
    query: `
      query {
        newSearch {
          teachers(query: { text: "${name}", schoolID: "${SCHOOL_ID}" }) {
            edges {
              node {
                firstName
                lastName
                department
                avgRating
                avgDifficulty
                numRatings
                wouldTakeAgainPercent
                legacyId
              }
            }
          }
        }
      }
    `,
  };

  // make request to their server using query
  try {
    const res = await fetch(proxyURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
        //Authorization: AUTHORIZATION_TOKEN,
      },
      body: JSON.stringify(query),
    });

    const data = await res.json();
    const professors = data?.data?.newSearch?.teachers?.edges;

    if (!professors || professors.length === 0) {
      return null;
    }

    // if theres a successful response, take first match and extract relevant data
    const prof = professors[0].node;

    return {
      name: `${prof.firstName} ${prof.lastName}`,
      department: prof.department || "N/A",
      rating: prof.avgRating || "N/A",
      difficulty: prof.avgDifficulty || "N/A",
      wouldTakeAgain: prof.wouldTakeAgainPercent || "N/A",
      numRatings: prof.numRatings || 0,
      profileLink: `https://www.ratemyprofessors.com/professor/${prof.legacyId}`,
    };
  }
  // log error if request to server fails
  catch (error) {
    console.error("RMP fetch error:", error);
    return null;
  }
}

let lastApiRequest = null;

// listens for API calls on network
chrome.webRequest.onBeforeRequest.addListener(
  function (details) {

    // if the request is POST and not empty, decode the information
    if (details.method === "POST") {
      let postedString = "";
      if (details.requestBody && details.requestBody.raw) {
        for (const entry of details.requestBody.raw) {
          if (entry.bytes) {
            postedString += new TextDecoder("utf-8").decode(entry.bytes);
          }
        }
      }

      console.log("POST body: ", postedString);

      // store latest request relevant info (URL and payload)
      lastApiRequest = {
        url: details.url,
        body: postedString,
        timestamp: Date.now()
      };
    }
  },
  // only intercept requests to SLU's endpoint
  { urls: ["https://courses.slu.edu/api/*"] },
  ["requestBody"]
);

// listenes for messages from the content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // if message is to fetch the professor data, call fetchProfessorData() and return response
  if (message.type === 'fetchProfessorData') {
    fetchProfessorData(message.name).then(data => {
      sendResponse({ success: true, data });
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true; // async
  }
  // if the message is to get the last request to server, send most recent request via WebRequest
  else if (message.type === "getLastApiRequest") {
    sendResponse({ data: lastApiRequest });
  }
});
