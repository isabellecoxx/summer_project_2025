// SAVE/RESTORE TOGGLE FUNCTIONS

function saveToggles() {
  
  // get all checkboxes in the toggle box div
  const toggles = document.querySelectorAll('#toggle-box input[type="checkbox"]');

  let customToggles = [];
  let toggleStates = {};

  toggles.forEach(checkbox => {
    if (checkbox.id) {
      // find the label text shown in the same row <p> tag
      const label = checkbox.closest('.row').querySelector('p.body');

      let labelText;
      if (label) {
        labelText = label.textContent.trim();
      }
      else {
        labelText = checkbox.id; 
      }

      customToggles.push({
        id: checkbox.id,
        label: labelText,
        checked: checkbox.checked
      });

      toggleStates[checkbox.id] = checkbox.checked;
    }
  });
  // save the array and object to storage
  chrome.storage.sync.set({ customToggles, toggleStates }, () => {
    console.log('items saved: ', toggleStates);
  });
}

function restoreToggles() {

  // retrieve values stored in customToggles
  chrome.storage.sync.get(['customToggles'], (data) => {

    const toggles = data.customToggles;
    const container = document.getElementById('toggle-box');

    // initializes default hardcoded toggles if there are none
    if (!toggles || toggles.length === 0) {

      const defaultToggles = [];
      const defaultCheckboxes = container.querySelectorAll('input[type="checkbox"]');

      defaultCheckboxes.forEach(checkbox => {
        if (checkbox.id) {
          const label = checkbox.closest('.row').querySelector('p.body');

          let labelText;
          if (label) {
            labelText = label.textContent.trim();
          }
          else {
            labelText = checkbox.id; 
          }
          // const labelText = label ? label.textContent : checkbox.id;
          defaultToggles.push({
            id: checkbox.id,
            label: labelText,
            checked: checkbox.checked
          });
        }
      });
      // saves toggles to storage
      chrome.storage.sync.set({ customToggles: defaultToggles });
    }
    else {
      container.innerHTML = '';
      toggles.forEach(toggle => {
        container.appendChild(createToggleRow(toggle));
      });
    }
  });
}


// SAVE/RESTORE RANGE SLIDER FUNCTIONS

function saveRange(){

  const range = document.getElementById("my-range");
  chrome.storage.sync.set({'my-range': range.value});

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

function createToggleRow({ id, label, checked }) {
  // create new row, add the row class, and inject the html
  const newRow = document.createElement('div');
  newRow.classList.add('row');
  newRow.innerHTML = `
    <p class="body">${label}</p>
    <input type="checkbox" id="${id}" ${checked ? 'checked' : ''}>
    <label for="${id}" class="toggle-switch"></label>
    <button class="img-button remove-toggle" type="button">
      <img src="x.png" alt="X" width="100%" height="100%" style="object-fit: cover;">
    </button>
  `;

  // removes button when remove toggle button is clicked
  newRow.querySelector('.remove-toggle').addEventListener('click', () => {
    const rows = document.querySelectorAll('#toggle-box .row');
    // displays message if minimum amount of toggles are loaded
    if (rows.length <= 2) {
      popupMessage("MINIMUM TWO TOGGLES REQUIRED");
      return;
    }
    newRow.remove();
  });

  return newRow;
}


function cleanId(input){
  return input.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9\-_]/g, '');
}

function popupMessage(msg){
      if(document.getElementById('popup-message')) {
        return;
      }

      const container = document.getElementById('page-flex');
      const messageContainer = document.createElement('div');
      const popupMessage = document.createElement('span');
      
      messageContainer.id = 'popup-message';
      messageContainer.classList.add('message-container');

      popupMessage.style.color = 'white';
      popupMessage.textContent = msg;
      popupMessage.classList.add('popup-message');

      const warning = document.createElement('img');
      warning.src = chrome.runtime.getURL('warning.png'); 
      warning.alt = 'Rating icon';
      warning.classList.add('warning-img');

      const xButton = document.createElement('button');
      xButton.className = 'img-button';
      xButton.classList.add('x-button');

      xButton.addEventListener('click', () => {
        messageContainer.remove();
      }); 

      const xIcon = document.createElement('img');  
      xIcon.src = chrome.runtime.getURL('x.png'); 
      xIcon.alt = 'Rating icon';
      xIcon.classList.add('x-icon');

      xButton.appendChild(xIcon);
      messageContainer.append(warning, popupMessage, xButton);
      container.appendChild(messageContainer);
}

// listens for when the add toggle button is clicked
document.querySelectorAll('.add-toggle').forEach(btn => {
  btn.addEventListener('click', () => {

    // extract the user input and save to value
    const input = document.getElementById('add-toggle');
    const value = input.value.trim();

    if (!value) {
      return;
    }
    // if there are already six toggles, display max toggle message
    const existingToggles = document.querySelectorAll('#toggle-box .row');
    if (existingToggles.length >= 6) {
      popupMessage("MAXIMUM SIX TOGGLES ALLOWED");
      return;
    }
    // checks for matching ids, displays no duplicate input message
    const cleanedId = cleanId(value);
    if (document.getElementById(cleanedId)) {
      popupMessage("NO DUPLICATE TOGGLE NAMES");
      return;
    }

    // otherwise adds the new input toggle
    const container = document.getElementById('toggle-box');
    container.appendChild(createToggleRow({ id: cleanedId, label: value, checked: false }));

    input.value = '';
  });
});

const slider = document.getElementById("my-range");
const output = document.getElementById("demo");
if (slider && output) {
  output.textContent = slider.value;
  slider.addEventListener("input", function () {
    output.textContent = this.value;
  });
}

// restore saved toggle states and range when opening popup box
document.addEventListener('DOMContentLoaded', () => {
  restoreToggles();
  restoreRange();
});

// save toggles and range values when clicking on the save button
document.getElementById('saveButton').addEventListener('click', () => {
  saveToggles();
  saveRange();
});
