
function renderCourseListing(){

  console.log("RENDERING COURSE LISTING");

  // get the professor's name from the course listing page
  const professorDiv = document.querySelector('.instructor-detail');
  const professor = professorDiv?.textContent?.trim();
    
  if (professor) {

    // send professor's name to the background script to fetch the data from API

    chrome.runtime.sendMessage(
      {
        type: 'fetchProfessorData',
        name: professor,
      },
      (response) => {
        if (response.success) {

          // populate the course listing with the professor's data or display not found

          if(response.data === null) {
            insertNotFound();
            return;
          }

          insertRateMyProf(response.data.rating, response.data.profileLink, response.data.difficulty);

        }
        else {
          console.log("failed to fetch professor data");
        }
      }
    );
  }
}

function insertRateMyProf(profRating, profLink, profDifficulty) {

  const professor = document.querySelector('.instructor-detail');
    
  if(professor && !document.getElementById('rate_my_prof')) {

    // create a wrapper div to hold the rating
    const wrapper = document.createElement('div');
    wrapper.classList.add('wrapper');

    professor.insertAdjacentElement('beforebegin', wrapper);
    wrapper.appendChild(professor);


    // add rating element
    const rating = document.createElement('span');

    rating.id = 'rate_my_prof';
    rating.textContent = `Rating: ${profRating}/5`;
    rating.classList.add('rating');

    // add difficulty element
    const difficulty = document.createElement('span');

    difficulty.textContent = `Difficulty: ${profDifficulty}`;
    difficulty.classList.add('rating');

    // add link to ratemyprofessors.com
    const link = document.createElement('a');

    link.href = profLink; 
    link.target = '_blank';

    link.id = 'link_to_prof';
    link.textContent = 'View More';
    link.style.color = '#795D3E';

    // append all to wrapper div
    wrapper.append(rating, difficulty, link);

  }
}

function insertNotFound(){

  const professor = document.querySelector('.instructor-detail');

  if(!document.getElementById('rate_my_prof')) {

    // create a wrapper div to hold the rating
    const wrapper = document.createElement('div');
    wrapper.classList.add('wrapper');

    professor.insertAdjacentElement('beforebegin', wrapper);
    wrapper.appendChild(professor);

    // add no rating available
    const rating = document.createElement('span');

    rating.id = 'rate_my_prof';
    rating.textContent = 'No Rating Available';
    rating.classList.add('rating');

    // add link to ratemyprofessors.com
    const link = document.createElement('a');

    link.href = 'https://www.ratemyprofessors.com/';
    link.target = '_blank';

    link.id = 'link_to_prof';
    link.textContent = 'View More';
    link.style.color = '#795D3E';

    wrapper.append(rating, link);

  }
}