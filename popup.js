var currentDomain = "" , domainPath = "";
var dateNum = new Date().getDate();
var streakLen, maxStreak, lastVisit, streakFreezeActive;
var streakInfoArray = [streakLen, maxStreak, lastVisit, streakFreezeActive];
var lightMode, gemCount = 0;


document.addEventListener('DOMContentLoaded', function() {
  console.log("[Creating event listeners...]");
  createEventListeners();
  chrome.storage.local.get('gems', function(result) {
    gemCount = result.gems;
    document.getElementById('gems').innerHTML = "💎 " + gemCount;
  });
  console.log("[Setting lightMode...]"); 
  setLightMode().then(() => {
    console.log("[Getting current tab...]");
    getTab();
    console.log("[Changing colour...]");
    changeColor(true);
  });
});

// Get light mode's value from storage
function setLightMode(){
  return new Promise((resolve, reject) => {
    chrome.storage.local.get('lightMode', function(result) {
      lightMode = result.lightMode;
      console.log("Extension opened, lightmode: ",lightMode);
      if(lightMode == undefined || lightMode == null) {
        lightMode = false;
        chrome.storage.local.set({'lightMode': lightMode}, function() {
          resolve();
        });
      } else {
        resolve();
      }
    });
  });
}

// Get current tab
function getTab(){
  console.log("Querying current tab...");
  // Fetch current tab's website title and update popup with domain name
  chrome.tabs.query({active:true,currentWindow:true},function(tabArray){
    var domain = new URL(tabArray[0].url);
    console.log('Domain updated: ', domain.host);
    // If switching to a different website
    if(domain.host != currentDomain){
      currentDomain = domain.host;
      domainPath = domain.pathname;
      console.log("Domain is not the same as last tab!");
      // If not a type of chrome:// tab
      if(domain.protocol!='chrome:'){
        console.log("checkStreak() called");
        checkStreak();
        document.getElementById('topText').innerHTML = domain.host; 
        return domain.host;
      }
      else{
        document.getElementById('topText').innerHTML = "Switch to a website to view your streak progress.";
        document.getElementById('streak').innerHTML = "";
        return null;
      }
    }
    else{checkStreak();}
  });
}

// Check and display streak info
function checkStreak(){
  chrome.storage.local.get(currentDomain, function(result) {
    var streakDetails = result[currentDomain];
    if(streakDetails == null || streakDetails == undefined){
      showStartStreakButton()
      document.getElementById('newStreak').addEventListener('click', () => createNewStreak());
    }
    else{
      [streakLen, maxStreak, lastVisit, streakFreezeActive] = streakDetails;
      showStreakInfo();
      streakInfoArray = [streakLen, Math.max(streakLen,maxStreak), dateNum, streakFreezeActive]; 
      var obj = {};
      obj[currentDomain] = streakInfoArray;
      chrome.storage.local.set(obj);
      document.getElementById('deleteStreak').addEventListener('click', () => showDeleteStreakButtons(false));
    }
  });
}

// Switch between light and dark mode
function changeColor(firstTime){
  var LDModeButton = document.getElementById('lightDarkToggle');
  var buttons = document.getElementsByClassName('buttonBar');
  console.log("Changing colour, lightMode: ", lightMode, " firstTime: ", firstTime);
  if(!firstTime){
    lightMode = lightMode ? false : true;
    chrome.storage.local.set({'lightMode': lightMode});
    console.log("Not first time, lightMode: ", lightMode);
  }
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].style.backgroundColor = lightMode? `rgb(80, 72, 97)`:`rgb(240, 240, 240)`;
    buttons[i].style.color = lightMode?`white`: `black`;
  }
  document.getElementById('body-block').style.backgroundColor = lightMode?`rgb(80, 72, 97)`:`rgb(240, 240, 240)`;
  document.getElementById('buttonBarID').style.backgroundColor = lightMode?`rgb(53, 47, 66)`:`white`;
  document.getElementById('logo').src = lightMode?`images/StreakBuilderDark.png`:`images/StreakBuilderLight.png`;
  document.body.style.backgroundColor = lightMode?`rgb(53, 47, 66)`: `white`;
  document.body.style.color = lightMode?`white`: `black`;
  LDModeButton.innerHTML = lightMode?'☀️': '🌙';
}

