console.log('preferences.js')

const prefixListKey = 'prefixList';
const defaultPrefixList = ['https://app2.greenhouse.io/', 'https://meet.google.com/'];

export function loadPrefixListIntoArray(returnArray) { 
    getPrefixListPromise().then(result => { 
        returnArray.concat(result);
    });
}
export function getPrefixListPromise() { 
    console.log("polling for saved preferences");
    return chrome.storage.local.get({prefixListKey: defaultPrefixList}).then(
        result => { 
            var prefixList = result[prefixListKey] || defaultPrefixList;
            console.log("Loaded Prefix List: " + prefixList);
            return prefixList
        });   
}

export function savePrefixList(prefixList) { 
    console.log('Saving prefix list:' + prefixList)
    const data = {prefixKey: prefixList};
    chrome.storage.local.set(data).then(() => {});
    chrome.storage.local.get(prefixListKey).then(result => console.log("Saved prefix list:" + result[prefixListKey]))
}