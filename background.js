// This file consist of minor modification and enhancement to the original file
// Copied from the Chromium sample

// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

//Handle request from devtools 

Port=null;
svdraw = JSON.parse(localStorage["svdraw"]?localStorage["svdraw"]:"{}");
apist = JSON.parse(localStorage["api_start2"]?localStorage["api_start2"]:"{}");

function filterById(id,elem)
{
      return elem.api_id==id;
}

function findById(id,elems)
{
  for (var i=0;i<elems.length;++i)
      if (elems[i].api_id == id)
      return i;
  return -1;
}

function replaceId(items,id,elems)
{
  for (var i=0;i<items.length;++i)
  {
    items[i][id] = findById(items[i][id],elems);
  }
}

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
		  callback(apist);
	  }
	  if (request.command == 'loadKCData')
	  {
		  console.log(request.command);
		  callback(svdraw);
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


idUpdate = new function(){
  this.portship = function()
  {
    replaceId(svdraw.port.api_ship,"api_ship_id",apist.api_mst_ship);
  }
  this.mst = function()
  {
    replaceId(apist.api_mst_ship,"api_stype",apist.api_mst_stype);
    replaceId(apist.api_mst_mission,"api_maparea_id",apist.api_mst_maparea);
  }
}


function parseKCEntry(title,data)
{
  var svd = eval(data);
  if (svd.api_result == 1)
  {
    console.log(title + " successful");
    var apidat = svd.api_data;
    if (title == 'api_start2')
    {
      apist = apidat;
      idUpdate.mst();
      localStorage["api_start2"] = JSON.stringify(apist);
    }
    else {
      svdraw[title] = apidat;
      switch (title)
      {
        case "deck":
          svdraw.port.api_deck_port=apidat;
          break;
        case "ndock":
          svdraw.port.api_ndock=apidat;
          break;
        case "getship":
          svdraw.kdock=apidat.api_kdock;
          break;
        case "port":
          idUpdate.portship();
          break;

      }
      localStorage["svdraw"] = JSON.stringify(svdraw);
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
