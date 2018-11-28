// ==UserScript==
// @name         Rocket Chat Custom Send
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Script to replace default avatar and username with a custom one for Hosted RC instances where users lack that permission
// @author       reffu42
// @match        
// @grant        GM_addStyle
// ==/UserScript==


(function() {
    'use strict';    
    const AVATAR = ""; // Replace with custom avatar url (can be a gif)
    const ALIAS = "";

    function sendSpecial(custom) {
        var roomId = RocketChat.openedRoom;
        var textArea = $('.rc-message-box__textarea');
        var text = textArea.val();
        var roomObj = chatMessages[RocketChat.openedRoom];
        var username = Meteor.user().username;
        var avatar = AVATAR.trim().length > 0? AVATAR : "/avatar/" + username + "?_dc=undefined";
        var alias = ALIAS.trim().length > 0? ALIAS : username;
        var msgObject = {"rid": roomId, "msg":text, "alias":alias, "avatar": avatar, "_id": Random.id()};
        if(custom && !roomObj.editing.id) {
            const match = text.match(/^\/([^\s]+)(?:\s+(.*))?$/m);
            if(text[0] === '/' && match) {
                let command;
                if (RocketChat.slashCommands.commands[match[1]]) {
                    const commandOptions = RocketChat.slashCommands.commands[match[1]];
                    command = match[1];
                    const param = match[2] || '';

                    if (!commandOptions.permission || RocketChat.authz.hasAtLeastOnePermission(commandOptions.permission, Session.get('openedRoom'))) {
                        if (commandOptions.clientOnly) {
                            commandOptions.callback(command, param, msgObject);
                        } else {
                            Meteor.call('slashCommand', { cmd: command, params: param, msg: msgObject },
                                        (err, result) => typeof commandOptions.result === 'function' && commandOptions.result(err, result, { cmd: command, params: param, msg: msgObject }));
                        }
                        textArea.val('');
                        return;
                    }
                }
            }
            Meteor.call("sendMessage", msgObject)
        }
        else {
            roomObj.oldSend(roomId, textArea[0]);
        }
        textArea.val('');
    }

    function setUp() {
        var footers = $('aside footer');
        if(footers.length === 0) {
            setTimeout(setUp, 1000);
            return;
        }
        footers.append('<label style="color:lightgray !important;">Custom Avatar <input type="checkbox" style="vertical-align:middle;" id="send-special" checked/></label>');
        //$('#rocket-chat').addClass('special');
        /*document.getElementById("send-special").onclick = function(){
            $('#rocket-chat').toggleClass('special')
        }*/
        ChatMessages.prototype.oldSend = ChatMessages.prototype.send;
        var specialSend = sendSpecial;
        ChatMessages.prototype.send = function() {
            var special = $('#send-special').prop('checked');
            var roomId = RocketChat.openedRoom;
            var textArea = $('.rc-message-box__textarea')[0];
            specialSend(special);

        };
    }
    setUp();
})();
