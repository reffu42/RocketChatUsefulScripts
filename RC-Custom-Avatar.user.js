// ==UserScript==
// @name         Rocket Chat Custom Send
// @namespace    http://tampermonkey.net/
// @version      1.7
// @description  Script to replace default avatar and username with a custom one for Hosted RC instances where users lack that permission
// @author       reffu42
// @match        
// @grant        GM_addStyle
// ==/UserScript==


(function() {
    'use strict';    
    const AVATAR = ""; // Replace with custom avatar url (can be a gif)
    const ALIAS = "";
      
     async function sendSpecial(custom) {
        var roomId = RocketChat.openedRoom;
        var textArea = $('.rc-message-box__textarea');
        var text = "";
        var roomObj = chatMessages[RocketChat.openedRoom];
        var avatar = AVATAR.trim().length > 0? AVATAR : null;
        var alias = ALIAS.trim().length > 0? ALIAS : null;
        var msgObject = {"rid": roomId, "msg":text, "alias":alias, "avatar": avatar, "_id": Random.id()};
        const reply = textArea.data('reply');
        const mentionUser = textArea.data('mention-user') || false;

        if(custom && !roomObj.editing.id) {
            if (reply !== undefined) {
                text = `[ ](${ await RocketChat.MessageAction.getPermaLink(reply._id) }) `;
                const roomInfo = RocketChat.models.Rooms.findOne(reply.rid, { fields: { t: 1 } });
                if (roomInfo.t !== 'd' && reply.u.username !== Meteor.user().username && mentionUser) {
                    text += `@${ reply.u.username } `;
                }
            }
            text += textArea.val();
            if(text == "") {
                return;
            }

            roomObj.clearCurrentDraft();
            textArea
                .removeData('reply')
                .trigger('dataChange');
            textArea.val('');
            textArea.trigger('change').trigger('input');
            if (typeof textArea.updateAutogrow === 'function') {
                textArea.updateAutogrow();
            }
            roomObj.hasValue.set(false);
            roomObj.stopTyping(roomId);

            msgObject.msg = text;
            if (text.slice(0, 2) === '+:') {
                const reaction = text.slice(1).trim();
                if (RocketChat.emoji.list[reaction]) {
                    const lastMessage = ChatMessage.findOne({ rid:roomId }, { fields: { ts: 1 }, sort: { ts: -1 } });
                    Meteor.call('setReaction', reaction, lastMessage._id);
                    textArea.val('');
                    textArea.trigger('change').trigger('input');
                    return;
                }
            }

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
                        return;
                    }
                }
            }
            Meteor.call("sendMessage", msgObject)
        }
        else {
            roomObj.oldSend(roomId, textArea[0]);
        }
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
       fileUpload = function(files) {
            Meteor.call('getUsersOfRoom', RocketChat.openedRoom, true, (error, result) => {
                var special = $('#send-special').prop('checked');
                uploadFile(files, special);
            })};
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
 async function uploadFile(files, custom) {
        files = [].concat(files);

        const roomId = Session.get('openedRoom');

        const uploadNextFile = () => {
            const file = files.pop();
            if (!file) {
                modal.close();
                return;
            }

            if (!RocketChat.fileUploadIsValidContentType(file.file.type)) {
                modal.open({
                    title: t('FileUpload_MediaType_NotAccepted'),
                    text: file.file.type || `*.${ strRightBack(file.file.name, '.') }`,
                    type: 'error',
                    timer: 3000,
                });
                return;
            }

            if (file.file.size === 0) {
                modal.open({
                    title: t('FileUpload_File_Empty'),
                    type: 'error',
                    timer: 1000,
                });
                return;
            }

            showUploadPreview(file, async(file, preview) => modal.open({
                title: t('Upload_file_question'),
                text: await getUploadPreview(file, preview),
                showCancelButton: true,
                closeOnConfirm: false,
                closeOnCancel: false,
                confirmButtonText: t('Send'),
                cancelButtonText: t('Cancel'),
                html: true,
                onRendered: () => $('#file-name').focus(),
            }, (isConfirm) => {
                if (!isConfirm) {
                    return;
                }

                const record = {
                    name: document.getElementById('file-name').value || file.name || file.file.name,
                    size: file.file.size,
                    type: file.file.type,
                    rid: roomId,
                    description: document.getElementById('file-description').value,
                };

                const upload = fileUploadHandler('Uploads', record, file.file);

                uploadNextFile();

                const uploads = Session.get('uploading') || [];
                uploads.push({
                    id: upload.id,
                    name: upload.getFileName(),
                    percentage: 0,
                });
                Session.set('uploading', uploads);

                upload.onProgress = (progress) => {
                    const uploads = Session.get('uploading') || [];
                    uploads.filter((u) => u.id === upload.id).forEach((u) => {
                        u.percentage = Math.round(progress * 100) || 0;
                    });
                    Session.set('uploading', uploads);
                };

                upload.start((error, file, storage) => {
                    if (error) {
                        const uploads = Session.get('uploading') || [];
                        uploads.filter((u) => u.id === upload.id).forEach((u) => {
                            u.error = error.message;
                            u.percentage = 0;
                        });
                        Session.set('uploading', uploads);

                        return;
                    }

                    if (!file) {
                        return;
                    }
                    var msgData = {};
                    if(custom) {                                                
                        msgData = {};
                        if(ALIAS) {
                            msgData.alias = ALIAS;
                        }
                        if(AVATAR) {
                            msgData.avatar = AVATAR;   
                        }
                    }
                    Meteor.call('sendFileMessage', roomId, storage, file, msgData, () => {
                        Meteor.setTimeout(() => {
                            const uploads = Session.get('uploading') || [];
                            Session.set('uploading', uploads.filter((u) => u.id !== upload.id));
                        }, 2000);
                    });
                });

                Tracker.autorun((computation) => {
                    const isCanceling = Session.get(`uploading-cancel-${ upload.id }`);
                    if (!isCanceling) {
                        return;
                    }

                    computation.stop();
                    upload.stop();

                    const uploads = Session.get('uploading') || {};
                    Session.set('uploading', uploads.filter((u) => u.id !== upload.id));
                });
            }));
        };

        uploadNextFile();
    };


})();
