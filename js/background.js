const twitterTweetUrlPattarn = /https:\/\/twitter\.com\/.+\/status\/[0-9]+/g;

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete' && tab.url.match(twitterTweetUrlPattarn) !== null) {
    const message = {page : 'tweetDetail'}
    chrome.tabs.sendMessage(tabId, message);
  }
});