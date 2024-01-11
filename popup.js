var currentDomain = "" , domainPath = "";
var dateNum = new Date().getDate();
var streakLen, maxStreak, lastVisit, streakFreezeActive;
var streakInfoArray = [];
var lightMode, gemCount = 0;

document.addEventListener('DOMContentLoaded', function() {
  console.log("[Creating event listeners...]");
  createEventListeners();
  chrome.storage.local.get('gems', function(result) {
    gemCount = result.gems;
    document.getElementById('gems').innerHTML = "💎 " + gemCount;
  });
  getDetails();
  console.log("[Setting lightMode...]"); 
  setLightMode().then(() => {
    console.log("[Getting current tab...]");
    getTab();
    console.log("[Changing colour...]");
    changeColor(true);
  });
});

function getDetails(){
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(currentDomain, function(result) {
      streakInfoArray = result[currentDomain];
      if(streakInfoArray != null && streakInfoArray != undefined){
        [streakLen, maxStreak, lastVisit, streakFreezeActive] = streakInfoArray;
        streakInfoArray = [streakLen, Math.max(streakLen,maxStreak), dateNum, streakFreezeActive]; 
      }
      resolve();
    });
  });
}

function saveDetails(streakDuration = streakLen, maxStk = Math.max(streakLen, maxStreak), prevDay = dateNum, freezeActive = streakFreezeActive){
  console.log("Saving details... [streakDuration, maxStk, prevDay, freezeActive]: ", streakDuration, maxStk, prevDay, freezeActive);
  streakInfoArray = [streakDuration, maxStk, prevDay, freezeActive];
  chrome.storage.local.set({[currentDomain]: streakInfoArray});
}

// Get light mode's value from storage
function setLightMode(){
  return new Promise((resolve, reject) => {
    chrome.storage.local.get('lightMode', function(result) {
      lightMode = result.lightMode;
      console.log("Extension opened, lightmode: ",lightMode);
      if(lightMode == undefined || lightMode == null) {
        lightMode = false;
        chrome.storage.local.set({'lightMode': lightMode}, resolve());
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
  getDetails().then(() => {
    console.log("Streak details: ", streakInfoArray);
    if(streakInfoArray == null || streakInfoArray == undefined){
      showStartStreakButton();
      document.getElementById('gems').style.cursor = "default";
      document.getElementById('newStreak').addEventListener('click', () => createNewStreak());
    }
    else{
      showStreakInfo();
      saveDetails();
      document.getElementById('deleteStreak').addEventListener('click', () => showDeleteStreakButtons(false));
    }
  }).catch(error => console.error(error));
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
  console.log("Showing streak info...");
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
        if (error) {console.error(error);} 
        else {
          chrome.storage.local.set({'gems': gemCount}); // Gems persist through deletion
          window.close(); // Close popup
        }
      });
    } else {
      new Promise((resolve, reject) => {
        chrome.storage.local.remove(currentDomain, function() {
          var error = chrome.runtime.lastError;
          if (error) {
            reject(error);
          } else {
            console.log("Deletion complete!");
            resolve();
          }
        });
      }).then(() => checkStreak());
    }
  });

  // Cancel Delete Listener
  document.getElementById('deleteStreakCancel').addEventListener('click', function() {
    console.log("Streak Deletion Cancelled!");
    getTab();
  });
}

// Create a new streak
function createNewStreak(){
  [streakLen, maxStreak, lastVisit, streakFreezeActive] = [1, 1, dateNum, false];
  streakInfoArray = [streakLen, maxStreak, lastVisit, streakFreezeActive];
  chrome.storage.local.set({[currentDomain] : streakInfoArray});
  document.getElementById('gems').style.cursor = "pointer";
  checkStreak();
}

// Helper function to create event listeners for gem shop buttons
function createButtonListener(buttonId, cost, action, successMessage, failMessage) {
  let button = document.getElementById(buttonId);
  if (button) {
    button.addEventListener('click', () => {
      if (buttonId != 'streakFreeze' || streakFreezeActive != true) {
        console.log("Button clicked: ", buttonId, " StreakFreezeActive: ", streakFreezeActive);
        if (gemCount >= cost) {
          gemCount -= cost;
          action();
          chrome.storage.local.set({'gems': gemCount});
          button.innerHTML = "✔️";
          button.style.backgroundColor = "#a0e45f";
          topText.innerHTML = `💎${gemCount} <br> Gem Shop`;
        } else {
          button.innerHTML = "❌";
          topText.innerHTML = `💎${gemCount} <br> ${failMessage}`;
          button.style.backgroundColor = "#e54545";
        }
        if(buttonId != 'streakFreeze' || streakFreezeActive != true){
          setTimeout(() => {
            button.innerHTML = `💎 ${cost}`;
            button.style.backgroundColor = lightMode ? `rgb(125, 117, 142)` : `rgb(240, 240, 240)`;
            topText.innerHTML = `💎${gemCount} <br> Gem Shop`;
          }, 1000);
        }
      }
    });
  }
}

// Load Gem Shop
function loadGemShop(){
  if(streakInfoArray != undefined){
    console.log("Loading Gem Shop...");
    var topText = document.getElementById('topText');
    var streak = document.getElementById('streak');
    var gems = document.getElementById('gems');

    if(gems.value == "shop"){
      getDetails();
      console.log("Showing shop..., gems.value: ", gems.value);
      gems.value = "back";
      topText.innerHTML = `💎${gemCount} <br> Gem Shop`;
      // Hide buttonbar
      document.getElementById('buttonBarID').style.display = "none";

      // {buttonID: [icon, title, cost]}, Iterated through to make buttons
      let buttonDict = {
        'streakFreeze': ['images/StreakFreeze.png', 'Streak Freeze!', 'streakFreeze', 20],
        'buyGems': ['images/icon.png', 'Buy 10 Gems', 'buyGems', 0],
        'streakUp': ['images/StreakUp.png', '+3 Streaks!', 'streakUp', 2]
      }
      streak.innerHTML = "";
      for(let key of Object.keys(buttonDict)){
        streak.innerHTML +=
        `<br><div class="gemShopItem">
          <img src="${buttonDict[key][0]}" width="25%" height="25%"> <p id="gemShopItemTitle">${buttonDict[key][1]}</p> <button class="purchaseGemShopItem" id="${buttonDict[key][2]}" type="button"><b>💎${buttonDict[key][3]}</b></button>
        </div>`;
      }
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

      if(streakFreezeActive){
        document.getElementById('streakFreeze').innerHTML = "✔️";
        document.getElementById('streakFreeze').style.backgroundColor = "#a0e45f";
      }

      createButtonListener('streakFreeze', 20, () => {
        streakFreezeActive = true;
        saveDetails();
      }, 'Streak Freeze activated!', 'Insufficient Gems!');
      
      createButtonListener('buyGems', 0, () => {
        gemCount += 10;
      }, '10 Gems bought!', '');
      
      createButtonListener('streakUp', 2, () => {
        streakLen += 3;
        saveDetails();
      }, 'Streak increased by 3!', 'Insufficient Gems!');
    }
    else{
      console.log("Returning to streak info... gems.value: ", gems.value);
      saveDetails();
      document.getElementById('buttonBarID').style.display = "block";
      gems.value = "shop";
      gems.innerHTML = "💎 " + gemCount;
      topText.innerHTML = currentDomain;
      checkStreak();
    }
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