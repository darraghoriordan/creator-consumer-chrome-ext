// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
  // No tabs or host permissions needed!
  console.log("Turning " + tab.url + " greyscale!");
  chrome.tabs.insertCSS(null, {
    file: "./css/creatororconsumer.css"
  });
  // chrome.tabs.executeScript({
  //   code: 'document.body.style="filter: grayscale(100%);"'
  // });
});
