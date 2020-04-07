const TIMEOUT_DULATION = 300;
const targetItems = new Map();

const LANGUAGE = (window.navigator.languages && window.navigator.languages[0]) ||
  window.navigator.language ||
  window.navigator.userLanguage ||
  window.navigator.browserLanguage;

function isJapanese(){
  return (LANGUAGE.indexOf('ja') !== -1)
}
  
const Text = {
  'hideBtn' : isJapanese()? 'リプライを表示' : 'Show Replay',
  'showBtn' : isJapanese()? 'リプライを非表示' : 'Hide Replay'
}


let tweetUser;

chrome.runtime.onMessage.addListener(function(message) {

  if(targetItems.size >= 1000){ //とりあえず1000件以上あればクリア
    targetItems.clear();
  }

  if(message.page === 'tweetDetail'){
    if(targetItems.size >= 2000){ //とりあえず2000件以上あればクリア
      targetItems.clear();
    }

    console.log(isJapanese())
    const pattarn =/https:\/\/twitter\.com\/(.+)\/status\/[0-9]+/;
    tweetUser = location.href.match(pattarn)[1];

    window.setTimeout(setObserver, TIMEOUT_DULATION);
  }
});

function setObserver(){
  const section = document.querySelector('section[role="region"]') //元tweetとreplayを持つ
  if(section === null) {
    window.setTimeout(setObserver, TIMEOUT_DULATION);
    return
  }

  replayObsever.observe(section, {
    childList: true,
    subtree: true
  })
}

const replayObsever = new MutationObserver( () => {
  replayObsever.disconnect();

  const articles = document.getElementsByTagName('article');
  for(let index=1; index < articles.length; index++){ // 0は本体のツイート
    const replay = articles[index];
    
    const userInfo = replay.querySelectorAll('div[data-testid="tweet"] span')
    const userID = userInfo[userInfo.length - 1].textContent

    const tweetUserFlag = '@'+tweetUser === userID;

    const replayMessageElm = replay.querySelector('div[lang] span');
    let replayMessage = null;
    let replayLength = 0;

    if(replayMessageElm !== null){
      replayMessage = replayMessageElm.textContent;
      replayLength = replayMessage.length;
    }

    if(replayLength <= 0 && replayMessage === null && !tweetUserFlag){
      deleteReplay(replay);
      // console.log(replayMessage, replayLength)
    }else{
      // console.log(replayMessage, replayLength)
    }
  }

  setObserver()
})


function deleteReplay(elm, btnElm=null){
  const tweet = elm.querySelector('div[data-testid="tweet"]');

  if(targetItems.has(tweet)){
    return;
  }

  if(btnElm === null){
    btnElm = document.createElement("button");
  }

  targetItems.set(tweet, true);

  btnElm.innerHTML = Text.hideBtn;
  btnElm.className = 'remove-replay-button';
  btnElm.onclick = recoverReplay.bind(null, elm, btnElm);
  elm.parentNode.insertBefore(btnElm, elm);

  elm.style.display = "none";
}

function reDeleteReplay(elm, btnElm){
  elm.style.display = "none";
  btnElm.innerHTML = Text.hideBtn;
  btnElm.onclick = recoverReplay.bind(null, elm, btnElm);
}

function recoverReplay(elm, btnElm){
  replayObsever.disconnect();

  const tweet = elm.querySelector('div[data-testid="tweet"]');
  targetItems.set(tweet, false);

  elm.style.display = "block";
  btnElm.innerHTML = Text.showBtn;

  btnElm.onclick = reDeleteReplay.bind(null, elm, btnElm)
  setObserver()
}
