// ==UserScript==
// @name         Rocket Chat emoji prepend
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Script to prepend text to the beginning of every message (most likely an emoji)
// @author       reffu42
// @match        
// @grant        GM_addStyle
// ==/UserScript==


(function() {
    'use strict';    
    const EMOII = '';
      
    
    function setUp() {
        var footers = $('aside footer');
        if(footers.length === 0) {
            setTimeout(setUp, 1000);
            return;
        }
        footers.append('<label style="color:lightgray !important;">Emoji Prepend <input type="checkbox" style="vertical-align:middle;" id="send-special" checked/></label>');     
        var oldSend = ChatMessages.prototype.send;
        ChatMessages.prototype.oldSend = ChatMessages.prototype.send;
        var specialSend = sendSpecial;
        ChatMessages.prototype.send = function(roomId, textArea) {
            var special = $('#send-special').prop('checked');
            if(special) {
              textArea.val = EMOJI + textArea.val;
            }
            oldSend(roomId, textArea);
        };      
    }
    setUp();

})();
