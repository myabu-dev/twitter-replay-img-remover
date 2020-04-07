const TIMEOUT_DULATION = 300;
const twitterHelpPagePattarn = /https:\/\/help\.twitter\.com\/.+/g;

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

let emotionFlag;
chrome.storage.local.get(["emoticonFlg"], function (result) {
  if(Object.keys(result).length){
    emotionFlag= result.emoticonFlg;
  }else{
    emotionFlag = false;
  }
});

chrome.runtime.onMessage.addListener(function(message) {

  if(targetItems.size >= 1000){ //とりあえず1000件以上あればクリア
    targetItems.clear();
  }

  if(message.type === 'emotionFlagChange'){
    chrome.storage.local.get(["emoticonFlg"], function (result) {
      if(Object.keys(result).length){
        emotionFlag= result.emoticonFlg;
      }else{
        emotionFlag = false;
      }
    });
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
    
    const userID = replay.querySelectorAll('div[data-testid="tweet"] span')[2].textContent

    const tweetUserFlag = '@'+tweetUser === userID;

    const replayMessageElm = replay.querySelector('div[lang] span');
    let replayMessage = null;
    let replayLength = 0;

    if(replayMessageElm !== null){
      replayMessage = replayMessageElm.textContent;
      replayLength = replayMessage.length;
    }

    const aTags = replay.querySelectorAll('a[role="link"]');
    let helpFlag = false;
    for(const aTag of aTags){
      if(aTag.href.match(twitterHelpPagePattarn) !== null){
        helpFlag = true;
        break;
      }
    }

    if(replayLength <= 0 && (replayMessage === null || emotionFlag) && !tweetUserFlag && !helpFlag){
      deleteReplay(replay);
      // console.log(replayMessage, replayLength)
      // console.log(replayMessage, replayLength, tweetUserFlag, helpFlag, userID)
    }else{
      // console.log(replayMessage, replayLength, tweetUserFlag, helpFlag, userID)
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
