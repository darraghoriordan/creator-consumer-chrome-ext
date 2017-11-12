console.log("consumerMonitor loaded!");
var scrollEnabled = true;
var lastScrollTop = getScrollPosition();
var scrollLimit = lastScrollTop + 3000;
var scrollDetectionDebounce = 2000;
var titleTimer;

window.onscroll = function() {
  if (!scrollEnabled) {
    return;
  }
  scrollEnabled = false;
  return setTimeout(function() {
    scrollEnabled = true;
    scrollEventHandler();
    //reset the scroll pos
    lastScrollTop = getScrollPosition();
  }, scrollDetectionDebounce);
};

function scrollEventHandler() {
  scrollHeight = getScrollPosition();

  let limitBroken = scrollHeight >= scrollLimit;
  let scrollingDown = scrollHeight > lastScrollTop;

  if (scrollingDown && limitBroken) {
    try {
      chrome.runtime.sendMessage(
        { directive: "scroll-limit-exceeded" },
        function(response) {}
      );
    } catch (e) {
      // Happens when parent extension is no longer available or was reloaded
      console.warn(
        "Could not communicate with parent extension, deregistering observer"
      );
      observer.disconnect();
    }
  }

  lastScrollTop = scrollHeight;
}

function getScrollPosition() {
  var body = document.body,
    html = document.documentElement;

  var scrollPosition =
    (window.pageYOffset || document.scrollTop) - (document.clientTop || 0);
  if (isNaN(scrollPosition)) {
    return 0;
  }
  return scrollPosition;
}
function applyStylesToCounters(htmlElementCollection) {
  [].forEach.call(htmlElementCollection, function(element) {
    element.classList.add("sumtor-hide-notification");
  });
}
function removeStylesFromCounters(htmlElementCollection) {
  [].forEach.call(htmlElementCollection, function(element) {
    element.classList.remove("sumtor-hide-notification");
  });
}
function changeTitle() {
  var regExp = /\(([^)]+)\)/;
  document.title = document.title.replace(regExp, "");
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.directive == "apply-notification-styles") {
    //apply for each site - maybe this can be pulled in through config laters
    // and only run the correct one for the page/tab
    /* facebook is jewelCount */
    applyStylesToCounters(document.getElementsByClassName("jewelCount"));
    /* facebook likes is _ipp */
    applyStylesToCounters(document.getElementsByClassName("_ipp"));
    /*  twitter is .global-nav .count */
    applyStylesToCounters(document.getElementsByClassName("count"));
    /* twitter new tweets bar new-tweets-bar js-new-tweets-bar*/
    applyStylesToCounters(document.getElementsByClassName("new-tweets-bar"));
    /* twitter like buttons ProfileTweet-action ProfileTweet-action--favorite js-toggleState */
    applyStylesToCounters(
      document.getElementsByClassName("ProfileTweet-action--favorite")
    );
    /* twitter new tweets bar */
    applyStylesToCounters(document.getElementsByClassName("new-tweets-bar"));
    /* linkedin is nav-item__badge */
    applyStylesToCounters(document.getElementsByClassName("nav-item__badge"));

    titleTimer = setInterval(function() {
      changeTitle();
    }, 1000);
  }
  if (request.directive == "turn-off-notification-styles") {
    //apply for each site - maybe this can be pulled in through config laters
    // and only run the correct one for the page/tab
    /* facebook is jewelCount */
    removeStylesFromCounters(document.getElementsByClassName("jewelCount"));
    /*  twitter is .global-nav .count */
    removeStylesFromCounters(document.getElementsByClassName("count"));
    /* linkedin is nav-item__badge */
    removeStylesFromCounters(
      document.getElementsByClassName("nav-item__badge")
    );
    clearInterval(titleTimer);
  }
});
// function idleLogout() {
//     var t;
//     window.onload = resetTimer;
//    // window.onkeypress = resetTimer;

//     function logout() {
//         window.location.href = 'logout.php';
//     }

//     function resetTimer() {
//         clearTimeout(t);
//         t = setTimeout(logout, 10000);  // time is in milliseconds
//     }
// }
// idleLogout();
