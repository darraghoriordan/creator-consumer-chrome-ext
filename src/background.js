// Yay! - fun with globals!
// i think chrome puts these in some kind of sandbox context
// for the extension

"use strict";
var greyscaleActive = false;
var isConsumingFlag = false;
var imidiateScriptName = "./css/greyscale-imidiate.css";
var offScriptName = "./css/greyscale-off.css";
var transitionScriptName = "./css/greyscale-timer.css";
// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
  // Toggle if the user is actively consuming
  isConsumingFlag = !isConsumingFlag;
  consumerOrCreator();
});

// turn on
// set isConsuming true
// (above will actually be a detection in real extention)

// interval every minute check if isConsuming then
// turn on with transition

chrome.tabs.onUpdated.addListener(function(tab) {
  consumerOrCreator();
});

chrome.tabs.onCreated.addListener(function(tab) {
  consumerOrCreator();
});

function consumerOrCreator() {
  // if greyscale IS active but we're NOT consuming anymore
  if (greyscaleActive && !isConsuming()) {
    // turn it off
    turnOffGreyScale();
  }
  // if greyscale is NOT active but we ARE consuming anymore
  if (!greyscaleActive && isConsuming()) {    
    // turn it on
    turnOnGreyScaleTransition();
  }
}

function isConsuming() {
  // IsConsuming detection
// if onShittySite -> remove and block hooks (inbox counts / notification counts / infinite scroll)
// isconsuming = onShittySite + delta scrolly / minute > 1000
// reset isconsuming on a form 
  return isConsumingFlag; // just for testing, this will be smarter
}

function turnOnGreyScaleTransition() {
  turnOnGreyScale(transitionScriptName);
}

function turnOnGreyScaleImidiate() {
  turnOnGreyScale(imidiateScriptName);
}
// cant do this, this is broken
function turnOffGreyScale() {
  console.log("Setting greyscale OFF");
  chrome.tabs.insertCSS(null, {
    file: offScriptName
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
