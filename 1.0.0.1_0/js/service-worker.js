import {loadPrefixListIntoArray, savePrefixList} from './preferences.js'

var prefixList = [];
loadSettings();

// GLOBALS
// var _currentVersion = chrome.app.getDetails().version;
var tabIdToUrl = new Map();
var blankTabs = new Set();
var mostRecentCreatedTabId;
var preferNewUrl = true;
var duplicatedUrl;

const duplicateTabContextId = 'duplicate-tab'

chrome.tabs.onCreated.addListener(tabCreated);
chrome.tabs.onUpdated.addListener(tabUpdated);
chrome.tabs.onRemoved.addListener(tabClosed);
chrome.storage.onChanged.addListener(loadSettings);
chrome.contextMenus.onClicked.addListener(contextMenuOnClick);
chrome.runtime.onInstalled.addListener(setupContextMenus);

function setupContextMenus() {
  console.log("Creating context menu")
  chrome.contextMenus.create({
    id: duplicateTabContextId,
    title: 'Duplicate Tab',
    contexts: ['all'],
  });
}

function contextMenuOnClick(info) { 
  if (info.menuItemId == duplicateTabContextId) { 
    forceDuplicateTab(info.pageUrl)
  }
}

function forceDuplicateTab(url) { 
  console.log("User wants to duplicate a tab with url:", url);
  duplicatedUrl = url;
  chrome.tabs.create({'url': url})
}

function loadSettings() { 
  console.log("loading prefix list");
  loadPrefixListIntoArray(prefixList);
}

function tabCreated(newTab)
{
  if (newTab.incognito) { 
    return;
  }
  console.log("Created: " + newTab.id + " " + newTab.url);
  tabIdToUrl.set(newTab.id, newTab.url);
  mostRecentCreatedTabId = newTab.id;
  // Blank tab
  if(newTab.url == "chrome://newtab/")
  {
     blankTabs.add(newTab.id);
  }
}

function tabUpdated(tabId, changeInfo, tab)
{
  if (tab.incognito) { 
    return;
  }
  if (!changeInfo.url) { 
    return;
  }

  if (tab.url == duplicatedUrl) { 
    console.log("Tab was duplicated by user do not close it");
    duplicatedUrl = undefined;
    return;
  }
  // Its a no-op if the item isn't in the set, so no need to check if its in there
  blankTabs.delete(tabId);

  var previousUrl = tabIdToUrl.get(tabId) || null;
  var currentUrl = tab.url;        
  tabIdToUrl.set(tabId, tab.url); 

  if (isMostRecentlyCreatedTab(tabId) 
      || isNewTabPretendingToBeOld(previousUrl, currentUrl)) {
    closeTabIfDuplicate(tab);
  }
}

function isMostRecentlyCreatedTab(tabId) { 
  return tabId == mostRecentCreatedTabId;
}
function isNewTabPretendingToBeOld(previousUrl, currentUrl) {
  //There are some cases when an existing tab as far as chrome is concerned
  //is a new tab from the users perspective. Such as a bookmark or when the tab
  //starts out as the chrome home page
  console.log("New tab pretending to be an old tab: P:" + previousUrl + " N:" + currentUrl);
  return previousUrl == currentUrl || previousUrl == "chrome://newtab";
}

function tabClosed(tabId, changeInfo)
{
  console.log(tabId + " closed.");
  tabIdToUrl.delete(tabId)
  blankTabs.delete(tabId);   
}

function closeTabIfDuplicate(tab)
{
  if (tab.incognito)
  {
    return;
  }
  if (tab.url == "chrome://newtab/") { 
    return
  }
  console.log("Handling " + tab.url + '...');
  queryForDuplicatesAndHandle(tab, getTabCollisionHandler(tab));    
}

function getTabCollisionHandler(tab) { 
  return function handleTabUrlCollision(duplicateTabs) {       
    console.log("Found :" + duplicateTabs.length, "duplicates,  processing the first");
    var duplicateTab = duplicateTabs[0]
    // Switch focus to the existing tab and close the newly created tab
    var properties = { 'active': true };
    if (preferNewUrl && tab.url != duplicateTab.url) {
      properties['url'] = tab.url
    }
    // Set the duplicate tab as active, promote window to active if not active
    chrome.tabs.update(duplicateTab.id, properties, (tab) => { });
    var window = chrome.windows.get(duplicateTab.windowId, {windowTypes: ['normal']}, (window) => {
      if (!window.focused) { 
        console.log("Tab in window that isn't focused, taking focus")
        chrome.windows.update(window.id, {"focused": true}, (windows) => {});
      }
    });

    console.log("Closeing tab: " + tab.id + " url:" + tab.url);
    chrome.tabs.remove(tab.id);
  }
}

// Returns matching tabs but does not include the original
function queryForDuplicatesAndHandle(tab, closeNewTabFn)
{
  let queryInfo = {pinned: false, windowType: 'normal'};
  chrome.tabs.query(queryInfo, function queryForDuplicates(tabs) {
    // Get just the duplicates, not the original
    let duplicates = Array();
    tabs.forEach( dupe => {
      if (tab.id == dupe.id) { 
        // we found the new tab, skip it
        return;
      }
      if(isDuplicateWithPrefixCheck(dupe.url, tab.url)) // don't include self
      {
        duplicates.push(dupe);
        console.log("Duplicate found: \n" + dupe.id + " windowId:"+ dupe.windowId +" index:" + dupe.index + " \n" + dupe.url);
      }
    });           
    
    if(duplicates.length)
      closeNewTabFn(duplicates);
  });
}

function isDuplicateWithPrefixCheck(url1, url2) { 
  if (url1 == url2) { 
    return true;
  }
  for (let i=0; i<prefixList.length; i++) { 
    var prefix = prefixList[i]
    if (url1.startsWith(prefix) && url2.startsWith(prefix)) { 
      console.log("Prefix match:", prefix + " | " + url1 + " | " + url2);
      return true;
    }
    return false;
  }
  prefixList.forEach(element => {
   
  });
}
// Needed for callbacks
function closeDuplicateTab(tab)
{
    console.log("Removing duplicate: " + tab.id + " " + tab.url);
    // chrome.tabs.remove(tab.id);
}



