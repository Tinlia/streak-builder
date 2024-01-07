var currentDomain = "" , domainPath = "";
var dateNum = new Date().getDate();
var streakLen, maxStreak, lastVisit;
var streakInfoArray = [streakLen, maxStreak, lastVisit];
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
      [streakLen, maxStreak, lastVisit] = streakDetails;
      showStreakInfo();
      streakInfoArray = [streakLen, Math.max(streakLen,maxStreak), dateNum]; 
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
  streakInfoArray = [1, 1, dateNum]
  var obj = {};
  obj[currentDomain] = streakInfoArray;
  chrome.storage.local.set(obj, () => checkStreak());
}

function createEventListeners(){
  document.getElementById('bugReport').addEventListener('click', function() {
    window.open('https://github.com/Tinlia/streak-builder/issues/new', '_blank');
  });

  document.getElementById('help').addEventListener('click', function() {
    window.open('https://github.com/Tinlia/streak-builder', '_blank');
  });

  document.getElementById('clearAll').addEventListener('click', function() {
    showDeleteStreakButtons(true);
  });

  document.getElementById('lightDarkToggle').addEventListener('click', function() {
    changeColor(false);
  });
}