console.log('preferences.js')

const key = 'prefixList';
const defaultPrefixList = ['https://app2.greenhouse.io/', 'https://meet.google.com/'];

export function loadPrefixListIntoArray(returnArray) { 
    getPrefixListPromise().then(result => { 
        returnArray.concat(result);
    });
}

export function getPrefixListPromise() { 
    console.log("loading prefix list from local");
    return chrome.storage.local.get(key).then(
        result => { 
            var data = result[key];
            console.log('loaded raw data: ' + data)
            if (!data) { 
                console.log("no data, using default");
                data = defaultPrefixList
            }
            console.log("returning prefix List: " + data);
            return data
        });   
}

export function savePrefixList(prefixList) { 
    console.log("Saving new prefix list:" + prefixList)
    const data = {[key]: prefixList};
    console.log("Saving data:", data)
    chrome.storage.local.set(data).then(result => console.log("saved"));
    chrome.storage.local.get(key).then(result => console.log("prefix list:" + result[key]))
}