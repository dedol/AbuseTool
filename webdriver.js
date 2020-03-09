var script = document.createElement("script");
script.setAttribute("type", "text/javascript");
script.innerHTML = "const newProto = navigator.__proto__; delete newProto.webdriver; navigator.__proto__ = newProto;";
document.getElementsByTagName("head")[0].prepend(script);
		
// var notify = message => chrome.notifications.create({
  // type: 'basic',
  // iconUrl: 'data/icons/48.png',
  // title: chrome.runtime.getManifest().name,
  // message
// });

// notify('пидараз')