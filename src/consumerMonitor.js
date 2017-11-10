console.log("consumerMonitor loaded!");
var lastScrollTop = getScrollPosition();
var scrollLimit = lastScrollTop + 500;

window.onscroll = function() {
  scrollHeight = getScrollPosition();

  let limitBroken = scrollHeight >= scrollLimit;
  let scrollingDown = scrollHeight > lastScrollTop;

  if (scrollingDown && limitBroken) {
    chrome.runtime.sendMessage(
      { directive: "text-input-interaction" },
      function(response) {}
    );
  }

  lastScrollTop = scrollHeight;
};

function getScrollPosition() {
  var body = document.body,
    html = document.documentElement;

  var scrollPosition = (window.pageYOffset || document.scrollTop)  - (document.clientTop || 0);

  return scrollPosition;
}
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
