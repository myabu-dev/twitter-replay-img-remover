const LANGUAGE = (window.navigator.languages && window.navigator.languages[0]) ||
  window.navigator.language ||
  window.navigator.userLanguage ||
  window.navigator.browserLanguage;

function isJapanese(){
  return (LANGUAGE.indexOf('ja') !== -1)
}
  
const Text = {
  'emoticonLabel' : isJapanese()? '顔文字だけのリプライを隠す' : 'Hide reply only use emoticon'
}

document.getElementById('toggle-emoticon-label').innerHTML = Text.emoticonLabel;
const emoticonSwitch = document.getElementById('toggle-emoticon-checkbox');

chrome.storage.local.get(["emoticonFlg"], function (result) {
  console.log(result.emoticonFlg)
  if(Object.keys(result).length){
    emoticonSwitch.checked = result.emoticonFlg;
  }else{
    emoticonSwitch.checked = false;
  }
  emoticonSwitch.addEventListener('change', emoticonSwitchChange)
  document.getElementById('toggle-emotion-switch').className = "toggle-switch";
});


function emoticonSwitchChange(){
  const emoticonSwitchFlag = emoticonSwitch.checked;

  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs){
    console.log(tabs)
    chrome.tabs.sendMessage(tabs[0].id, {
      type: "emotionFlagChange"
    });
  });

  chrome.storage.local.set({'emoticonFlg': emoticonSwitchFlag}, function () {
    console.log(emoticonSwitchFlag)
  });
}


