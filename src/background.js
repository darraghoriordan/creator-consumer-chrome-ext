var weAreActive = false;
// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
  // No tabs or host permissions needed!
  console.log("Turning " + tab.url + " greyscale!");
  weAreActive = true;
  setTimeout(turnOnGreyScaleTransitionAndTabListener, 3000);
});

function turnOnGreyScaleTransitionAndTabListener() {
  turnOnGreyScaleTransition();
  chrome.tabs.onCreated.addListener(function(tab) {
    turnOnGreyScaleTransition();
  });
}
function turnOnGreyScaleTransition() {
  chrome.tabs.insertCSS(null, {
    file: "./css/greyscale-timer.css"
  });
}

function restore_options() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get(
    {
      favoriteColor: "red",
      likesColor: true
    },
    function(items) {
      document.getElementById("color").value = items.favoriteColor;
      document.getElementById("like").checked = items.likesColor;
    }
  );
}
