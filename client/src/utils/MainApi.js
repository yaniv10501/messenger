import backEndApi from '../assets/backEndApi';
import { useFetch } from './fetch';

class MainApi {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  signUp = (dispatch, firstName, lastName, gender, birthday, email, password) =>
    useFetch(
      dispatch,
      `${this.baseUrl}/signup`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          gender,
          birthday,
          email,
          password,
        }),
      },
      { silent: true }
    ).then((response) => response);

  signIn = (dispatch, email, password) =>
    useFetch(
      dispatch,
      `${this.baseUrl}/signin`,
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      },
      { silent: true }
    ).then((response) => response);

  signOut = (dispatch) =>
    useFetch(
      dispatch,
      `${this.baseUrl}/signout`,
      {
        method: 'POST',
        credentials: 'include',
      },
      { silent: true }
    ).then((response) => response);

  getFriendImage = async (dispatch, friend, options) => {
    const imagePromise = new Promise((resovle) => {
      const { listType = null, index = null, chatId = null } = options || {};
      if (friend.image !== 'Uploaded') {
        resovle(friend);
      } else {
        const { _id } = friend;
        useFetch(
          dispatch,
          `${this.baseUrl}/${_id}/image?listType=${listType}&index=${index}${
            chatId && `&chatId=${chatId}`
          }`,
          {
            credentials: 'include',
          },
          { silent: true, image: true }
        )
          .then((response) => {
            if (!response.ok) {
              throw new Error();
            }
            return response.blob();
          })
          .then((imageBlob) => {
            const image = URL.createObjectURL(imageBlob);
            return image;
          })
          .then((image) => {
            if (image instanceof Error) {
              resovle(friend);
            }
            resovle({
              ...friend,
              image,
            });
          })
          .catch(() => {
            resovle(friend);
          });
      }
    });
    return imagePromise.then((friend) => friend);
  };

  getGroupImage = async (dispatch, group, options) => {
    const imagePromise = new Promise((resovle) => {
      const { listType = null } = options || {};
      if (group.image !== 'Uploaded') {
        resovle(group);
      } else {
        useFetch(
          dispatch,
          `${this.baseUrl}/${group._id}/image?listType=${listType}`,
          {
            credentials: 'include',
          },
          { silent: true, image: true }
        )
          .then((response) => {
            if (!response.ok) {
              throw new Error();
            }
            return response.blob();
          })
          .then((imageBlob) => {
            const image = URL.createObjectURL(imageBlob);
            return image;
          })
          .then((image) => {
            if (image instanceof Error) {
              resovle(group);
            }
            resovle({
              ...group,
              image,
            });
          })
          .catch(() => {
            resovle(group);
          });
      }
    });
    return imagePromise.then((group) => group);
  };

  getChatImage = (dispatch, chat) =>
    chat.isGroup
      ? this.getGroupImage(dispatch, chat, { listType: 'chats' })
      : this.getFriendImage(dispatch, chat, { listType: 'chats' });

  getUserImage = async (dispatch, user) => {
    const imagePromise = new Promise((resovle) => {
      if (user.image !== 'Uploaded') {
        resovle(user);
      } else {
        useFetch(
          dispatch,
          `${this.baseUrl}/users/me/image`,
          {
            credentials: 'include',
          },
          { silent: true, image: true }
        )
          .then((response) => {
            if (!response.ok) {
              throw new Error();
            }
            return response.blob();
          })
          .then((imageBlob) => {
            const image = URL.createObjectURL(imageBlob);
            return image;
          })
          .then((image) => {
            if (image instanceof Error) {
              resovle(user);
            }
            resovle({
              ...user,
              image,
            });
          })
          .catch(() => {
            resovle(user);
          });
      }
    });
    return imagePromise.then((user) => user);
  };

  setUserImage = (dispatch, imageUpload) =>
    useFetch(
      dispatch,
      `${this.baseUrl}/users/me/image`,
      {
        method: 'PATCH',
        body: imageUpload,
        credentials: 'include',
      },
      { silent: true }
    ).then((response) => this.getUserImage(dispatch, response));

  getUserMe = (dispatch) =>
    useFetch(
      dispatch,
      `${this.baseUrl}/users/me`,
      {
        credentials: 'include',
      },
      { auth: true }
    ).then((response) => this.getUserImage(dispatch, response));

  getNewChat = (dispatch, chatId) =>
    useFetch(
      dispatch,
      `${this.baseUrl}/new/${chatId}`,
      { credentials: 'include' },
      { silent: true }
    ).then((response) => this.getChatImage(dispatch, { _id: chatId, ...response }));

  getChats = (dispatch) =>
    useFetch(
      dispatch,
      `${this.baseUrl}/chats`,
      {
        credentials: 'include',
      },
      { silent: true }
    ).then(async (response) => {
      const { loadedAll } = response;
      if (!loadedAll) {
        const chatsData = await Promise.all(
          response.map((friendChat) => this.getChatImage(dispatch, friendChat))
        );
        return chatsData;
      }
      const { chatsList } = response;
      if (chatsList) {
        const chatsData = await Promise.all(
          chatsList.map((friendChat) => this.getChatImage(dispatch, friendChat))
        );
        return {
          loadedAll,
          chatsData,
        };
      }
    });

  getMoreChats = (dispatch) =>
    useFetch(
      dispatch,
      `${this.baseUrl}/chats/more`,
      {
        credentials: 'include',
      },
      { silent: true }
    ).then(async (response) => {
      const { loadedAll } = response;
      if (!loadedAll) {
        const chatsData = await Promise.all(
          response.map((friendChat) => this.getChatImage(dispatch, friendChat))
        );
        return chatsData;
      }
      const { moreChatsList } = response;
      if (moreChatsList) {
        const chatsData = await Promise.all(
          moreChatsList.map((friendChat) => this.getChatImage(dispatch, friendChat))
        );
        return {
          loadedAll,
          chatsData,
        };
      }
      return response;
    });

  getMessages = (dispatch, chatId) =>
    useFetch(
      dispatch,
      `${this.baseUrl}/${chatId}/messages`,
      {
        credentials: 'include',
      },
      { silent: true }
    ).then((response) => response);

  getMoreMessages = (dispatch, chatId) =>
    useFetch(
      dispatch,
      `${this.baseUrl}/${chatId}/messages/more`,
      {
        credentials: 'include',
      },
      { silent: true }
    ).then((response) => response);

  setUserTyping = (dispatch, chatId, friends) =>
    useFetch(
      dispatch,
      `${this.baseUrl}/${chatId}/type`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          friends,
        }),
        credentials: 'include',
      },
      { silent: true }
    ).then((response) => response);

  sendMessage = (dispatch, message, chatId, friends, isMute, isGroup) =>
    useFetch(
      dispatch,
      `${this.baseUrl}/${chatId}/message`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, friends, isMute, isGroup }),
        credentials: 'include',
      },
      { silent: true }
    ).then((response) => response);

  leaveChat = (dispatch, chatId) =>
    useFetch(
      dispatch,
      `${this.baseUrl}/${chatId}/leave`,
      {
        method: 'POST',
        credentials: 'include',
      },
      { silent: true }
    ).then((response) => response);

  getMoreFriends = (dispatch) =>
    useFetch(
      dispatch,
      `${this.baseUrl}/friends/more`,
      { credentials: 'include' },
      { silent: true }
    ).then(async (response) => {
      const friendsList = await Promise.all(
        response.map((friend, index) =>
          this.getFriendImage(dispatch, friend, { listType: 'moreFriends', index })
        )
      );
      return friendsList;
    });

  getFriendsRequests = (dispatch) =>
    useFetch(
      dispatch,
      `${this.baseUrl}/friends/requests`,
      {
        credentials: 'include',
      },
      {
        silent: true,
      }
    ).then(async (response) => {
      const friendRequestsList = await Promise.all(
        response.map((friendRequest, index) =>
          this.getFriendImage(dispatch, friendRequest, { listType: 'friendRequests', index })
        )
      );
      return friendRequestsList;
    });

  getPendingFriendsRequests = (dispatch) =>
    useFetch(
      dispatch,
      `${this.baseUrl}/friends/pending`,
      {
        credentials: 'include',
      },
      {
        silent: true,
      }
    ).then(async (response) => {
      const pendingFriendRequestsList = await Promise.all(
        response.map((pendingFriendRequest, index) =>
          this.getFriendImage(dispatch, pendingFriendRequest, {
            listType: 'pendingRequests',
            index,
          })
        )
      );
      return pendingFriendRequestsList;
    });

  getAddFriends = async (dispatch) => {
    const moreFriends = await this.getMoreFriends(dispatch).then((response) => response);
    const friendRequests = await this.getFriendsRequests(dispatch).then((response) => response);
    const pendingFriendRequests = await this.getPendingFriendsRequests(dispatch).then(
      (response) => response
    );
    return {
      moreFriends,
      friendRequests,
      pendingFriendRequests,
    };
  };

  addFriend = (dispatch, friendId, index) =>
    useFetch(
      dispatch,
      `${this.baseUrl}/friends/${friendId}/${index}`,
      {
        method: 'POST',
        credentials: 'include',
      },
      { silent: true }
    ).then((response) => response);

  acceptFriendRequest = (dispatch, requestId, index) =>
    useFetch(
      dispatch,
      `${this.baseUrl}/${requestId}/accept?index=${index}`,
      {
        credentials: 'include',
        method: 'POST',
      },
      {
        silent: true,
      }
    ).then((response) => response);

  getComposeList = (dispatch) =>
    useFetch(
      dispatch,
      `${this.baseUrl}/friends/compose`,
      {
        credentials: 'include',
      },
      { silent: true }
    ).then(async (composeListResult) => {
      const composeListWithImages = await Promise.all(
        composeListResult.map((friendItem, index) =>
          this.getFriendImage(dispatch, friendItem, {
            listType: 'friends',
            index,
          })
        )
      );
      return composeListWithImages;
    });

  getFriendsList = (dispatch) =>
    useFetch(
      dispatch,
      `${this.baseUrl}/user/friends`,
      { credentials: 'include' },
      { silent: true }
    ).then(async (friendsListResult) => {
      const friendsListWithImages = await Promise.all(
        friendsListResult.map((friendItem, index) =>
          this.getFriendImage(dispatch, friendItem, {
            listType: 'friends',
            index,
          })
        )
      );
      return friendsListWithImages;
    });

  getGroupFriendsList = (dispatch) =>
    useFetch(
      dispatch,
      `${this.baseUrl}/user/friends/group`,
      { credentials: 'include' },
      { silent: true }
    ).then(async ({ groupId, friendsList: friendsListResult }) => {
      const friendsList = await Promise.all(
        friendsListResult.map((friendItem, index) =>
          this.getFriendImage(dispatch, friendItem, {
            listType: 'friends',
            index,
          })
        )
      );
      return { groupId, friendsList };
    });

  setFriendMute = (dispatch, friendId) =>
    useFetch(
      dispatch,
      `${this.baseUrl}/${friendId}/mute`,
      {
        method: 'POST',
        credentials: 'include',
      },
      {
        silent: true,
      }
    ).then((response) => response);

  setGroupImage = (dispatch, chatId, uploadedImage) =>
    useFetch(
      dispatch,
      `${this.baseUrl}/${chatId}/image`,
      {
        method: 'PATCH',
        body: uploadedImage,
        credentials: 'include',
      },
      { silent: true }
    ).then((response) => response);

  initNewGroup = (dispatch, chatId, groupName, groupImage, groupFriends) =>
    groupImage
      ? this.setGroupImage(dispatch, chatId, groupImage).then(() =>
          useFetch(
            dispatch,
            `${this.baseUrl}/group/new`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                groupName,
                groupFriends,
                image: 'Uploaded',
              }),
              credentials: 'include',
            },
            { silent: true }
          ).then((response) => response)
        )
      : useFetch(
          dispatch,
          `${this.baseUrl}/group/new`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              groupName,
              groupFriends,
              image: null,
            }),
            credentials: 'include',
          },
          { silent: true }
        ).then((response) => response);

  getMoreGroupFriends = (dispatch, groupId) =>
    useFetch(
      dispatch,
      `${this.baseUrl}/${groupId}/friends/more`,
      {
        credentials: 'include',
      },
      {
        silent: true,
      }
    ).then(async (moreFriends) => {
      const friendsList = await Promise.all(
        moreFriends.map((friendItem, index) =>
          this.getFriendImage(dispatch, friendItem, {
            listType: 'friends',
            index,
          })
        )
      );
      return friendsList;
    });
}

const mainApi = new MainApi(backEndApi);

export default mainApi;
