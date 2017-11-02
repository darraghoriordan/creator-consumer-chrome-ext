// Yay! - fun with globals!
var greyscaleActive = false;
var isConsumingFlag = false;
var immidiateScriptName = "./css/greyscale-immidiate.css";
var transitionScriptName = "./css/greyscale-timer.css";
// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
  // Toggle active
  isConsumingFlag = toggleFlag(isConsumingFlag);
  //run this to get immidiate feedback on tab
  consumerOrCreator();
});

function toggleFlag(flagValue) {
  if (!flagValue) {
    return true;
  }
  return false;
}

// turn on
// set isConsuming manually
// (above will actually be a detection in real extention)
// interval every second check if isConsuming then
// if alreadyActive turn on immidiate
// otherwise turn on with transition

chrome.tabs.onUpdated.addListener(function(tab) {
  consumerOrCreator();
});

chrome.tabs.onCreated.addListener(function(tab) {
  consumerOrCreator();
});

function consumerOrCreator() {
  if (greyscaleActive && !isConsuming()) {
    // if greyscale IS active but we're NOT consuming anymore
    // turn it off
    turnOffGreyScale();
  }
  if (!greyscaleActive && isConsuming()) {
    // if greyscale is NOT active but we ARE consuming anymore
    // turn it on
    turnOnGreyScaleTransition();
  }
}

function isConsuming() {
  return isConsumingFlag; // just for testing, this will be smarter
}

function turnOnGreyScaleTransition() {
  turnOnGreyScale(transitionScriptName);
}

function turnOnGreyScaleImmidiate() {
  turnOnGreyScale(immidiateScriptName);
}
// cant do this, this is broken
function turnOffGreyScale() {
  console.log("Setting greyscale OFF");
  [immidiateScriptName, transitionScriptName].forEach(function(fileName) {
    chrome.tabs.removeCSS(null, {
      file: fileName
    });
  });
  greyscaleActive = false;
}

function turnOnGreyScale(scriptName) {
  console.log("Setting greyscale to " + scriptName);
  chrome.tabs.insertCSS(null, {
    file: scriptName
  });
  greyscaleActive = true;
}

// save settings

// function save_options() {
//   chrome.storage.sync.set({
//     isConsuming: isConsuming
//   });
// }

// function restore_options() {
//   chrome.storage.sync.get(
//     {
//       isConsuming: false
//     },
//     function(items) {
//       isConsuming = items.isConsuming;
//     }
//   );
// }
