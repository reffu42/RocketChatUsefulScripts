// ==UserScript==
// @name         Rocket Chat Remove Edit Restriction
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Script to remove edit timeout in RC installations
// @author       reffu42
// @match        
// @grant        GM_addStyle
// ==/UserScript==

(function() {
'use strict'; 
   function setUp() {
        if(typeof ChatMessages == 'undefined') {        
            setTimeout(setUp, 1000);
            return;
        }
        ChatMessages.prototype.edit = function (element, index) {
            var roomObj = chatMessages[RocketChat.openedRoom];
            specialEdit(element, index, roomObj);
        };
   }
   setUp();
  
   function specialEdit(element, index, roomObj)
    {
		index = index != null ? index : roomObj.getEditingIndex(element);

		const message = roomObj.getMessageById(element.getAttribute('id'));

		const hasPermission = RocketChat.authz.hasAtLeastOnePermission('edit-message', message.rid);
		const editAllowed = RocketChat.settings.get('Message_AllowEditing');
		const editOwn = message && message.u && message.u._id === Meteor.userId();

		if (!hasPermission && (!editAllowed || !editOwn)) { return; }
		if (element.classList.contains('system')) { return; }

		const draft = roomObj.getMessageDraft(message._id);
		let msg = draft && draft.draft;
		msg = msg || message.msg;

		const editingNext = roomObj.editing.index < index;

		// const old_input = roomObj.input.value;

		roomObj.clearEditing();

		roomObj.hasValue.set(true);
		roomObj.editing.element = element;
		roomObj.editing.index = index;
		roomObj.editing.id = message._id;
		// TODO: stop set two elements
		roomObj.input.parentElement.classList.add('editing');
		roomObj.input.classList.add('editing');

		element.classList.add('editing');
		roomObj.$input.closest('.message-form').addClass('editing');

		if (message.attachments && message.attachments.length > 0 && message.attachments[0].description) {
			roomObj.input.value = message.attachments[0].description;
		} else {
			roomObj.input.value = msg;
		}
		$(roomObj.input).trigger('change').trigger('input');

		const cursor_pos = editingNext ? 0 : -1;
		roomObj.$input.setCursorPosition(cursor_pos);
		roomObj.input.focus();
		return roomObj.input;
	}

})();