// Show streak info
function showStreakInfo(){
  document.getElementById('streak').innerHTML = `
      <p>Current Streak: </br>🔥 ` + streakLen + ` </br>
      <p>Max Streak: </br>🔥 ` + maxStreak + `</p><br>
      <button id="deleteStreak" type="button">🗑️</button>` 
      + `${domainPath.includes('/Tinlia/')?"</br></br><i>Thanks for checking out my work!</i>":""}`;
}

// Button Displayers
function showStartStreakButton(){
  document.getElementById('streak').innerHTML = `<button id="newStreak" type="button"><b>+</b> Start a 🔥Streak</button>`;
}

function showDeleteStreakButtons(deleteAll) {
  document.getElementById('streak').innerHTML = `
      Delete${deleteAll ? " all of your streaks" : " this streak"}? (This cannot be undone)<br><br>
      <button id="deleteStreakConfirm" type="button">✔️</button>
      <button id="deleteStreakCancel" type="button">❌</button>`;

  document.getElementById('deleteStreakConfirm').addEventListener('click', function() {
    console.log(deleteAll ? "Removing all entries..." : "Deleting streak by removing ", currentDomain);
    if(deleteAll) {
      chrome.storage.local.clear(function() {
        var error = chrome.runtime.lastError;
        if (error) { console.error(error); } 
        else {
          console.log("Deletion complete!");
          chrome.storage.local.set({'gems': gemCount}); // Gems persist through deletion
          window.close(); // Close popup
        }
      });
    } else {
      chrome.storage.local.remove(currentDomain, function() {
        var error = chrome.runtime.lastError;
        if (error) {
          console.error(error);
        } else {
          console.log("Deletion complete!");
          checkStreak();
        }
      });
    }
  })

  // Cancel Delete Listener
  document.getElementById('deleteStreakCancel').addEventListener('click', function() {
    console.log("Streak Deletion Cancelled!");
    getTab();
  })
}

// Create a new streak
function createNewStreak(){
  streakInfoArray = [1, 1, dateNum, false]
  var obj = {};
  obj[currentDomain] = streakInfoArray;
  chrome.storage.local.set(obj, () => checkStreak());
}

