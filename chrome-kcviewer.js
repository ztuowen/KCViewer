// This file consist of some minor edits to the original file
// Copied from Chromium Sample

// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

function Console() {
}

Console.Type = {
  LOG: "log",
  DEBUG: "debug",
  INFO: "info",
  WARN: "warn",
  ERROR: "error",
  GROUP: "group",
  GROUP_COLLAPSED: "groupCollapsed",
  GROUP_END: "groupEnd"
};

Console.addMessage = function(type, format, args) {
  chrome.runtime.sendMessage({
      command: "sendToConsole",
      tabId: chrome.devtools.tabId,
      args: escape(JSON.stringify(Array.prototype.slice.call(arguments, 0)))
  });
};

// Generate Console output methods, i.e. Console.log(), Console.debug() etc.
(function() {
  var console_types = Object.getOwnPropertyNames(Console.Type);
  for (var type = 0; type < console_types.length; ++type) {
    var method_name = Console.Type[console_types[type]];
    Console[method_name] = Console.addMessage.bind(Console, method_name);
  }
})();

function KCParser() {
};

function sendEntry(title,value) {
  chrome.runtime.sendMessage({
    command: "sendKCEntry",
    tabId: chrome.devtools.tabId,
    args: title, data:value});
}

KCParser.handleEntry = function(har_entry) {
  var parser = document.createElement('a');
  parser.href = har_entry.request.url;
  var res = parser.pathname.split("/");
  if (res[1] == "kcsapi" && har_entry.response.status == 200 && har_entry.response.content.mimeType == "text/plain")
  {
    Console.warn("Requested: " + res[3] + "$" + parser.pathname);
    har_entry.getContent(function(con,enc){
      //Console.warn(con);
      sendEntry(res[res.length-1],con);
    });
  }
};

chrome.devtools.network.getHAR(function(result) {
  var entries = result.entries;
  if (!entries.length) {
    Console.warn("KCViewer suggests that you reload the page to track messages");
  }
  for (var i = 0; i < entries.length; ++i)
    KCParser.handleEntry(entries[i]);

  chrome.devtools.network.onRequestFinished.addListener(
      KCParser.handleEntry.bind(KCParser));
});


chrome.devtools.panels.create(
    'KCViewer',
    null, // No icon path
    './Panel/KCViewerPanel.html',
    null // no callback needed
);
