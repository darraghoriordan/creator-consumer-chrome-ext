"use strict";
var offStylesheetName = "./css/greyscale-off.css";
var transitionStylesheetName = "./css/greyscale-timer.css";
var notificationDisruptionStylesheetName =
  "./css/disrupt-notification-hooks.css";
var monitorScriptName = "consumerMonitor.js";
var siteList = [
  "www.facebook.com",
  "www.twitter.com",
  "www.pinterest.com",
  "www.linkedin.com"
];
(function initialiseExtension() {
  badgeIsInitialised(setActiveCallBack);
})();

chrome.browserAction.onClicked.addListener(function(tab) {
  console.log("browser action clicked called for " + tab.title);
  extensionIsActive(toggleExtensionActive);
  turnOffGreyScale();
});

chrome.tabs.onUpdated.addListener(function(tabId, info, tab) {
  if (info && info.status == "complete") {
    console.log(
      "on updated called for " + tab.title + " because " + info.status
    );
    injectSumtorScripts(tab.url);
  }
});

chrome.tabs.onCreated.addListener(function(tab) {
  console.log("on created called for " + tab.title);
  injectSumtorScripts(tab.url);
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  switch (request.directive) {
    case "scroll-limit-exceeded":
      console.log(
        "message request: " + request.directive + " from: " + sender.tab.title
      );
      extensionIsActive(setGreyscaleCallBack);

      sendResponse({}); // sending back empty response to sender
      break;
    default:
      console.log(
        "Unmatched request of '" +
          request +
          "' from script to background.js from " +
          sender
      );
  }
});
function badgeIsInitialised(callback) {
  chrome.browserAction.getBadgeText({}, function(result) {
    var isInitialised = !!result || (result = "");
    callback(isInitialised);
  });
}

function extensionIsActive(callback) {
  chrome.browserAction.getBadgeText({}, function(result) {
    var extensionIsActive = result === "on";
    callback(extensionIsActive);
  });
}

function toggleExtensionActive(currentValue) {
  if (currentValue) {
    console.log("turning off extension");
    turnOffExtension();
    return;
  }
  console.log("turning on extension");
  turnOnExtension();
}

function turnOffExtension() {
  chrome.browserAction.setBadgeBackgroundColor({ color: [190, 190, 190, 230] });
  chrome.browserAction.setBadgeText({ text: "off" });
}

function turnOnExtension() {
  chrome.browserAction.setBadgeBackgroundColor({ color: [190, 190, 190, 230] });
  chrome.browserAction.setBadgeText({ text: "on" });
}

function injectSumtorScripts(tabUrl) {
  siteList.forEach(function(element) {
    if (tabUrl.toLowerCase().indexOf(element) > 0) {
      injectStylesheet(notificationDisruptionStylesheetName);
      injectMonitorScript();
    }
  }, this);
}
function injectMonitorScript() {
  console.log("Inserting monitor script");
  chrome.tabs.executeScript(null, {
    file: monitorScriptName
  });
}
function setActiveCallBack(badgeInitialised) {
  if (!badgeInitialised) {
    turnOnExtension();
  }
}

function setGreyscaleCallBack(activeStatus) {
  if (activeStatus) {
    turnOnGreyScale();
  }
}

function turnOffGreyScale() {
  injectStylesheet(offStylesheetName);
}

function turnOnGreyScale() {
  injectStylesheet(transitionStylesheetName);
}

function injectStylesheet(scriptName) {
  console.log("inserting stylesheet " + scriptName);
  chrome.tabs.insertCSS(null, {
    file: scriptName
  });
}

function applyNotificationStyles() {
  chrome.tabs.query({}, function(tabs) {
    tabs.foreach(function(item) {
      chrome.tabs.sendMessage(
        item.id,
        { directive: "apply-notification-styles" },
        function(response) {}
      );
    });
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