// Load Gem Shop
function loadGemShop(){
  var topText = document.getElementById('topText');
  var streak = document.getElementById('streak');
  var gems = document.getElementById('gems');

  if(gems.value == "shop"){
    console.log("Showing shop..., gems.value: ", gems.value);
    gems.value = "back";
    topText.innerHTML = `💎${gemCount} <br> Gem Shop`;
    streak.innerHTML = `
    <div class="gemShopItem">
      <img src="images/StreakFreeze.png" width="25%" height="25%"> <p id="gemShopItemTitle">Streak Freeze!</p> <button class="purchaseGemShopItem" id="streakFreeze" type="button"><b>💎20</b></button>
    </div> <br>
    <div class="gemShopItem">
      <img src="images/icon.png"width="25%" height="25%"> <p id="gemShopItemTitle">Buy 10 Gems</p> <button class="purchaseGemShopItem" id="buyGems" type="button"><b>💎0</b></button>
    </div>
    `;
    var shopItems = document.getElementsByClassName('gemShopItem');
    for (var i = 0; i < shopItems.length; i++) {
      shopItems[i].style.backgroundColor = lightMode? `rgb(95, 87, 112)`:`rgb(227, 227, 227)`;
      shopItems[i].style.color = lightMode?`white`: `black`;
    }

    var purchaseGemShopItems = document.getElementsByClassName('purchaseGemShopItem');
    for (var i = 0; i < purchaseGemShopItems.length; i++) {
      purchaseGemShopItems[i].style.border = lightMode? `2px solid rgb(53, 47, 66)`: `2px solid white`;
      purchaseGemShopItems[i].style.backgroundColor = lightMode? `rgb(125, 117, 142)`:`rgb(240, 240, 240)`;
      purchaseGemShopItems[i].style.color = lightMode?`white`: `black`;
    }

    // turn gem shop button into a go-back button
    gems.innerHTML = "←";

    // Check local for if a streakFreeze is active



    // Create eventListeners for each purchaseGemShopItem button
    let streakFreeze = document.getElementById('streakFreeze');
    let buyGems = document.getElementById('buyGems');
    if(streakFreezeActive == null || streakFreezeActive == false){
      document.getElementById('streakFreeze').addEventListener('click', () => {
        console.log("Streak Freeze is inactive!", streakFreezeActive);
        let cost = 20; // Price of item

        if(gemCount >= cost){
          gemCount -= cost;
          chrome.storage.local.set({'gems': gemCount});
          chrome.storage.local.set({[currentDomain]: [streakLen, Math.max(streakLen,maxStreak), dateNum, true]});
          streakFreeze.innerHTML = "✔️"; 
          streakFreeze.style.backgroundColor = "#a0e45f";
          setTimeout(() => {
            streakFreeze.innerHTML = `💎 ${cost}`;
            streakFreeze.style.backgroundColor = lightMode? `rgb(125, 117, 142)`:`rgb(240, 240, 240)`;
          }, 1500);
          topText.innerHTML = `💎${gemCount} <br> Gem Shop`;
        }
        else{
          streakFreeze.innerHTML = "❌";
          topText.innerHTML = `💎${gemCount} <br> Insufficient Gems!`;
          streakFreeze.style.backgroundColor = "#e54545";
          setTimeout(() => {
            streakFreeze.innerHTML = `💎 ${cost}`;
            topText.innerHTML = `💎${gemCount} <br> Gem Shop`;
            streakFreeze.style.backgroundColor = lightMode? `rgb(125, 117, 142)`:`rgb(240, 240, 240)`;
          }, 1000);
        }
      });
    }
    else{
      console.log("Streak Freeze is active! : ", streakFreezeActive);
      streakFreeze.innerHTML = "✔️"; 
      streakFreeze.style.backgroundColor = "#a0e45f";
    }
    document.getElementById('buyGems').addEventListener('click', () => {
      gemCount += 10;
      chrome.storage.local.set({'gems': gemCount});
      topText.innerHTML = `💎${gemCount} <br> Gem Shop`;
      buyGems.innerHTML = "✔️"; // Green checkmark
      buyGems.style.backgroundColor = "#a0e45f";
      setTimeout(() => {
        buyGems.innerHTML = `💎 0`;
        buyGems.style.backgroundColor = lightMode? `rgb(125, 117, 142)`:`rgb(240, 240, 240)`;
      }, 1000);
    });
  }
  else{
    console.log("Returning to streak info... gems.value: ", gems.value);
    // Create eventListener for goBack button
    gems.value = "shop";
    gems.innerHTML = "💎 " + gemCount;
    topText.innerHTML = currentDomain;
    checkStreak();
  }
}

// On-load Event Listeners
function createEventListeners(){
  document.getElementById('bugReport').addEventListener('click', () => window.open('https://github.com/Tinlia/streak-builder/issues/new', '_blank'));

  document.getElementById('help').addEventListener('click', () => window.open('https://github.com/Tinlia/streak-builder', '_blank'));

  document.getElementById('clearAll').addEventListener('click', () => showDeleteStreakButtons(true));

  document.getElementById('lightDarkToggle').addEventListener('click', () => changeColor(false));

  document.getElementById('gems').addEventListener('click', () => loadGemShop());
}