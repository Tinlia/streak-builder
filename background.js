function updateBadgeText(tab) {
    let url = tab.url;
    let domain = new URL(url).host;
    let today = new Date().getDate();
    let streakLength = 0, maxStreak = 0, lastVisit = 0;

    // Get the streak details from chrome.storage.local
    chrome.storage.local.get([domain], function(result) {
        console.log("Result: ", result);
        if (result[domain] !== undefined) {
            const streakDetails = result[domain];
            [streakLength, maxStreak, lastVisit] = streakDetails;
            if(today - lastVisit === 1 || (today - lastVisit <= -29 && today == 1)){
                streakLength++;
                giveGem(1);
            }else if (today - lastVisit !== 0){ // Lose the streak
                streakLength = 0;
            }
            console.log("Domain found in storage! Domain: ", domain);
            chrome.storage.local.set({[domain]: [streakLength, Math.max(streakLength, maxStreak), today]}); // LastVisit = yesterday (test)
        }else{
            console.log("Domain not found in storage! Domain: ", domain);
        }
        // Update the extension's icon with the streak length
        if (streakLength === 0) {
            chrome.action.setBadgeText({ text: '+' });
            chrome.action.setBadgeBackgroundColor({ color: '#04d952' });
        }else{
            if(streakLength > 999){streakLength = "999+";}
            chrome.action.setBadgeText({ text: streakLength.toString() });
            chrome.action.setBadgeBackgroundColor({ color: '#d91204' });
        }
    });
}

// Fetch and set the value of gems
function giveGem(gemsToAdd){
    console.log("Giving Gem...");
    chrome.storage.local.get('gems', function(result) {
        chrome.storage.local.set({'gems': result.gems + gemsToAdd});
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