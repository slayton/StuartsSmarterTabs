(function options() {
"use strict"

document.addEventListener('DOMContentLoaded', populateHtmlElements);

var settingsLoaded = false;

var navDupePref;
var navDupePrefElement;
var prefixList = Array();
var prefixListInputElement;

function loadSettings()
{
  navDupePref = localStorage.getItem('navigation_duplicate_pref') || 'ignore';  
  prefixList = ['https://app2.greenhouse.io/', 'https://meet.google.com/']
  settingsLoaded = true;
}
loadSettings(); // Loading from storage doesn't have to wait for page to laod

// Fills the HTML elements in the options with values from storage
function populateHtmlElements()
{
  if(settingsLoaded == false)
    loadSettings();

  navDupePrefElement = document.getElementById("navigation-duplicate-pref");      
  navDupePrefElement.value = navDupePref;  


  prefixListInputElement = document.getElementById("prefix-list-input");
  prefixListInputElement.textContent = JSON.stringify(prefixList);
  
  navDupePrefElement.onchange = saveSettings;
}

function saveSettings()
{
  localStorage.setItem('navigation_duplicate_pref', navDupePrefElement.value);
  localStorage.setItem('domain_prefix_list', JSON.stringify(prefixList))
  let now = new Date();
  chrome.storage.sync.set({settings_updated: now.valueOf()});  
}

})();