console.log("consumerMonitor loaded!");
var scrollEnabled = true;
var lastScrollTop = getScrollPosition();
var scrollLimit = lastScrollTop + 1000;

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
  }, 250);
};

function scrollEventHandler() {
  scrollHeight = getScrollPosition();

  let limitBroken = scrollHeight >= scrollLimit;
  let scrollingDown = scrollHeight > lastScrollTop;

  if (scrollingDown && limitBroken) {
    chrome.runtime.sendMessage({ directive: "scroll-limit-exceeded" }, function(
      response
    ) {});
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

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.directive == "apply-notification-styles") {
    alert("applying styles!");
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
