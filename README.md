# Messenger WebApp

This is the front-end of my independent messenger open source project, based on React.JS framework.
[Messenger-Api Link](https://github.com/yaniv10501/messenger-api)

## Current functions

* Register
* Login with authorization implemented with JWT auth and refresh tokens
* Friend requests
* Adding profile image
* Notify users without profile image to upload and don't disturb feature
* Creating groups
* Sending messages
* Unread messages count
* Dynamic content loading
* User typing and online status
* Notifications system for new messages and friend requests

## Features implementation

### Register, Login, and Authorization

Register and login forms are being validated with a custom validation hook (./client/src/utils/UseFormValidation.js).
To maintain sessions the JWT token and the refresh token are being saved as cookies and sent with every request.

### Friend requests

Friend requests and approves are being transferred with a web-socket message to the other user (if he is connected to his socket).
Every friend request need to be approved by the other user,
after the request is approved both users can start a chat or add each other to groups.

### Adding profile image, notify users without profile image and don't disturb feature

Every user can add a profile image so other users can see.
Images can be jpeg, jpg or png type, and every image is being saved in the server.
Users without a profile image visiting the main page will get a popup promoting them to upload an image profile,
The user can upload a new image directly form the popup, close it and get notified next time he visit main page, or check the "Don't remind" checkbox to not get notified again.

### Creating groups

Every user can create a groups with the "New group" button in the chats page.
Groups have a name, image and friends list, and the Group popup is being validated to make sure a group have a name and at least one friend, group image is not mandatory.
In group chat, every message (excluding the logged user messages) is being marked with the name of the user who sent it.
You can also see witch user is typing at a giving moment.

### Sending messages and unread messages count

Messages are being transferred with a web-socket message to the other user/s (if he/they is/are connected to his/their socket).
When a user send enter a chat the unread count is set to 0, when a user receive a message if he is not currently in the chat the unread count will increase by 1, else it will remain 0.

### Dynamic content loading

Friends lists (More, Pending and Requests), chats list and chat messages list are being loaded to the website so maintain performance.
You can read more about the BBL (Users States) feature in the [Back-End repo](https://github.com/yaniv10501/messenger-api)
There is a scroll event on the containers and a loaded all boolean state for each dynamic list.
while the loaded all state is false if the preloader is in view a request is made to the API and more items are being loaded to the list.
When the loaded all state is true the preloader is not being rendered.

### User typing and online status

When a user log in he is being added to the sockets list with a new socket connection, when a user connect to his socket his online state is set to true and his friends can see it in the chat.
When a user disconnect from his socket his online state is being set to false and the Date.now() value is being saved too.
You can read more about the Was online algorithm in the [Back-End repo](https://github.com/yaniv10501/messenger-api)
When a user type in a chat, socket messages are being sent to online friends in the chat friend lists.
If the other user have the chat currently open the {UserName} typing text will appear at the chat header.
If the chat is in the chats list, the last message will be replaced with a {UserName} typing text until the user stop typing or sends a message.

### Notifications system for new messages and friend requests

The notifications menu is accesible form the 3 dots at the top right corner, click it and the menu will pop down.
When a new notification is being set for the user the notification menu will animate and the notifications count will increase by 1.
In the notifications menu the user can navigate up and down with the arrows to watch more notification, the user can also click the notification bell and navigate to the page needed (Chats/AddFriends).
If the user is in the chats page he wont get New messages notifications, if the user is in the add friends page he wont get Friend Requests notifications.

## In dev

* Mute chat
* Deny friend request
* Block user
* Notifications decrease unseen count and delete notifications from list
* Delete chats for user, and delete user messages for both users in chat or all group members
* Modify group image
* Modify group friends (Add/Delete)
* Group admin features
* Profile page for user

## Contribute

This is an open source project, every contribution or feedback will be appreciated !
