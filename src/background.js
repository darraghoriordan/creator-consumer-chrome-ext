"use strict";
var offStylesheetName = "./css/greyscale-off.css";
var transitionStylesheetName = "./css/greyscale-timer.css";
var notificationDisruptionStylesheetName =
  "./css/disrupt-notification-hooks.css";
var monitorScriptName = "consumerMonitor.js";
var siteList = ["facebook.com", "twitter.com", "pinterest.com", "linkedin.com"];

(function initialiseExtension() {
  badgeIsInitialised(initialiseBadgeCallback);
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
    extensionIsActive(applyConstantPageMods);
  }
});

chrome.tabs.onCreated.addListener(function(tab) {
  console.log("on created called for " + tab.title);
  injectSumtorScripts(tab.url);
  extensionIsActive(applyConstantPageMods);
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
    setBadgeTextOff();
    turnOffDisruptiveNotificationStyles();
    return;
  }
  console.log("turning on extension");
  setBadgeTextOn();
  applyDisruptiveNotificationStyles();
}

function setBadgeTextOff() {
  chrome.browserAction.setBadgeBackgroundColor({ color: '#FF0000'});
  chrome.browserAction.setBadgeText({ text: "off" });
}

function setBadgeTextOn() {
  chrome.browserAction.setBadgeBackgroundColor({ color: '#30a730'});
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
function initialiseBadgeCallback(badgeInitialised) {
  if (!badgeInitialised) {
    setBadgeTextOn();
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

function applyConstantPageMods(extensionActive){
  if (extensionActive)
  {
    applyDisruptiveNotificationStyles();
  }
}

function turnOffDisruptiveNotificationStyles() {
  chrome.tabs.query({}, function(tabs) {
    tabs.forEach(function(item) {
      console.log("sending stop disrupting notifications message to " + item.title);
      chrome.tabs.sendMessage(
        item.id,
        { directive: "turn-off-notification-styles" },
        function(response) {}
      );
    });
  });
}

function applyDisruptiveNotificationStyles() {
  chrome.tabs.query({}, function(tabs) {
    tabs.forEach(function(item) {
      console.log("sending disrupt notifications message to " + item.title);
      chrome.tabs.sendMessage(
        item.id,
        { directive: "apply-notification-styles" },
        function(response) {}
      );
    });
  });
}


function save_options() {
  chrome.storage.sync.set({
    isConsuming: isConsuming
  });
}

function restore_options() {
  chrome.storage.sync.get(
    {
      isConsuming: false
    },
    function(items) {
      isConsuming = items.isConsuming;
    }
  );
}
