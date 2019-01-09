// ==UserScript==
// @name         Rocket Chat emoji prepend
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Script to prepend text to the beginning of every message (most likely an emoji)
// @author       reffu42
// @match        
// @grant        GM_addStyle
// ==/UserScript==


(function() {
    'use strict';    
    var EMOJI = '';
      
    
    function setUp() {
        var footers = $('aside footer');
        if(footers.length === 0) {
            setTimeout(setUp, 1000);
            return;
        }
        footers.append('<label style="color:lightgray !important;">Emoji Prepend <input type="checkbox" style="vertical-align:middle;" id="prepend-emoji" checked/></label>');            
        ChatMessages.prototype.oldSend = ChatMessages.prototype.send;        
        ChatMessages.prototype.send = function(roomId, textArea) {
            var special = $('#prepend-emoji').prop('checked');
            if(special) {
              textArea.value = EMOJI + " " + textArea.value;
            }
            var roomObj = chatMessages[roomId];
            roomObj.oldSend(roomId, textArea);
        };      
    }
    setUp();

})();
