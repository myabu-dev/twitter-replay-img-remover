const TIMEOUT_DULATION = 300;

chrome.runtime.onMessage.addListener(function(message) {
  if(message.page === 'tweetDetail'){
    console.log('tweet detail open');
    window.setTimeout(setObserver, TIMEOUT_DULATION);
  }
});

function setObserver(){
  const section = document.querySelector('section[role="region"]') //元tweetとreplayを持つ
  if(section === null) {
    window.setTimeout(setObserver, TIMEOUT_DULATION)
    return
  }

  replayObsever.observe(section, {
    childList: true,
    subtree: true
  })
}

const replayObsever = new MutationObserver( () => {
  const test = document.getElementsByTagName('article');
  console.log(test);
})

