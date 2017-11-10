// Yay! - fun with globals!
// i think chrome puts these in some kind of sandbox context
// for the extension

"use strict";
var greyscaleActiveFlag = false;
var isConsumingFlag = false;
var offStylesheetName = "./css/greyscale-off.css";
var transitionStylesheetName = "./css/greyscale-timer.css";
var monitorScriptName = "consumerMonitor.js";

chrome.browserAction.onClicked.addListener(function(tab) {
  console.log("on clicked called for " + tab.title);
  injectMonitorScript();
  signalConsuming(greyscaleActiveFlag, isConsuming());
});

chrome.tabs.onUpdated.addListener(function(tabId, info, tab) {
  if (info && info.status == "complete") {
    console.log(
      "on updated called for " + tab.title + " because " + info.status
    );
    injectMonitorScript();
    signalConsuming(greyscaleActiveFlag, isConsuming());
  }
});

chrome.tabs.onCreated.addListener(function(tab) {
  console.log("on created called for " + tab.title);
  injectMonitorScript();
  signalConsuming(greyscaleActiveFlag, isConsuming());
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  switch (request.directive) {
    case "text-input-interaction":
      console.log("message request: " + request.directive + " from: " + sender.tab.title);
      isConsumingFlag = true;
      signalConsuming(greyscaleActiveFlag, isConsuming());
      sendResponse({}); // sending back empty response to sender
      break;
    default:
      // helps debug when request directive doesn't match
      console.log(
        "Unmatched request of '" +
          request +
          "' from script to background.js from " +
          sender
      );
  }
});
function injectMonitorScript() {
  console.log("Inserting monitor script");
  chrome.tabs.executeScript(null, {
    file: monitorScriptName
  });
}

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
  setGreyscale(offStylesheetName);
  greyscaleActiveFlag = false;
}

function turnOnGreyScale() {
  setGreyscale(transitionStylesheetName);
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
