import backEndApi from '../assets/backEndApi';
import { useFetch } from './fetch';

class MainApi {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  signUp = (dispatch, userName, firstName, lastName, gender, birthday, email, password) =>
    useFetch(dispatch, `${this.baseUrl}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userName,
        firstName,
        lastName,
        gender,
        birthday,
        email,
        password,
      }),
    }).then((response) => response);

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
          `${this.baseUrl}/image/${_id}?listType=${listType}&index=${index}&chatId=${chatId}`,
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
          `${this.baseUrl}/group/image/${group._id}?listType=${listType}`,
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

  checkLoadedAll = async (dispatch, response, loadedAll, list, callBack, options) => {
    const { listType = null } = options || {};
    if (loadedAll) {
      const data = await Promise.all(
        list.map((item, index) =>
          callBack(
            dispatch,
            item,
            options
              ? {
                  listType: listType,
                  index: index,
                }
              : {}
          )
        )
      );
      return {
        loadedAll,
        data,
      };
    }
    const data = await Promise.all(
      response.map((item, index) =>
        callBack(
          dispatch,
          item,
          options
            ? {
                listType: listType,
                index: index,
              }
            : {}
        )
      )
    );
    return {
      data,
    };
  };

  getChats = (dispatch) =>
    useFetch(
      dispatch,
      `${this.baseUrl}/chats`,
      {
        credentials: 'include',
      },
      { silent: true }
    ).then(async (response) => {
      const { loadedAll: isLoadedAll = false, chatsList = [] } = response;
      const { data, loadedAll = false } = await this.checkLoadedAll(
        dispatch,
        response,
        isLoadedAll,
        chatsList,
        this.getChatImage
      );
      return {
        data,
        loadedAll,
      };
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
      const { loadedAll: isLoadedAll = false, moreChatsList = [] } = response;
      const { data, loadedAll = false } = await this.checkLoadedAll(
        dispatch,
        response,
        isLoadedAll,
        moreChatsList,
        this.getChatImage
      );
      return {
        data,
        loadedAll,
      };
    });

  getMessages = (dispatch, chatId) =>
    useFetch(
      dispatch,
      `${this.baseUrl}/messages/${chatId}`,
      {
        credentials: 'include',
      },
      { silent: true }
    ).then((response) => response);

  getMoreMessages = (dispatch, chatId) =>
    useFetch(
      dispatch,
      `${this.baseUrl}/messages/more/${chatId}`,
      {
        credentials: 'include',
      },
      { silent: true }
    ).then((response) => response);

  setUserTyping = (dispatch, chatId, friends) =>
    useFetch(
      dispatch,
      `${this.baseUrl}/type/${chatId}`,
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
      `${this.baseUrl}/message/${chatId}`,
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
      `${this.baseUrl}/leave/${chatId}`,
      {
        method: 'POST',
        credentials: 'include',
      },
      { silent: true }
    ).then((response) => response);

  leaveChats = (dispatch) =>
    useFetch(
      dispatch,
      `${this.baseUrl}/chats/leave`,
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
      const { loadedAll: isLoadedAll = false, moreFriendsList = [] } = response;
      const { data, loadedAll = false } = await this.checkLoadedAll(
        dispatch,
        response,
        isLoadedAll,
        moreFriendsList,
        this.getFriendImage,
        { listType: 'moreFriends', index: true }
      );
      return {
        data,
        loadedAll,
      };
    });

  getMoreMoreFriends = (dispatch, start) =>
    useFetch(
      dispatch,
      `${this.baseUrl}/friends/more?start=${start}`,
      { credentials: 'include' },
      { silent: true }
    ).then(async (response) => {
      const { loadedAll: isLoadedAll = false, moreFriendsList = [] } = response;
      const { data, loadedAll = false } = await this.checkLoadedAll(
        dispatch,
        response,
        isLoadedAll,
        moreFriendsList,
        this.getFriendImage,
        { listType: 'moreFriends', index: true }
      );
      return {
        data,
        loadedAll,
      };
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
      const { loadedAll: isLoadedAll = false, friendRequestsList = [] } = response;
      const { data, loadedAll = false } = await this.checkLoadedAll(
        dispatch,
        response,
        isLoadedAll,
        friendRequestsList,
        this.getFriendImage,
        { listType: 'friendRequests', index: true }
      );
      return {
        data,
        loadedAll,
      };
    });

  getMoreFriendsRequests = (dispatch, start) =>
    useFetch(
      dispatch,
      `${this.baseUrl}/friends/requests?start=${start}`,
      {
        credentials: 'include',
      },
      {
        silent: true,
      }
    ).then(async (response) => {
      const { loadedAll: isLoadedAll = false, friendRequestsList = [] } = response;
      const { data, loadedAll = false } = await this.checkLoadedAll(
        dispatch,
        response,
        isLoadedAll,
        friendRequestsList,
        this.getFriendImage,
        { listType: 'friendRequests', index: true }
      );
      return {
        data,
        loadedAll,
      };
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
      const { loadedAll: isLoadedAll = false, pendingFriendRequestsList = [] } = response;
      const { data, loadedAll = false } = await this.checkLoadedAll(
        dispatch,
        response,
        isLoadedAll,
        pendingFriendRequestsList,
        this.getFriendImage,
        { listType: 'pendingRequests', index: true }
      );
      return {
        data,
        loadedAll,
      };
    });

  getMorePendingFriendsRequests = (dispatch, start) =>
    useFetch(
      dispatch,
      `${this.baseUrl}/friends/pending?start=${start}`,
      {
        credentials: 'include',
      },
      {
        silent: true,
      }
    ).then(async (response) => {
      const { loadedAll: isLoadedAll = false, pendingFriendRequestsList = [] } = response;
      const { data, loadedAll = false } = await this.checkLoadedAll(
        dispatch,
        response,
        isLoadedAll,
        pendingFriendRequestsList,
        this.getFriendImage,
        { listType: 'pendingRequests', index: true }
      );
      return {
        data,
        loadedAll,
      };
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

  addFriend = (dispatch, friendId, index, requestResponse) =>
    useFetch(
      dispatch,
      `${this.baseUrl}/friends/add/${friendId}/${index}?response=${requestResponse}`,
      {
        method: 'POST',
        credentials: 'include',
      },
      { silent: true }
    ).then((response) => response);

  responseFriendRequest = (dispatch, requestId, index, requestResponse) =>
    useFetch(
      dispatch,
      `${this.baseUrl}/friends/response/${requestId}?index=${index}&response=${requestResponse}`,
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
      `${this.baseUrl}/mute/${friendId}`,
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
      `${this.baseUrl}/group/image/${chatId}`,
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
          ).then((response) => this.getGroupImage(dispatch, response))
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
      `${this.baseUrl}/friends/more/${groupId}`,
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

  setDontDisturbProfile = (dispatch) =>
    useFetch(
      dispatch,
      `${this.baseUrl}/users/me/dontdisturb/profile`,
      {
        method: 'POST',
        credentials: 'include',
      },
      {
        silent: true,
      }
    ).then((response) => response);

  resetChatUnread = (dispatch, chatId) =>
    useFetch(
      dispatch,
      `${this.baseUrl}/chats/unread/reset/${chatId}`,
      {
        method: 'POST',
        credentials: 'include',
      },
      {
        silent: true,
      }
    ).then((response) => response);

  checkUserTaken = (dispatch, userName) =>
    useFetch(
      dispatch,
      `${this.baseUrl}/users/name/check`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userName,
        }),
        credentials: 'include',
      },
      {
        silent: true,
      }
    ).then((response) => response);

  getNotifications = (dispatch) =>
    useFetch(
      dispatch,
      `${this.baseUrl}/notifications`,
      {
        credentials: 'include',
      },
      {
        silent: true,
      }
    ).then((response) => response);

  setNewNotification = (dispatch, newNotif) =>
    useFetch(
      dispatch,
      `${this.baseUrl}/notifications/new`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newNotif),
        credentials: 'include',
      },
      {
        silent: true,
      }
    ).then((response) => response);

  setNotificationSeen = (dispatch, notifId) =>
    useFetch(
      dispatch,
      `${this.baseUrl}/notifications/seen/${notifId}`,
      {
        method: 'POST',
        credentials: 'include',
      },
      {
        silent: true,
      }
    ).then((response) => response);

  deleteNotification = (dispatch, notifId) =>
    useFetch(
      dispatch,
      `${this.baseUrl}/notifications/delete/${notifId}`,
      {
        method: 'DELETE',
        credentials: 'include',
      },
      {
        silent: true,
      }
    ).then((response) => response);

  deleteNotificationType = (dispatch, notifType) =>
    useFetch(
      dispatch,
      `${this.baseUrl}/notifications/delete/type/${notifType}`,
      {
        method: 'DELETE',
        credentials: 'include',
      },
      {
        silent: true,
      }
    ).then((response) => response);

  findOtherUsers = (dispatch, userQuery) =>
    useFetch(
      dispatch,
      `${this.baseUrl}/users/find?userQuery=${userQuery}`,
      {
        credentials: 'include',
      },
      {
        silent: true,
      }
    ).then((response) => response);
}

const mainApi = new MainApi(backEndApi);

export default mainApi;
