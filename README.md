# RocketChatUsefulScripts
This a collection of useful client-side scripts and styles for Rocket Chat (Current versions tested with Version 0.70.4)

## Installation
### User Scripts
To install user scripts (user.js files) in your browser:
1. Install a free user script extension such as [Tampermonkey](https://tampermonkey.net/) or [Greasemonkey](https://www.greasespot.net/) 
1. Install the script via the extensions user interface
1. Customize the @match comment in the metadata section to match the domain of the RC instance (e.g. `http://rc.example.com/*`)
    1. Or use the extension's UI to customize which sites/domains the script should be active for
    
### User Styles
To install user styles (user.css files) in your browser:
1. Install a free user style extension such as [Stylus](https://github.com/openstyles/stylus)
1. Install the style into the app (either copy-and-paste or import)
1. Set the domains/pages on which the style(s) should be active (e.g. `http://rc.example.com/`)


## Scripts
These are the scripts currently available in the Repository

### RC-Custom-Avatar.user.js
This script adds a checkbox to the bottom left corner that defaults to checked.
When checked, regular messages sent in Rocket Chat will use the Avatar and username Alias specified in the script
_Note: This does not currently work for attachments and uploads created via drag and drop, as those use a separate method for posting_

To change the Avatar and Alias, edit the two constants at the top of the script:
```
const AVATAR = ""; // Replace with custom avatar url (can be a gif)
const ALIAS = ""; // Replace with custom username
```
![example of custom avatar checkbox](https://github.com/reffu42/RocketChatUsefulScripts/blob/master/readme-pics/custom-avatar-shot.PNG)

## Styles
These are the styles currently available in the Repository

### RC-Dark-Theme.user.css
This styles changes RC to use a Dark theme with Black/Dark blue as the primary background colors and with White or Light Gray text
It also includes some small tweaks I found personally useful, such as moving the emoji/message options to the left and shrinking the left sidebar
![dark style screenshot](https://github.com/reffu42/RocketChatUsefulScripts/blob/master/readme-pics/Screenshot_2018-11-28%20(%E2%80%A2)%20Rocket%20Chat.png)
