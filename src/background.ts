"use strict";
var offStylesheetName: string = "./css/greyscale-off.css";
var transitionStylesheetName: string = "./css/greyscale-timer.css";
var notificationDisruptionStylesheetName: string =
  "./css/disrupt-notification-hooks.css";
var monitorScriptName: string = "js/consumer_monitor.js";
var vendorScriptName: string = "js/vendor.js";
var siteList: Array<string> = [
  "facebook.com",
  "twitter.com",
  "pinterest.com",
  "linkedin.com"
];
var setHarshScrollActions: boolean = false;

(function initialiseExtension(): void {
  badgeIsInitialised(initialiseBadgeCallback);
})();

chrome.browserAction.onClicked.addListener(function onClickedListener(
  tab: chrome.tabs.Tab
): void {
  chrome.extension.onRequest.removeListener(onClickedListener);
  console.log("browser action clicked called for " + tab.title);
  extensionIsActive(tab, toggleExtensionActive);
  turnOffGreyScale(tab.id);
});

chrome.tabs.onUpdated.addListener(function tabUpdatedListener(
  tabId: number,
  info: chrome.tabs.TabChangeInfo,
  tab: chrome.tabs.Tab
): void {
  // chrome.extension.onRequest.removeListener(tabUpdatedListener);
  if (info && info.status && tab && tab.status === "complete") {
    console.log(
      "on updated called for " + tab.title + " because " + info.status
    );

    isInSiteList(tab, injectSumtorScripts);
    extensionIsActive(tab, applyConstantPageMods);
  }
});

chrome.tabs.onCreated.addListener(function(tab: chrome.tabs.Tab): void {
  console.log("on created called for " + tab.title);
  isInSiteList(tab, injectSumtorScripts);
  extensionIsActive(tab, applyConstantPageMods);
});
function sendNotification(tab: chrome.tabs.Tab, activeStatus: boolean): void {
  if (!activeStatus) {
    return;
  }
  var appIconUrl: string = chrome.runtime.getURL("/icons/cru_logo_sq128.png");
  chrome.notifications.create(null, {
    type: "basic",
    title: "Uh-Oh! You're getting lost",
    message:
      "It looks like you're getting lost in the feed so we're going to degrade the experience." +
      " You can disable this anytime by clicking the Cruhahore icon. GO BUILD SOMETHING!",
    iconUrl: appIconUrl
  });
}
chrome.runtime.onMessage.addListener(function(
  request: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: any
): void {
  switch (request.directive) {
    case "scroll-limit-exceeded":
      console.log(
        "message request: " + request.directive + " from: " + sender.tab.title
      );
      if (setHarshScrollActions) {
        extensionIsActive(sender.tab, setGreyscaleCallBack);
        extensionIsActive(sender.tab, sendNotification);
        sendResponse({}); // sending back empty response to sender
      }
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

function badgeIsInitialised(callback: (result: boolean) => void): void {
  chrome.browserAction.getBadgeText({}, function(result: string): void {
    var isInitialised: boolean = !!result || result !== "";
    callback(isInitialised);
  });
}

function extensionIsActive(
  tab: chrome.tabs.Tab,
  callback: (tab: chrome.tabs.Tab, extensionIsActive: boolean) => void
): void {
  chrome.browserAction.getBadgeText({}, function(result: string): void {
    var extensionIsActive: boolean = result === "on";
    callback(tab, extensionIsActive);
  });
}

function toggleExtensionActive(
  tab: chrome.tabs.Tab,
  currentValue: boolean
): void {
  if (currentValue) {
    console.log("turning off cruhahore extension");
    setBadgeTextOff();
    turnOffDisruptiveNotificationStyles();
    return;
  }
  console.log("turning on cruhahore extension");
  setBadgeTextOn();
  applyDisruptiveNotificationStylesAllTabs();
}

function setBadgeTextOff(): void {
  chrome.browserAction.setBadgeBackgroundColor({
    color: "#FF0000"
  });
  chrome.browserAction.setBadgeText({
    text: "off"
  });
}

function setBadgeTextOn(): void {
  chrome.browserAction.setBadgeBackgroundColor({
    color: "#30a730"
  });
  chrome.browserAction.setBadgeText({
    text: "on"
  });
}

function isInSiteList(
  tab: chrome.tabs.Tab,
  callback: (tab: chrome.tabs.Tab) => void
): void {
  siteList.forEach(function(element: string): void {
    if (tab.url.toLowerCase().indexOf(element) > 0) {
      callback(tab);
    }
  }, this);
}

function injectSumtorScripts(tabItem: chrome.tabs.Tab): void {
  console.log("Inserting monitor script to " + tabItem.title);
  injectStylesheet(tabItem.id, notificationDisruptionStylesheetName);
  injectMonitorScript(tabItem.id);
}

function injectMonitorScript(tabId: number): void {
    chrome.tabs.executeScript(tabId, {
        file: vendorScriptName
      });
  chrome.tabs.executeScript(tabId, {
    file: monitorScriptName
  });
}

function initialiseBadgeCallback(badgeInitialised: boolean): void {
  if (!badgeInitialised) {
    setBadgeTextOn();
  }
}

function setGreyscaleCallBack(
  tab: chrome.tabs.Tab,
  activeStatus: boolean
): void {
  if (activeStatus) {
    turnOnGreyScale(tab.id);
  }
}

function turnOffGreyScale(tabId: number): void {
  injectStylesheet(tabId, offStylesheetName);
}

function turnOnGreyScale(tabId: number): void {
  injectStylesheet(tabId, transitionStylesheetName);
}

function injectStylesheet(tabId: number, scriptName: string): void {
  console.log("inserting stylesheet " + scriptName);
  chrome.tabs.insertCSS(tabId, {
    file: scriptName
  });
}

function applyConstantPageMods(
  tab: chrome.tabs.Tab,
  extensionActive: boolean
): void {
  if (extensionActive) {
    applyDisruptiveNotificationStyles(tab);
  }
}

function turnOffDisruptiveNotificationStyles(): void {
  chrome.tabs.query({}, function(tabs: Array<chrome.tabs.Tab>): void {
    tabs.forEach(function(item: chrome.tabs.Tab): void {
      isInSiteList(item, function(item: chrome.tabs.Tab): void {
        console.log(
          "sending stop disrupting notifications message to " + item.title
        );
        chrome.tabs.sendMessage(item.id, {
          directive: "turn-off-notification-styles"
        });
      });
    });
  });
}
function applyDisruptiveNotificationStyles(tabItem: chrome.tabs.Tab): void {
  isInSiteList(tabItem, function(tabItem: chrome.tabs.Tab): void {
    console.log("sending disrupt notifications message to " + tabItem.title);
    chrome.tabs.sendMessage(tabItem.id, {
      directive: "apply-notification-styles"
    });
  });
}
function applyDisruptiveNotificationStylesAllTabs(): void {
  chrome.tabs.query({}, function(tabs: Array<chrome.tabs.Tab>): void {
    tabs.forEach(function(item: chrome.tabs.Tab): void {
      applyDisruptiveNotificationStyles(item);
    });
  });
}
