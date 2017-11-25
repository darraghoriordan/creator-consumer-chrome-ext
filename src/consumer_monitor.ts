
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
  var titleTimer: number;

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
      titleTimer = setInterval(function(): void {
        // apply for each site - maybe this can be pulled in through config laters
        // and only run the correct one for the page/tab
        // or at least in to array. just lazy for now.
        /* facebook is jewelCount */
        applyStylesToCounters(document.getElementsByClassName("jewelCount"));
        /* facebook likes is _ipp */
        applyStylesToCounters(document.getElementsByClassName("_ipp"));
        applyStylesToCounters(document.getElementsByClassName("_ipn"));
        /*  twitter is .global-nav .count */
        applyStylesToCounters(document.getElementsByClassName("count"));
        /* twitter new tweets bar new-tweets-bar js-new-tweets-bar*/
        applyStylesToCounters(
          document.getElementsByClassName("new-tweets-bar")
        );
        /* twitter like buttons ProfileTweet-action ProfileTweet-action--favorite js-toggleState */
        applyStylesToCounters(
          document.getElementsByClassName("ProfileTweet-action--favorite")
        );
        /* twitter new tweets bar */
        applyStylesToCounters(
          document.getElementsByClassName("new-tweets-bar")
        );

        /* linkedin is nav-item__badge */
        applyStylesToCounters(
          document.getElementsByClassName("nav-item__badge")
        );
        applyStylesToCounters(document.getElementsByClassName("like_toggle"));
        applyStylesToCounters(
          document.getElementsByClassName("feed-base-social-counts")
        );
        changeTitle();
      }, 1000);
    }
    if (request.directive === "turn-off-notification-styles") {
      // apply for each site - maybe this can be pulled in through config laters
      // and only run the correct one for the page/tab
      /* facebook is jewelCount */
      removeStylesFromCounters(document.getElementsByClassName("jewelCount"));
      /* facebook likes is _ipp */
      removeStylesFromCounters(document.getElementsByClassName("_ipp"));
      removeStylesFromCounters(document.getElementsByClassName("_ipn"));
      /*  twitter is .global-nav .count */
      removeStylesFromCounters(document.getElementsByClassName("count"));
      /* twitter new tweets bar new-tweets-bar js-new-tweets-bar*/
      removeStylesFromCounters(
        document.getElementsByClassName("new-tweets-bar")
      );
      /* twitter like buttons ProfileTweet-action ProfileTweet-action--favorite js-toggleState */
      removeStylesFromCounters(
        document.getElementsByClassName("ProfileTweet-action--favorite")
      );
      /* twitter new tweets bar */
      removeStylesFromCounters(
        document.getElementsByClassName("new-tweets-bar")
      );

      /* linkedin is nav-item__badge */
      removeStylesFromCounters(document.getElementsByClassName("like_toggle"));
      removeStylesFromCounters(
        document.getElementsByClassName("nav-item__badge")
      );
      removeStylesFromCounters(
        document.getElementsByClassName("feed-base-social-counts")
      );

      clearInterval(titleTimer);
    }
  });
}
