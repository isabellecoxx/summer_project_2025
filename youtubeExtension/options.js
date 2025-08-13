const checkboxIds = ['Profanity', 'Violence', 'Politics', 'Substances', 'Horrer'];

function saveOptions() {
  
  let options = {};

  // loop through each checkbox id and save its state
  checkboxIds.forEach(id => {
    options[id] = document.getElementById(id).checked;
  });

  chrome.storage.sync.set(options);

}

function saveRange(){
  const range = document.getElementById("my-range");
  chrome.storage.sync.set({'my-range': slider.value});
  console.log({'my-range': slider.value});
}

function restoreOptions() {
  // retrieve the saved state of each checkbox and set it
  chrome.storage.sync.get(checkboxIds, (items) => {
    checkboxIds.forEach(id => {
      document.getElementById(id).checked = items[id] || false;
    });
  });

}

function restoreRange(){
  chrome.storage.sync.get('my-range', (items) => {
    const slider = document.getElementById("my-range");
    const output = document.getElementById("demo");

    if (items['my-range'] !== undefined && slider && output) {
      slider.value = items['my-range'];
      output.textContent = items['my-range'];
    }
  });
}

// add event listener to save options when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {

  restoreOptions();
  restoreRange();

});

let ReviewThemes =[];

// event listener to log when save button is clicked
document.getElementById('saveButton').addEventListener('click', () => {
  console.log("Save button clicked");
  saveOptions();
  saveRange();
  // log option settings
  chrome.storage.sync.get(checkboxIds, function(items) {
    // `items` is an object containing all synced items (if `null` is passed as the first argument)
    console.log("All items in chrome.storage.sync:", items);

    const ReviewThemes = items;
    console.log(ReviewThemes);

  });

});



const slider = document.getElementById("my-range");
const output = document.getElementById("demo");

console.log(slider, output);

// set initial value
output.textContent = slider.value;

// update value on input
slider.addEventListener("input", function () {
  output.textContent = this.value;
});
