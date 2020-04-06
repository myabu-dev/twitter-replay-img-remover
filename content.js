chrome.runtime.onMessage.addListener(function(message) {
  if(message.page === 'tweetDetail'){
    console.log('tweet detail open');
  }
});