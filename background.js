function updateBadgeText(tab) {
    let url = tab.url;
    let domain = new URL(url).host;

    // Get the streak length from chrome.storage.local
    chrome.storage.local.get(domain, function(result) {
        console.log("Result: ", result);
        let streakLength = 0;
        if (result[domain] !== undefined) {
            console.log("Domain found in storage! Domain: ", domain);
            const streakList = JSON.parse(result[domain]);
            streakLength = streakList[0];
        }
        else{
            console.log("Domain not found in storage! Domain: ", domain);
        }
        // Update the extension's icon with the streak length
        if (streakLength === 0) {
            chrome.action.setBadgeText({ text: '+' });
            chrome.action.setBadgeBackgroundColor({ color: '#04d952' });
        }
        else{
            chrome.action.setBadgeText({ text: streakLength.toString() });
            chrome.action.setBadgeBackgroundColor({ color: '#d91204' });
        }
    });
}

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete') {
        updateBadgeText(tab);
    }
});

chrome.tabs.onActivated.addListener(function(activeInfo) {
    chrome.tabs.get(activeInfo.tabId, function(tab){
        updateBadgeText(tab);
    });
});