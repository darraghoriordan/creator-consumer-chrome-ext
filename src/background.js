// Yay! - fun with globals!
// i think chrome puts these in some kind of sandbox context
// for the extension

"use strict";
var greyscaleActiveFlag = false;
var isConsumingFlag = false;
var offScriptName = "./css/greyscale-off.css";
var transitionScriptName = "./css/greyscale-timer.css";
// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
  // Toggle if the user is actively consuming
  isConsumingFlag = !isConsumingFlag;
  console.log("on clicked called for " + tab.title);
  signalConsuming(greyscaleActiveFlag, isConsuming());
});

chrome.tabs.onUpdated.addListener(function(tabId, info, tab) {
  if (info && info.status == "complete") {
    console.log(
      "on updated called for " + tab.title + " because " + info.status
    );
    signalConsuming(greyscaleActiveFlag, isConsuming());
  }
});

chrome.tabs.onCreated.addListener(function(tab) {
  console.log("on created called for " + tab.title);
  signalConsuming(greyscaleActiveFlag, isConsuming());
});

function signalConsuming(isConsumingSignalActive, userIsConsuming) {
  console.log("is consuming:" + isConsumingSignalActive);
  console.log("signalActive:" + userIsConsuming);
  if (isConsumingSignalActive && !userIsConsuming) {
    turnOffGreyScale();
  }

  if (!isConsumingSignalActive && userIsConsuming) {
    turnOnGreyScale();
  }
}

// consumingDetector script checks if isConsuming then passes message to background.js when detected
function isConsuming() {
  // IsConsuming detection
  // if onShittySite -> remove and block hooks (inbox counts / notification counts / infinite scroll)
  // isconsuming = onShittySite + delta scrolly / minute > 1000
  // reset isconsuming on a form
  return isConsumingFlag; // just for testing, this will be smarter
}

function turnOffGreyScale() {
  setGreyscale(offScriptName);
  greyscaleActiveFlag = false;
}

function turnOnGreyScale() {
  setGreyscale(transitionScriptName);
  greyscaleActiveFlag = true;
}

function setGreyscale(scriptName) {
  console.log("Setting greyscale to " + scriptName);
  chrome.tabs.insertCSS(null, {
    file: scriptName
  });
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
