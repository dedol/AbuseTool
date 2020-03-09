const storageSet = chrome.storage.local.set;
const storageGet = chrome.storage.local.get;
const HashLength = 30;

let data;
let dataHash;
let g_latestUpdate;
let docId = getRandomString();

storageSet({docId});

generateNewFingerPrint();

// onClicked
// chrome.browserAction.onClicked.addListener(() => {
  // generateNewFingerPrint()
            // .then((generatedHash)=>{
                // dataHash = generatedHash;
				// notify("New canvas noise hash #" + dataHash);
            // });
// });

function generateNewFingerPrint() {
    return new Promise((success, fail)=>{
        data = {};
        data.r = HashLength - randomIntFromInterval(0, HashLength + 10);
        data.g = HashLength - randomIntFromInterval(0, HashLength + 10);
        data.b = HashLength - randomIntFromInterval(0, HashLength + 10);
        data.a = HashLength - randomIntFromInterval(0, HashLength + 10);
        const jsonData = JSON.stringify(data);
        g_latestUpdate = Date.now();
        storageSet({"data": jsonData, "latestUpdate": g_latestUpdate}, ()=>{
            success(md5(jsonData).substring(0, HashLength));
        });
    })
    
}

function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function getRandomString() {
    var text = "";
    var charset = "abcdefghijklmnopqrstuvwxyz";
    for (var i = 0; i < 5; i++)
        text += charset.charAt(Math.floor(Math.random() * charset.length));
    return text;
}

var notify = message => chrome.notifications.create({
  type: 'basic',
  iconUrl: 'img/64x64.png',
  title: chrome.runtime.getManifest().name,
  message
});
