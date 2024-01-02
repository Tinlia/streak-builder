var currentDomain = "";
var domainPath = "";
var currentDate = new Date();
var dateNum = 0
var streakLen, maxStreak, lastVisit;
var streakInfoArray = [streakLen, maxStreak, lastVisit];
var lightMode = JSON.parse(localStorage.getItem('lightMode'));
if( lightMode == null ){ lightMode = false; localStorage.setItem( 'lightMode' , false ); }

document.addEventListener('DOMContentLoaded', function() {
  getTab();
  changeColor(true);
  dateNum = currentDate.getDate();
  createEventListeners();
});

function checkStreak(){
  if(localStorage.getItem(currentDomain) == null || currentDomain.includes(null)){
    showStartStreakButton()
    document.getElementById('newStreak').addEventListener('click', function() {
      streakInfoArray = [1, 1, dateNum];
      localStorage.setItem(currentDomain, JSON.stringify(streakInfoArray));
      checkStreak();
    })
  }
  else{
    var streakDetails = JSON.parse(localStorage.getItem(currentDomain));
    [streakLen, maxStreak, lastVisit] = streakDetails;
    var differenceInDays = dateNum - lastVisit;
    
    if(differenceInDays == 0){console.log("Same Day!"); streakLen += 0;} 
    else if(differenceInDays == 1){streakLen += 1;}
    else if(differenceInDays <= -29 && dateNum == 1){streakLen +=1;} 
    else{streakLen = 1;}
    
    lastVisit = dateNum;
    if(streakLen > maxStreak){maxStreak = streakLen;}
    showStreakInfo();
    
    streakInfoArray = [streakLen, maxStreak, lastVisit]
    localStorage.setItem(currentDomain, JSON.stringify(streakInfoArray))

    document.getElementById('deleteStreak').addEventListener('click', function() {
      showDeleteStreakButtons(false);
    })
  }
}

function changeColor(firstTime){
  var LDModeButton = document.getElementById('lightDarkToggle');
  var buttons = document.getElementsByClassName('buttonBar');
  if(!firstTime){lightMode = lightMode ? false : true; localStorage.setItem('lightMode', lightMode);}
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

function showStreakInfo(){
  document.getElementById('streak').innerHTML = `
      <p>Current Streak: </br>🔥 ` + streakLen + ` </br>
      <p>Max Streak: </br>🔥 ` + maxStreak + `</p></br>
      <button id="deleteStreak" type="button">🗑️</button>` 
      + `${domainPath.includes('/Tinlia/')?"</br></br><i>Thanks for checking out my work!</i>":""}`;
}

function showStartStreakButton(){
  document.getElementById('streak').innerHTML = `<button id="newStreak" type="button"><b>+</b> Start a 🔥Streak</button>`;
}

function showDeleteStreakButtons(deleteAll) {
  document.getElementById('streak').innerHTML = `
      Delete${deleteAll ? " all of your streaks" : " this streak"}? (This cannot be undone)<br><br>
      <button id="deleteStreakConfirm" type="button">✔️</button>
      <button id="deleteStreakCancel" type="button">❌</button>`;

  document.getElementById('deleteStreakConfirm').addEventListener('click', function() {
    deleteAll ? localStorage.clear() : localStorage.removeItem(currentDomain);
    if(deleteAll){window.close();}
  })

  document.getElementById('deleteStreakCancel').addEventListener('click', function() {
    console.log("Streak Deletion Cancelled!");
    getTab();
  })
}

function getTab(){
  chrome.tabs.query({active:true,currentWindow:true},function(tabArray){
    var domain = new URL(tabArray[0].url);
    if(domain.host != currentDomain){
      currentDomain = domain.host;
      domainPath = domain.pathname;
      if(domain.protocol!='chrome:'){
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

  document.getElementById('clearAll').addEventListener('click', function() {
    showDeleteStreakButtons(true);
  });

  document.getElementById('lightDarkToggle').addEventListener('click', function() {
    changeColor(false);
  });
}