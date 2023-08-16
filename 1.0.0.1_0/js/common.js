// Add manifest access to the extension
manifest = chrome.runtime.getManifest();

// arrayCompare :: (a -> a -> Bool) -> [a] -> [a] -> Bool
const arrayCompare = f => ([x,...xs]) => ([y,...ys]) =>
  x === undefined && y === undefined
    ? true
    : Boolean (f (x) (y)) && arrayCompare (f) (xs) (ys)

// arrayDeepCompare :: (a -> a -> Bool) -> [a] -> [a] -> Bool
const arrayDeepCompare = f =>
  arrayCompare (a => b =>
    isArray (a) && isArray (b)
      ? arrayDeepCompare (f) (a) (b)
      : f (a) (b))    

//Array.last
if (!Array.prototype.last){
    Array.prototype.last = function(){
        return this[this.length - 1];
    };
};      
//Array.remove
if (!Array.prototype.remove){
    Array.prototype.remove = function(value){
        return this.filter(item => item != value);
    };
};      

// Timestamp of installation date
function install_timestamp() {
    var now = new Date();
    install_timestamp = localStorage.getItem('install_timestamp') || now.valueOf();

    // Get setting transferred via sync
    chrome.storage.sync.get('install_timestamp', function(data) {

        // If the data read correctly get it, otherwise do nothing.
        install_timestamp = (data.install_timestamp) ? data.install_timestamp : install_timestamp;

        localStorage.setItem('install_timestamp', install_timestamp);
    });
};
install_timestamp();

function cleanUrl(url)
{
    var trim;

    trim = 'https://';
    if(url.substring(0, trim.length) == trim)
        url = url.substring(trim.length);

    trim = 'http://';
    if(url.substring(0, trim.length) == trim)
        url = url.substring(trim.length);      
        
    trim = 'www.';
    if(url.substring(0, trim.length) == trim)
        url = url.substring(trim.length);    

    return url;
}

function checkLocalStorageWorks()
{
    const timestamp = unix_timestamp();    
    localStorage.setItem("testLocalStorage", timestamp) = timestamp;
    let testRead = localStorage.getItem("testLocalStorage");
    if(testRead == timestamp)
        return true;
    else
        return false;
}

function Notify(id, message, contextMessage)
{    
    var NotificationOptions = {type: 'basic', 
                                iconUrl : manifest.browser_action.default_icon,
                                title: 'Duplicate Tab Helper',
                                message: message,
                                contextMesssage: contextMessage};

    chrome.notifications.create(notificationId, NotificationOptions);
}