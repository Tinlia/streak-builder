# StreakBuilder
A simple Chrome extension that builds and manages streaks on visited websites.

![GitHub last commit (by committer)](https://img.shields.io/github/last-commit/Tinlia/streak-builder)
![GitHub (Pre-)Release Date](https://img.shields.io/github/release-date-pre/Tinlia/streak-builder)
![GitHub repo size](https://img.shields.io/github/repo-size/Tinlia/streak-builder)
![GitHub commit activity (branch)](https://img.shields.io/github/commit-activity/w/Tinlia/streak-builder)


# Key Features

## Streaks
**Streaks** are counters you can increase with daily activity on websites. 
For any site, you can choose to start a streak for it by opening the extension and clicking "+ Start a Streak." 
Come back each day to that website to watch your streak grow!

## Easy-to-use
Start and stop streaks with just the click of a button. Quick response times and a simple layout converge to create an efficient user experience.
<p align="center">
  <img src="https://github.com/Tinlia/streak-builder/assets/65005430/b64bc5d3-c89a-4cc2-8a75-8d5572ba3684" width="40%">
</p>

## View Streaks At A Glance
The extension uses `background.js` to update the extension's badgeText to reflect the current streak length of the domain
<p align="center">
  <img src="https://github.com/Tinlia/streak-builder/assets/65005430/a7567ecf-094b-453c-ad85-a1eb41e4f2cb" width="50px" height="50px">
  <img src="https://github.com/Tinlia/streak-builder/assets/65005430/50e2377b-c369-4d62-a33b-23ae43481809" width="50px" height="50px">
  <br>
  <i>Active Streak vs No Streak</i>
</p>

## Minimal Data Storage and Easy Removal
- All data is stored using `chrome.storage.local`, and no requests are sent to other servers.
- On making a streak, the only info stored is the current tab's domain (i.e., `www.github.com`)
- Without making a streak, no information is stored. The current tab is assigned to a variable when opening the extension and is wiped after closing the extension or switching tabs.
- With making a streak, only the following info is stored: `{DomainName: [StreakLength, MaxStreak, DayNumberOfLastVisit]}`, and if DarkMode is enabled
- At any point, the user may delete any and all stored information by clicking the `Clear All` button. This will call `chrome.storage.local.clear()`, wiping everything from storage, ending all streaks, and setting the default view to light mode.
```popup.js
  console.log(deleteAll ? "Removing all entries..." : "Deleting streak by removing ", currentDomain);
      if(deleteAll) {
        chrome.storage.local.clear(function() {
          ...
        });
      }
```
## CSP Compliance
- StreakBuilder uses no inline JS or commands, complying with the [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

# Permissions Required
## `storage`
- Allows StreakBuilder to locally store streak information with `chrome.storage.local`
- Allows the service worker to access the streak data that popup.js stores
## `tabs` and `activeTab`
- Allows popup.js to identify the domain of the current tab to display on the extension.
- Allows background.js to update the badgeText to reflect the domain's current streak

# Inspiration
An excellent [TED Talk presentation](https://www.youtube.com/watch?v=P6FORpg0KVo) from Loui von Ahn, the founder of Duolingo, on the power of streaks for learning and building strong habits.
