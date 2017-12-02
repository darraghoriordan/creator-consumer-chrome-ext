if (monitorScriptLoaded) {
  console.log("Cruhahore monitor attempted to load but already loaded.");
} else {
  console.log("Cruhahore monitor loaded!");
  var monitorScriptLoaded: boolean = true;

  var scrollDetectionEnabled: boolean = true;
  var lastScrollTop: number = getScrollPosition();
  // use time or distance, or both?
  var scrollLimit: number = lastScrollTop + 3000;
  var scrollDetectionDebounce: number = 10000;
  var hiddenClassNames: string[] = [
    "jewelCount",
    "_ipp",
    "_ipn",
    "count",
    "new-tweets-bar",
    "ProfileTweet-actionCountForPresentation",
    "new-tweets-bar",
    "nav-item__badge",
    "like_toggle",
    "feed-base-social-counts"
  ];
  // sCROLL DETECTION STUFF
  window.onscroll = function(): number {
    if (!scrollDetectionEnabled) {
      return;
    }
    scrollDetectionEnabled = false;
    return setTimeout(function(): void {
      scrollDetectionEnabled = true;
      scrollEventHandler();
    }, scrollDetectionDebounce);
  };

  function scrollEventHandler(): void {
    let scrollHeight: number = getScrollPosition();

    let limitBroken: boolean = scrollHeight >= lastScrollTop + scrollLimit;
    let scrollingDown: boolean = scrollHeight > lastScrollTop;

    if (scrollingDown && limitBroken) {
      try {
        chrome.runtime.sendMessage({ directive: "scroll-limit-exceeded" });
        // reset the scroll pos
        lastScrollTop = getScrollPosition();
      } catch (e) {
        // happens when parent extension is no longer available or was reloaded
        if (
          e.message.match(/Invocation of form runtime\.connect/) &&
          e.message.match(/doesn't match definition runtime\.connect/)
        ) {
          console.error(
            "Chrome extension, Cruhahore has been reloaded. Please refresh the page"
          );
        } else {
          throw e;
        }
      }
    }
  }

  function getScrollPosition(): number {
    var body: HTMLElement = document.body,
      html: HTMLElement = document.documentElement;

    var scrollPosition: number =
      (window.pageYOffset || (document as any).scrollTop) -
      ((document as any).clientTop || 0);
    if (isNaN(scrollPosition)) {
      return 0;
    }
    return scrollPosition;
  }

  // sTUFF WITH ON PAGE STYLES

  function applyStylesToCounters(
    htmlElementCollection: HTMLCollectionOf<Element>
  ): void {
    [].forEach.call(htmlElementCollection, function(element: Element): void {
      element.classList.add("sumtor-hide-notification");
    });
  }

  function removeStylesFromCounters(
    htmlElementCollection: HTMLCollectionOf<Element>
  ): void {
    [].forEach.call(htmlElementCollection, function(element: Element): void {
      element.classList.remove("sumtor-hide-notification");
    });
  }

  function changeTitle(): void {
    var regExp: RegExp = /\(([^)]+)\)/;
    document.title = document.title.replace(regExp, "");
  }

  chrome.runtime.onMessage.addListener(function(
    request: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: any
  ): void {
    if (request.directive === "apply-notification-styles") {
      // apply for each site - maybe this can be pulled in through config laters
      // and only run the correct one for the page/tab
      hiddenClassNames.forEach((className: string) => {
        applyStylesToCounters(document.getElementsByClassName(className));
      });
      changeTitle();
    }
    if (request.directive === "turn-off-notification-styles") {
      // apply for each site - maybe this can be pulled in through config laters
      // and only run the correct one for the page/tab
      hiddenClassNames.forEach((className: string) => {
        removeStylesFromCounters(document.getElementsByClassName(className));
      });
    }
  });
}
