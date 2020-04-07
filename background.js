const twitterTweetUrlPattarn = /https:\/\/twitter\.com\/.+\/status\/[0-9]+/g;

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete' && tab.url.match(twitterTweetUrlPattarn) !== null) {
    console.log(tab.url.match(twitterTweetUrlPattarn));
    const message = {page : 'tweetDetail'}
    chrome.tabs.sendMessage(tabId, message);
  }
});