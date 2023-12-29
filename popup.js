var currentDomain = "";
var currentDate = new Date();
var dateNum = 0
var streakLen, maxStreak, lastVisit;
var streakInfoArray = [streakLen, maxStreak, lastVisit];

document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM Loaded");
  getTab();
  console.log("dateNum = currentDate.getDate() | ", dateNum, " = ", currentDate, ".getDate() (", currentDate.getDate(),")");
  dateNum = currentDate.getDate();

  // Clear all records and streaks
  document.getElementById('clearAll').addEventListener('click', function() {
    showDeleteStreakButtons(true);
    //// Future me: find a way to reduce this
    document.getElementById('deleteStreakConfirm').addEventListener('click', function() {
      console.log("Removing all entries...");
      localStorage.clear();
      showStartStreakButton();
      console.log("Local Storage Cleared!");
      dateNum = currentDate.getDate();
      getTab();
    })
    
    // Cancel Delete Listener
    document.getElementById('deleteStreakCancel').addEventListener('click', function() {
      console.log("Streak Deletion Cancelled!");
      getTab();
    })
  })

  document.getElementById('lightDarkToggle').addEventListener('click', function() {
    var slider = document.getElementById('lightDarkToggle');
    var clearButton = document.getElementById('clearAll');

    if(slider.value == 'light'){ 
      document.body.style.backgroundColor = `rgb(53, 47, 66)`;
      document.body.style.color = 'white';
      document.getElementById('body-block').style.backgroundColor = `rgb(80, 72, 97)`;
      
      clearButton.style.backgroundColor = `rgb(70, 62, 87)`;
      clearButton.style.color = `white`;
      slider.style.backgroundColor = `rgb(70, 62, 87)`;
      slider.innerHTML = '☀️';
      slider.value = 'dark';
    }
    else{
      document.body.style.backgroundColor = `white`;
      document.body.style.color = 'black';
      document.getElementById('body-block').style.backgroundColor = `rgb(240, 240, 240)`;
      
      clearButton.style.backgroundColor = `rgb(224, 224, 224)`;
      clearButton.style.color = `black`;
      slider.style.backgroundColor = `rgb(224, 224, 224)`;
      slider.innerHTML = '🌙';
      slider.value = 'light';
    }
  });
});

// checkStreak()
function checkStreak(){
  console.log("Checking Streak..");
  // Check if there's a dict in storage
  // If the domain doesn't have a streak
  if(localStorage.getItem(currentDomain) == null || currentDomain[0] == null){
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
    streakLen = streakDetails[0];
    maxStreak = streakDetails[1];
    lastVisit = streakDetails[2];
    console.log("Streak details declared! Current: ",streakDetails);

    //// NOTE: This is a bandage fix and should be changed to properly represent the difference in dates

    // To calculate the difference in days between the two dates
    console.log("Getting dates from ", dateNum ," and ", lastVisit);
    var differenceInDays = dateNum - lastVisit;
    
    if(differenceInDays == 0){console.log("Same Day!");} // If the same day
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
      // Confirm Delete Listener
      document.getElementById('deleteStreakConfirm').addEventListener('click', function() {
        console.log("Deleting streak by removing ", currentDomain);
        localStorage.removeItem(currentDomain);
        showStartStreakButton();
        console.log("checkStreak() called");
        checkStreak();
      })
      
      // Cancel Delete Listener
      document.getElementById('deleteStreakCancel').addEventListener('click', function() {
        console.log("Streak Deletion Cancelled!");
        checkStreak();
      })
    })
  }
}


// Button Displayers
function showStreakInfo(){
  document.getElementById('streak').innerHTML = `
      <p>Current Streak: </br>🔥 ` + streakLen + ` 
      </br></br>
      <p>Max Streak: </br>🔥 ` + maxStreak + `</p>
      </br>
      <button id="deleteStreak" type="button">🗑️</button>   
      `;
}

function showStartStreakButton(){
  document.getElementById('streak').innerHTML = `
    <button id="newStreak" type="button"><b>+</b> Start a 🔥Streak</button>
    `;
}

function showDeleteStreakButtons(deleteAll){
  document.getElementById('streak').innerHTML = `
      Delete` + (deleteAll ? " all of your streaks" : " this streak") + `? (This cannot be undone)
      <br><br>
      <button id="deleteStreakConfirm" type="button">✔️</button>
      <button id="deleteStreakCancel" type="button">❌</button>
      `;
}

function getTab(){
  console.log("Querying current tab...");
  // Fetch current tab's website title and update popup with domain name
  chrome.tabs.query({active:true,currentWindow:true},function(tabArray){
    var domain = new URL(tabArray[0].url);
    console.log('Domain updated: ', domain.host);
    // If switching to a different website
    if(domain.host != currentDomain){
      currentDomain = domain.host;
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