var currentDomain = "";
var domainPath = "";
var currentDate = new Date();
var dateNum = 0
var streakLen, maxStreak, lastVisit;
var streakInfoArray = [streakLen, maxStreak, lastVisit];
var lightMode = JSON.parse(localStorage.getItem('lightMode'));
console.log("Light Mode = localStorage.getItem(", lightMode,")");
if( lightMode == null ){ lightMode = false; localStorage.setItem( 'lightMode' , false ); }

/*
  Delete the following before merging test branch to main:
  - +1 Button
  - Console logs
  - Comments
  - This comment
*/

document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM Loaded");
  console.log("Light Mode: ", lightMode);
  getTab();
  changeColor(true);
  console.log("dateNum = (", currentDate.getDate(),")");
  dateNum = currentDate.getDate();
  createEventListeners();
});

// checkStreak()
function checkStreak(){
  console.log("Checking Streak..");
  // Check if there's a dict in storage
  // If the domain doesn't have a streak
  if(localStorage.getItem(currentDomain) == null || currentDomain.includes(null)){
    console.log("No Streak found, showing + Start Streak button");
    showStartStreakButton()
    // Eventlistener for onClick
    document.getElementById('newStreak').addEventListener('click', function() {
      console.log("Start Streak Clicked! Pre declaration streakInfo: ", streakInfoArray);
      streakInfoArray = [1, 1, dateNum]
      console.log("Post: ", streakInfoArray);
      localStorage.setItem(currentDomain, JSON.stringify(streakInfoArray))
      console.log("checkStreak() called");
      checkStreak();
    })
  }
  // If the domain has a streak
  else{
    console.log("Not null! Instead: ", localStorage.getItem(currentDomain));
    console.log("Parsing with JSON...");
    var streakDetails = JSON.parse(localStorage.getItem(currentDomain));
    console.log("Declaring Streak Details, Current: ", streakDetails);
    [streakLen, maxStreak, lastVisit] = streakDetails;
    console.log("Streak details declared! Current: ",streakDetails);

    //// NOTE: This is a bandage fix and should be changed to properly represent the difference in dates

    // To calculate the difference in days between the two dates
    console.log("Getting dates from ", dateNum ," and ", lastVisit);
    var differenceInDays = dateNum - lastVisit;
    
    if(differenceInDays == 0){console.log("Same Day!"); streakLen += 1;} // If the same day
    else if(differenceInDays == 1){streakLen += 1;} // If one day apart
    else if(differenceInDays <= -29 && dateNum == 1){streakLen +=1;} // If new month & one (or sometimes 2) day(s) apart
    else{streakLen = 1;}// If difference in days is too wide, restart the streak
    
    //////////////////////////////////
    console.log("LastVisit = Today: ",lastVisit, " = ",dateNum);
    lastVisit = dateNum;
    // If current streak is the longest
    if(streakLen > maxStreak){maxStreak = streakLen;}
    console.log("Showing Streak Info");
    showStreakInfo();
    
    streakInfoArray = [streakLen, maxStreak, lastVisit]
    console.log("New Storage Entry! Key: ", currentDomain, " Value: JSON.stringify(", streakInfoArray),")";
    localStorage.setItem(currentDomain, JSON.stringify(streakInfoArray))

    // Eventlistener for onClick
    document.getElementById('deleteStreak').addEventListener('click', function() {
      console.log("Delete Streak Clicked, Are you sure?");
      showDeleteStreakButtons(false);
    })
  }
}

// Switch between Light and Dark mode
function changeColor(firstTime){
  console.log("First time is ", firstTime, " and lightMode is ", lightMode);
  var LDModeButton = document.getElementById('lightDarkToggle');
  var buttons = document.getElementsByClassName('buttonBar');
  if(!firstTime){lightMode = lightMode ? false : true; localStorage.setItem('lightMode', lightMode); console.log("Not First Time Reached, LightMode = ", lightMode);}
  // Iterate through all buttons and change their colors
  for (var i = 0; i < buttons.length; i++) {
    console.log("Light Mode: ", lightMode);
    buttons[i].style.backgroundColor = lightMode? `rgb(80, 72, 97)`:`rgb(240, 240, 240)`;
    buttons[i].style.color = lightMode?`white`: `black`;
  }
  document.getElementById('body-block').style.backgroundColor = lightMode?`rgb(80, 72, 97)`:`rgb(240, 240, 240)`;
  document.getElementById('buttonBarID').style.backgroundColor = lightMode?`rgb(53, 47, 66)`:`white`;
  document.getElementById('logo').src = lightMode?`images/StreakBuilderDark.png`:`images/StreakBuilderLight.png`;
  document.body.style.backgroundColor = lightMode?`rgb(53, 47, 66)`: `white`;
  document.body.style.color = lightMode?`white`: `black`;
  LDModeButton.innerHTML = lightMode?'☀️': '🌙';
  console.log("Colour Changed, Light Mode: ", lightMode);
}

// Show streak info
function showStreakInfo(){
  document.getElementById('streak').innerHTML = `
      <p>Current Streak: </br>🔥 ` + streakLen + ` </br>
      <p>Max Streak: </br>🔥 ` + maxStreak + `</p></br>
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
    deleteAll ? localStorage.clear() : localStorage.removeItem(currentDomain);
    console.log("Deletion complete!");
    if(deleteAll){window.close();} // Close popup if all entries are deleted
    checkStreak();
  })

  // Cancel Delete Listener
  document.getElementById('deleteStreakCancel').addEventListener('click', function() {
    console.log("Streak Deletion Cancelled!");
    getTab();
  })
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
      }
      else{
        document.getElementById('topText').innerHTML = "Switch to a website to view your streak progress.";
        document.getElementById('streak').innerHTML = "";
      }
    }
    else{checkStreak();}
  });
}

function createEventListeners(){
  document.getElementById('bugReport').addEventListener('click', function() {
    window.open('https://github.com/Tinlia/streak-builder/issues/new', '_blank');
  });

  document.getElementById('help').addEventListener('click', function() {
    window.open('https://github.com/Tinlia/streak-builder', '_blank');
  });

  // +1 Button for testing
  // document.getElementById('addOne').addEventListener('click', function() {
  //   console.log("Add One Clicked!");
  //   console.log("Adding one to streak: ", streakLen, " +1 = ", streakLen+1);
  //   streakLen += 1;
  //   checkStreak();
  //   console.log("New Storage Entry! Key: ", currentDomain, " Value: JSON.stringify(", streakInfoArray),")";
  //   localStorage.setItem(currentDomain, JSON.stringify(streakInfoArray))
  // }); 

  // Clear all records and streaks
  document.getElementById('clearAll').addEventListener('click', function() {
    showDeleteStreakButtons(true);
  });

  document.getElementById('lightDarkToggle').addEventListener('click', function() {
    changeColor(false);
  });
}