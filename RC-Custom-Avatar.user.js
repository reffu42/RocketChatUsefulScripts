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
        fileUpload = uploadFile;
    }
    setUp();
     function readAsDataURL(file, callback){
        const reader = new FileReader();
        reader.onload = (e) => callback(e.target.result, file);

        return reader.readAsDataURL(file);
    };

    function showUploadPreview (file, callback) {
        // If greater then 10MB don't try and show a preview
        if (file.file.size > (10 * 1000000)) {
            return callback(file, null);
        }

        if (file.file.type == null) {
            return callback(file, null);
        }

        if ((file.file.type.indexOf('audio') > -1) || (file.file.type.indexOf('video') > -1) || (file.file.type.indexOf('image') > -1)) {
            file.type = file.file.type.split('/')[0];

            return readAsDataURL(file.file, (content) => callback(file, content));
        }

        return callback(file, null);
    };

    function getAudioUploadPreview(file, preview) { return `\
<div class='upload-preview'>
<audio style="width: 100%;" controls="controls">
<source src="${ preview }" type="audio/wav">
Your browser does not support the audio element.
</audio>
</div>
<div class='upload-preview-title'>
<div class="rc-input__wrapper">
<input class="rc-input__element" id='file-name' style='display: inherit;' value='${ Handlebars._escape(file.name) }' placeholder='${ t('Upload_file_name') }'>
</div>
<div class="rc-input__wrapper">
<input class="rc-input__element" id='file-description' style='display: inherit;' value='' placeholder='${ t('Upload_file_description') }'>
</div>
</div>`;
                                                  }

    function getVideoUploadPreview (file, preview) { return `\
<div class='upload-preview'>
<video style="width: 100%;" controls="controls">
<source src="${ preview }" type="video/webm">
Your browser does not support the video element.
</video>
</div>
<div class='upload-preview-title'>
<div class="rc-input__wrapper">
<input class="rc-input__element" id='file-name' style='display: inherit;' value='${ Handlebars._escape(file.name) }' placeholder='${ t('Upload_file_name') }'>
</div>
<div class="rc-input__wrapper">
<input class="rc-input__element" id='file-description' style='display: inherit;' value='' placeholder='${ t('Upload_file_description') }'>
</div>
</div>`; }

    function getImageUploadPreview (file, preview){ return `\
<div class='upload-preview'>
<div class='upload-preview-file' style='background-image: url(${ preview })'></div>
</div>
<div class='upload-preview-title'>
<div class="rc-input__wrapper">
<input class="rc-input__element" id='file-name' style='display: inherit;' value='${ Handlebars._escape(file.name) }' placeholder='${ t('Upload_file_name') }'>
</div>
<div class="rc-input__wrapper">
<input class="rc-input__element" id='file-description' style='display: inherit;' value='' placeholder='${ t('Upload_file_description') }'>
</div>
</div>`; }

    function formatBytes(bytes, decimals) {
        if (bytes === 0) {
            return '0 Bytes';
        }

        const k = 1000;
        const dm = (decimals + 1) || 3;

        const sizes = [
            'Bytes',
            'KB',
            'MB',
            'GB',
            'TB',
            'PB',
        ];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return `${ parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) } ${ sizes[i] }`;
    };

    function getGenericUploadPreview(file) { return `\
<div class='upload-preview'>
<div>${ Handlebars._escape(file.name) } - ${ formatBytes(file.file.size) }</div>
</div>
<div class='upload-preview-title'>
<div class="rc-input__wrapper">
<input class="rc-input__element" id='file-name' style='display: inherit;' value='${ Handlebars._escape(file.name) }' placeholder='${ t('Upload_file_name') }'>
</div>
<div class="rc-input__wrapper">
<input class="rc-input__element" id='file-description' style='display: inherit;' value='' placeholder='${ t('Upload_file_description') }'>
</div>
</div>` };

    async function getUploadPreview (file, preview){
        if (file.type === 'audio') {
            return getAudioUploadPreview(file, preview);
        }

        if (file.type === 'video') {
            return getVideoUploadPreview(file, preview);
        }

        const isImageFormatSupported = () => new Promise((resolve) => {
            const element = document.createElement('img');
            element.onload = () => resolve(true);
            element.onerror = () => resolve(false);
            element.src = preview;
        });

        if (file.type === 'image' && await isImageFormatSupported()) {
            return getImageUploadPreview(file, preview);
        }

        return getGenericUploadPreview(file, preview);
    };
})();
