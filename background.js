// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

//Handle request from devtools 

console.log(chrome.runtime.id);

Port=null;

function bkgReqHandlr(request, sender, callback) {
	  if (request.command == 'sendToConsole')
	  {
		localStorage["llog"] =  request.args;
		console.log(request.command+"$"+request.args);
		chrome.tabs.executeScript(request.tabId, {
		  code: "("+ tab_log + ")('" + request.args + "');",
		});
	  }
	  if (request.command == 'loadKCAPIData')
	  {
		  console.log(request.command);
		  callback(JSON.parse(localStorage["api_start2"]));
	  }
	  if (request.command == 'loadKCData')
	  {
		  console.log(request.command);
		  callback(JSON.parse(localStorage["svdraw"]));
	  }
	  if (request.command == 'clearKCCache')
	  {
		  localStorage.clear();
	  }
	  if (request.command == 'sendKCEntry')
	  {
		parseKCEntry(request.args,request.data);
		notifyNewKCData();
	  }
	}
  
chrome.runtime.onConnect.addListener(function (port) {
	if (port.name=="KCView")
	{
		console.log("port connected");
		port.onMessage.addListener(bkgReqHandlr);
		Port=port;
	}
});

const tab_log = function(json_args) {
  var args = JSON.parse(unescape(json_args));
  console[args[0]].apply(console, Array.prototype.slice.call(args, 1));
}

function parseKCEntry(title,data)
{
  var svd = eval(data);
  if (svd.api_result == 1)
  {
    console.log(title + " successful");
    var apidat = svd.api_data;
    if (title == 'api_start2')
      localStorage[title] = JSON.stringify(apidat);
    else {
      var old_dat = JSON.parse(localStorage["svdraw"]?localStorage["svdraw"]:"{}");
      switch (title)
      {
        case "deck":
          old_dat.port.api_deck_port=apidat;
          break;
        default:
          old_dat[title] = apidat;
      }
      localStorage["svdraw"] = JSON.stringify(old_dat);
    }
  }
}

function notifyNewKCData()
{
	if (Port!=null)
		Port.postMessage({command:'notifyNewKCData'});
	console.log('notify');
}

chrome.runtime.onMessage.addListener(bkgReqHandlr);
