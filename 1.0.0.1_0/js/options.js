import {loadPrefixListIntoArray, savePrefixList} from './preferences.js'

(function options() {
"use strict"

document.addEventListener('DOMContentLoaded', populateHtmlElements);

var settingsLoaded = false;

var prefixList = Array();
var prefixListInputElement;

var prefixListInputElement;
var saveButton;

loadSettings(); // Loading from storage doesn't have to wait for page to laod
registerOnSave();

function loadSettings()
{ 
  getPrefixListPromise().then(prefixList => populateTextBox(prefixList));
  settingsLoaded = true;
}

// Fills the HTML elements in the options with values from storage
function populateHtmlElements()
{
  prefixListInputElement = document.getElementById("prefix-list-input");
  saveButton = document.getElementById('save-btn');
  saveButton.onclick = saveSettings;
 
  if(settingsLoaded == false) {
    loadSettings();
  }
}

function populateTextBox(prefixList) { 
  prefixListInputElement = document.getElementById("prefix-list-input");
  prefixListInputElement.textContent = JSON.stringify(prefixList);
}

function saveSettings()
{
  const parsedPrefixList = JSON.parse(prefixListInputElement.value)
  console.log("Save button clicked, saving prefix list:" + parsedPrefixList);

}

})();