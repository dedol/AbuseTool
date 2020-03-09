/* globals resolve, offsets */
'use strict';

var df = (new Date()).getTimezoneOffset();

var notify = message => chrome.notifications.create({
  type: 'basic',
  iconUrl: 'icons/48.png',
  title: chrome.runtime.getManifest().name,
  message
});

var randoms = {};
chrome.tabs.onRemoved.addListener(tabId => delete randoms[tabId]);

var onCommitted = ({url, tabId, frameId}) => {
  if (url && url.startsWith('http')) {
    let location = localStorage.getItem('location');
    const standard = localStorage.getItem('standard');
    const daylight = localStorage.getItem('daylight');

    let offset = localStorage.getItem('offset') || 0;
    let msg = localStorage.getItem('isDST') === 'false' ? standard : daylight;

    if (localStorage.getItem('random') === 'true') {
      const ofs = Object.keys(offsets);
      if (frameId === 0 || randoms[tabId] === undefined) {
        location = ofs[Math.floor(Math.random() * ofs.length)];
        randoms[tabId] = location;
      }
      else {
        location = randoms[tabId];
      }
      const o = resolve.analyze(location);
      offset = o.offset;
      msg = offset !== o.offset ? o.storage.msg.daylight : o.storage.msg.standard;
    }
    chrome.tabs.executeScript(tabId, {
      runAt: 'document_start',
      frameId,
      matchAboutBlank: true,
      code: `document.documentElement.appendChild(Object.assign(document.createElement('script'), {
        textContent: 'Date.prefs = ["${location}", ${-1 * offset}, ${df}, "${msg}"];'
      })).remove();`
    }, () => chrome.runtime.lastError);
  }
};

var update = () => chrome.storage.local.get({
  enabled: true
}, ({enabled}) => {
  if (enabled) {
    chrome.webNavigation.onCommitted.addListener(onCommitted);
  }
  else {
    chrome.webNavigation.onCommitted.removeListener(onCommitted);
  }
  chrome.browserAction.setTitle({
    title: chrome.runtime.getManifest().name
  });
});
chrome.storage.onChanged.addListener(prefs => {
  if (prefs.enabled) {
    update();
  }
});
update();

var set = (timezone = 'Etc/GMT') => {
  const {offset, storage} = resolve.analyze(timezone);
  localStorage.setItem('offset', offset);
  localStorage.setItem('isDST', offset !== storage.offset);
  localStorage.setItem('location', timezone);
  localStorage.setItem('daylight', storage.msg.daylight);
  localStorage.setItem('standard', storage.msg.standard);
};

// browserAction
chrome.browserAction.onClicked.addListener(() => {
  server();
});

var server = async(silent = true) => {
  try {
    const timezone = await resolve.remote();
    set(timezone);
	console.log('Timezone is changed to ' + timezone);
    notify('Timezone is changed to ' + timezone);
  }
  catch(e) {
	console.log(e.message);
	notify(e.message);
  }
};

var server_silent = async(silent = true) => {
  try {
    const timezone = await resolve.remote();
    set(timezone);
	console.log('Timezone is changed to ' + timezone);
    //notify('Timezone is changed to ' + timezone);
  }
  catch(e) {
	console.log(e.message);
	//notify(e.message);
  }
};

// onInstalled
chrome.runtime.onInstalled.addListener(() => {
  set(localStorage.getItem('location') || 'Etc/GMT');
  server_silent();
});