import React, { createRef, useCallback, useEffect, useRef, useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import { useNavigate } from 'react-router-dom';
import { fetchReducer, initialState, useThunkReducer } from '../utils/fetch';
import handleKeyPress from '../utils/form';
import mainApi from '../utils/MainApi';
import ComposePopup from './ComposePopup';
import NewGroupPopup from './NewGroupPopup';
import ChatSettingsPopup from './ChatSettingsPopup';
import GroupSettingsPopup from './GroupSettingsPopup';
import ChatsMessages from './Chats/ChatsMessages';
import ChatsContacts from './Chats/ChatsContacts';

function Chats({
  chatWebSocket,
  currentChat,
  setCurrentChat,
  isComposePopupOpen,
  setIsComposePopupOpen,
  isNewGroupPopupOpen,
  setIsNewGroupPopupOpen,
  isChatSettingsPopupOpen,
  setIsChatSettingsPopupOpen,
  isGroupSettingsPopupOpen,
  setIsGroupSettingsPopupOpen,
  closeAllPopups,
  setNotification,
  setNotificationsQueue,
}) {
  const isMobile = useMediaQuery({
    query: '(max-width: 945px)',
  });
  const messagesPreloaderRef = useRef();
  const messagesContainerRef = useRef();
  const chatPreloaderRef = useRef();
  const [state, thunkDispatch] = useThunkReducer(fetchReducer, initialState);
  const { silentLoading } = state;
  const navigate = useNavigate();
  const [loadedAllChats, setLoadedAllChats] = useState(false);
  const [loadedAllMessages, setLoadedAllMessages] = useState(false);
  const [composeList, setComposeList] = useState([]);
  const [friendsList, setFriendsList] = useState([]);
  const [allChatsData, setAllChatsData] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [isUserTyping, setIsUserTyping] = useState([]);
  const [userTypingText, setUserTypingText] = useState('');
  const [typingTimer, setTypingTimer] = useState(null);
  const [chatTypingTimers, setChatTypingTimers] = useState([]);
  const [refsArray, setRefsArray] = useState([]);

  const handleMobileBack = () => {
    setIsChatOpen(false);
    setCurrentChat({});
  };

  const createNewGroup = (newGroup) => {
    setAllChatsData([
      newGroup,
      ...allChatsData,
    ]);
  };

  const handleChange = (event) => {
    const { _id: chatId, friends } = currentChat;
    setMessageInput(event.target.value);
    mainApi.setUserTyping(thunkDispatch, chatId, friends).then((response) => console.log(response));
  };

  const handleSubmit = (event, options) => {
    event.preventDefault();
    const { today = false } = options || {};
    if (messageInput === '') return;
    const { current: messagesContainer } = messagesContainerRef;
    messagesContainer.scrollTo({
      top: 0,
      left: 0,
    });
    const { _id: chatId, friends, isGroup, groupAdmin, isMute } = currentChat;
    mainApi
      .sendMessage(thunkDispatch, messageInput, chatId, friends, isMute, isGroup)
      .then((response) => {
        const { data: newMessage } = response;
        const { messages: currentChatMessages } = currentChat;
        if (today) {
          if (currentChatMessages) {
            setCurrentChat({
              ...currentChat,
              messages: [newMessage, { chatTime: 'Today' }, ...currentChatMessages],
            });
          }
          if (!currentChatMessages) {
            setCurrentChat({
              ...currentChat,
              messages: [newMessage, { chatTime: 'Today' }],
            });
          }
        } else {
          if (currentChatMessages) {
            setCurrentChat({
              ...currentChat,
              messages: [newMessage, ...currentChatMessages],
            });
          }
          if (!currentChatMessages) {
            setCurrentChat({
              ...currentChat,
              messages: [newMessage],
            });
          }
        }
        const currentChatData = allChatsData.find((chat) => chat._id === chatId);
        if (!currentChatData) {
          const { chatName, chatImage } = currentChat;
          const { messageContent: lastMessage, messageTime: lastMessageTime } = newMessage;
          const newChatData = {
            _id: chatId,
            chatName,
            chatImage,
            isMute,
            isGroup,
            groupAdmin,
            lastMessage,
            lastMessageByUser: true,
            lastMessageTime,
            unreadCount: 0,
          };
          setAllChatsData([newChatData, ...allChatsData]);
        }
        if (currentChatData) {
          const { messageContent: lastMessage, messageTime: lastMessageTime } = newMessage;
          const newFriendChatData = {
            ...currentChatData,
            lastMessage,
            lastMessageByUser: true,
            lastMessageTime,
            unreadCount: 0,
          };
          const newAllChatsData = allChatsData.filter((chat) => chat._id !== chatId);
          const chatRef = refsArray.find((ref) => ref._id === chatId);
          if (chatRef && (!isMobile || !isChatOpen)) {
            const {
              ref: { current: lastMessageTarget },
            } = chatRef;
            lastMessageTarget.textContent = `You: ${lastMessage}`;
          }
          setAllChatsData([newFriendChatData, ...newAllChatsData]);
        }
        setMessageInput('');
      });
  };

  const handleKey = (event, handleSubmit) => handleKeyPress(event, handleSubmit);

  const handleChatClick = (
    chatId,
    chatName,
    chatImage,
    isMute,
    isGroup,
    groupAdmin,
    friends,
    unreadCount
  ) => {
    const { _id } = currentChat;
    if (_id) {
      const { current: messagesContainer } = messagesContainerRef;
      messagesContainer.scrollTo({
        top: 0,
        left: 0,
      });
      mainApi.leaveChat(thunkDispatch, _id).then((response) => {
        console.log(response);
      });
    }
    const resetUnreadPromise =
      unreadCount > 0
        ? mainApi.resetChatUnread(thunkDispatch, chatId).then((response) => {
            return true;
          })
        : null;
    const messagesPromise = mainApi.getMessages(thunkDispatch, chatId).then((result) => {
      const { loadedAll } = result;
      if (loadedAll) {
        setLoadedAllMessages(true);
      }
      if (!loadedAll) {
        setLoadedAllMessages(false);
      }
      if (isGroup) {
        let subtitle = '';
        friends.forEach((friend) => {
          subtitle = subtitle.concat(`${friend.firstName} ${friend.lastName}, `);
        });
        setCurrentChat({
          ...result,
          friends,
          isGroup,
          groupAdmin,
          subtitle,
          chatName,
          chatImage,
          isMute,
        });
      }
      if (!isGroup) {
        setCurrentChat({
          ...result,
          friends,
          isGroup,
          chatName,
          chatImage,
          isMute,
        });
      }
      setIsChatOpen(true);
      return result.isOnline;
    });
    Promise.all([resetUnreadPromise, messagesPromise]).then((result) => {
      const newChats = allChatsData.map((chat) => {
        if (chat._id === chatId) {
          if (result[0]) {
            return { ...chat, unreadCount: 0, isOnline: result[1] };
          }
          return { ...chat, isOnline: result[1] || chat.isOnline };
        }
        return chat;
      });
      setAllChatsData(newChats);
    });
  };
  const handleOpenCompose = () => {
    mainApi.getComposeList(thunkDispatch).then((composeListResult) => {
      setComposeList(composeListResult);
      setIsComposePopupOpen(true);
    });
  };
  const handleOpenChatSettings = () => {
    setIsChatSettingsPopupOpen(true);
  };
  const handleOpenGroupSettings = () => {
    setIsGroupSettingsPopupOpen(true);
  };
  const initNewChat = (chatId, chatName, chatImage, friends, isOnline) => {
    const { _id } = currentChat;
    if (_id) {
      const { current: messagesContainer } = messagesContainerRef;
      messagesContainer.scrollTo({
        top: 0,
        left: 0,
      });
      mainApi.leaveChat(thunkDispatch, _id).then((response) => {
        console.log(response);
      });
    }
    setCurrentChat({
      _id: chatId,
      chatName,
      chatImage,
      friends,
      messages: [],
      isOnline,
    });
    setLoadedAllMessages(true);
    if (isMobile) {
      setIsChatOpen(true);
    }
    closeAllPopups();
  };
  const handleOpenNewGroup = () => {
    mainApi.getGroupFriendsList(thunkDispatch).then((friendsListResult) => {
      setIsNewGroupPopupOpen(true);
      setFriendsList(friendsListResult);
    });
  };
  const handleBack = () => {
    mainApi.leaveChats(thunkDispatch).then((result) => {
      navigate('/');
    });
  };
  const handleMessagesScroll = (event) => {
    if (!loadedAllMessages) {
      if (!silentLoading) {
        const {
          target: { scrollTop },
        } = event;
        const {
          current: { offsetTop },
        } = messagesPreloaderRef;
        if (scrollTop - offsetTop < 120) {
          if (!loadedAllMessages) {
            mainApi.getMoreMessages(thunkDispatch, currentChat._id).then((moreMessages) => {
              const { messages: currentChatMessages } = currentChat;
              setCurrentChat({
                ...currentChat,
                messages: [...currentChatMessages, ...moreMessages.messages],
              });
              setLoadedAllMessages(moreMessages.loadedAll || false);
            });
          }
        }
      }
    }
  };
  const handleChatsScroll = (event) => {
    if (!loadedAllChats) {
      if (!silentLoading) {
        const {
          target: { scrollTop, offsetHeight },
        } = event;
        const {
          current: { offsetTop },
        } = chatPreloaderRef;
        if (offsetTop - (scrollTop + offsetHeight) < 180) {
          mainApi.getMoreChats(thunkDispatch).then((moreChats) => {
            setAllChatsData([...allChatsData, ...moreChats.data]);
            setLoadedAllChats(moreChats.loadedAll);
          });
        }
      }
    }
  };
  const updateMessages = useCallback(
    (data) => {
      const { message: newMessage, chatId, user } = data;
      const { messages: currentChatMessages } = currentChat;

      const currentChatData = allChatsData.find((chat) => chat._id === chatId);
      if (!currentChatData) {
        const { _id, chatName, chatImage } = currentChat;
        if (!chatName) {
          mainApi.getNewChat(thunkDispatch, chatId).then((chat) => {
            const { messageContent: lastMessage, messageTime: lastMessageTime } = newMessage;
            const newFriendChatData = {
              ...chat,
              lastMessage,
              lastMessageByUser: false,
              lastMessageTime,
              unreadCount: 1,
            };
            setAllChatsData([newFriendChatData, ...allChatsData]);
          });
        }
        if (chatName) {
          const { messageContent: lastMessage, messageTime: lastMessageTime } = newMessage;
          const newFriendChatData = {
            _id: chatId,
            chatName,
            chatImage,
            isOnline: {
              online: true,
              time: null,
            },
            lastMessage,
            lastMessageByUser: false,
            lastMessageTime,
            unreadCount: 0,
          };
          setAllChatsData([newFriendChatData, ...allChatsData]);
          if (_id === chatId) {
            setCurrentChat({
              ...currentChat,
              isOnline: {
                online: true,
                time: null,
              },
              messages: [newMessage],
            });
          }
        }
      }
      if (currentChatData) {
        const { unreadCount } = currentChatData;
        const { messageContent: lastMessage, messageTime: lastMessageTime } = newMessage;
        const newFriendChatData = {
          ...currentChatData,
          lastMessage,
          lastMessageByUser: false,
          lastMessageTime,
          unreadCount: chatId === currentChat._id ? 0 : unreadCount + 1,
        };
        const newAllChatsData = allChatsData.filter((chat) => chat._id !== chatId);
        const chatRef = refsArray.find((ref) => ref._id === chatId);
        if (chatRef) {
          const {
            ref: { current: lastMessageTarget },
          } = chatRef;
          lastMessageTarget.textContent = lastMessage;
        }
        setAllChatsData([newFriendChatData, ...newAllChatsData]);
        if (chatId === currentChat._id) {
          mainApi.resetChatUnread(thunkDispatch, chatId).then((response) => console.log(response));
        }
      }
      if (currentChat._id === chatId) {
        if (!currentChatMessages) {
          setCurrentChat({
            ...currentChat,
            messages: [newMessage],
          });
        }
        if (currentChatMessages) {
          setCurrentChat({
            ...currentChat,
            messages: [newMessage, ...currentChatMessages],
          });
        }
      }
    },
    [allChatsData, currentChat]
  );
  /** Controlling main chat typing text */
  useEffect(() => {
    const userTyping = isUserTyping.find((isUser) => isUser._id === currentChat._id);
    if (userTyping && userTyping.isTyping) {
      setTimeout(() => {
        if (userTypingText.includes('Typing...')) {
          setUserTypingText(userTypingText.replace('...', ''));
        } else {
          setUserTypingText(`${userTypingText}.`);
        }
      }, 400);
    }
  }, [isUserTyping, userTypingText, currentChat]);
  /** Handling websocket messages */
  useEffect(() => {
    if (chatWebSocket) {
      chatWebSocket.onmessage = (wsMessage) => {
        const { message, data } = JSON.parse(wsMessage.data);
        if (message === 'New message') {
          const { chatId, message, notifId } = data;
          const chatTypingTimer = chatTypingTimers.find((chatTimer) => chatTimer._id === chatId);
          if (chatTypingTimer) {
            const { timer, interval } = chatTypingTimer;
            const newChatTimers = chatTypingTimers.filter((chatTimer) => chatTimer._id !== chatId);
            const chatRef = refsArray.find((ref) => ref._id === chatId);
            if (chatRef) {
              const {
                ref: { current: lastMessageTarget },
              } = chatRef;
              lastMessageTarget.textContent = message.messageContent;
            }
            clearTimeout(timer);
            clearInterval(interval);
            setChatTypingTimers(newChatTimers);
          }
          chatWebSocket.send(JSON.stringify({ message: 'New message', chats: true, notifId }));
          updateMessages(data);
        }
        /** User typing socket message */
        if (message === 'User typing') {
          const { friendName, chatId } = data;
          const chatTypingTimer = chatTypingTimers.find((chatTimer) => chatTimer._id === chatId);
          const chatRef = refsArray.find((ref) => ref._id === chatId);
          /** Update allChatsData (if user is typing he must be online) */
          const newChatData = allChatsData.map((chat) =>
            chat._id === chatId
              ? {
                  ...chat,
                  isOnline: {
                    online: true,
                    time: null,
                  },
                }
              : chat
          );
          setAllChatsData(newChatData);
          /** If there is no current chat in allChatsData and either not a mobile or mobile with a chat open */
          if ((!chatRef && !isMobile) || (isMobile && isChatOpen)) {
            /**
             * Check if the current chat is the socket message chat
             * If not no action is needed !
             */
            if (currentChat._id === chatId) {
              /**
               * Check if user is currently typing
               * Set user typing in chat header
               */
              const chatUserTyping = isUserTyping.find((user) => user._id === chatId);
              /** If user is typing he must be online */
              setCurrentChat({
                ...currentChat,
                isOnline: {
                  online: true,
                  time: null,
                },
              });
              if (!chatUserTyping) {
                setIsUserTyping([{ _id: chatId, isTyping: true }, ...isUserTyping]);
                setUserTypingText(`${friendName} Typing`);
              }
              if (chatUserTyping) {
                const { isTyping } = chatUserTyping;
                if (!isTyping) {
                  const newIsUserTyping = isUserTyping.map(({ _id, isTyping }) =>
                    _id === chatId ? { _id, isTyping: true } : { _id, isTyping }
                  );
                  setIsUserTyping(newIsUserTyping);
                  setUserTypingText(`${friendName} Typing`);
                }
              }
              /** Reset the active timer and create a new one */
              if (typingTimer) clearTimeout(typingTimer);
              const timer = setTimeout(() => {
                const newIsUserTyping = isUserTyping.map(({ _id, isTyping }) =>
                  _id === chatId ? { _id, isTyping: false } : { _id, isTyping }
                );
                setIsUserTyping(newIsUserTyping);
                setTypingTimer(null);
              }, 1500);
              setTypingTimer(timer);
            }
          }
          /** If there is a current chat in allChatsData and either not a mobile or mobile with a chats list open */
          if (chatRef && (!isMobile || (isMobile && !isChatOpen))) {
            const {
              ref: { current: lastMessageTarget },
            } = chatRef;
            /** If user is typing he must be online */
            setCurrentChat({
              ...currentChat,
              isOnline: {
                online: true,
                time: null,
              },
            });
            /** If no chatTypingTimer set the text to initial and set interval and timeout for changes */
            if (!chatTypingTimer) {
              lastMessageTarget.textContent = `${friendName} Typing`;
              const chatInterval = setInterval(() => {
                const currentTimerText = lastMessageTarget.textContent;
                if (currentTimerText === `${friendName} Typing...`) {
                  lastMessageTarget.textContent = `${friendName} Typing`;
                } else {
                  lastMessageTarget.textContent = `${currentTimerText}.`;
                }
              }, 400);
              const chatTimer = setTimeout(() => {
                const { lastMessage, lastMessageByUser } = allChatsData.find(
                  (chat) => chat._id === chatId
                );
                lastMessageTarget.textContent = lastMessage;
                if (lastMessageByUser) {
                  const newSpan = document.createElement('span');
                  newSpan.textContent = 'You:';
                  lastMessageTarget.prepend(newSpan);
                }
                const newChatTimers = chatTypingTimers.filter(
                  (chatTimer) => chatTimer._id !== chatId
                );
                setChatTypingTimers(newChatTimers);
                clearInterval(chatInterval);
              }, 1500);
              setChatTypingTimers([
                {
                  _id: chatId,
                  timer: chatTimer,
                  interval: chatInterval,
                },
                ...chatTypingTimers,
              ]);
            }
            /** If there is a chatTypingTimer reset the timeout and keep the interval going */
            if (chatTypingTimer) {
              const { timer, interval } = chatTypingTimer;
              clearTimeout(timer);
              const chatTimer = setTimeout(() => {
                const { lastMessage, lastMessageByUser } = allChatsData.find(
                  (chat) => chat._id === chatId
                );
                lastMessageTarget.textContent = lastMessage;
                const newChatTimers = chatTypingTimers.filter(
                  (chatTimer) => chatTimer._id !== chatId
                );
                if (lastMessageByUser) {
                  const newSpan = document.createElement('span');
                  newSpan.textContent = 'You:';
                  lastMessageTarget.prepend(newSpan);
                }
                setChatTypingTimers(newChatTimers);
                clearInterval(interval);
              }, 1500);
              const newChatTimers = chatTypingTimers.filter(
                (chatTimer) => chatTimer._id !== chatId
              );
              setChatTypingTimers([
                {
                  _id: chatId,
                  timer: chatTimer,
                  interval,
                },
                ...newChatTimers,
              ]);
            }
            /** Set the isUserTyping state */
            const { isTyping } = isUserTyping.find((user) => user._id === chatId);
            if (!isTyping) {
              const newIsUserTyping = isUserTyping.map(({ _id, isTyping }) =>
                _id === chatId ? { _id, isTyping: true } : { _id, isTyping }
              );
              setIsUserTyping(newIsUserTyping);
              if (currentChat._id === chatId) {
                setUserTypingText(`${friendName} Typing`);
              }
              lastMessageTarget.textContent = `${friendName} Typing`;
            }
            /** If there is a typing timer clear timeout */
            if (typingTimer) clearTimeout(typingTimer);
            /** Set new timer */
            const timer = setTimeout(() => {
              const newIsUserTyping = isUserTyping.map(({ _id, isTyping }) =>
                _id === chatId ? { _id, isTyping: false } : { _id, isTyping }
              );
              setIsUserTyping(newIsUserTyping);
              setTypingTimer(null);
            }, 1500);
            setTypingTimer(timer);
          }
        }
        if (message === 'New group') {
          const { group } = data;
          const { friends } = group;
          const listWithImages = friends.map(async (friend) => {
            const imagePromise = new Promise((resolve) => {
              if (friend.image !== 'Uploaded') {
                resolve(friend);
              }
              mainApi
                .getFriendImage(thunkDispatch, friend, {
                  listType: 'group',
                  chatId: currentChat._id,
                })
                .then((resultFriend) => {
                  resolve(resultFriend);
                });
            });
            return imagePromise.then((result) => result);
          });
          Promise.all(listWithImages).then((friendsList) => {
            const { image } = group;
            if (image) {
              mainApi.getGroupImage(thunkDispatch, group).then((groupWithImage) => {
                setAllChatsData([
                  {
                    ...groupWithImage,
                    friends: friendsList,
                  },
                  ...allChatsData,
                ]);
              });
            } else {
              setAllChatsData([
                {
                  ...group,
                  friends: friendsList,
                },
                ...allChatsData,
              ]);
            }
          });
        }
      };
    }
  }, [
    currentChat,
    updateMessages,
    chatWebSocket,
    typingTimer,
    allChatsData,
    isUserTyping,
    chatTypingTimers,
    refsArray,
    setCurrentChat,
    isChatOpen,
    isMobile,
  ]);
  /** Making dynamic ref objects for chats array and user typing array */
  useEffect(() => {
    if (allChatsData.length > 0) {
      setRefsArray((refsArrayState) =>
        allChatsData.map(({ _id }, i) => {
          const currentRef = refsArrayState[i];
          if (currentRef) {
            if (currentRef._id === _id) {
              return currentRef;
            }
            return {
              ...currentRef,
              _id,
            };
          }
          return { _id, ref: createRef() };
        })
      );
      setIsUserTyping((isUserTypingState) =>
        allChatsData.map(({ _id }, i) => {
          const currentRef = isUserTypingState[i];
          if (currentRef) {
            if (currentRef._id === _id) {
              return currentRef;
            }
            return {
              ...currentRef,
              _id,
            };
          }
          return { _id, isTyping: false };
        })
      );
    }
  }, [allChatsData]);
  /** Loading init data */
  useEffect(() => {
    Promise.all([
      mainApi.deleteNotificationType(thunkDispatch, 'chat').then((notifications) => {
        setNotificationsQueue(notifications);
        setNotification(notifications[0] || {});
      }),
      mainApi.getChats(thunkDispatch).then((response) => {
        const { loadedAll, data } = response;
        setLoadedAllChats(loadedAll);
        if (currentChat._id) {
          let chatToOpen;
          const newData = data.map((chat) => {
            if (chat._id === currentChat._id) {
              chatToOpen = chat;
              chatToOpen.unreadCount = 0;
              return chatToOpen;
            }
            return chat;
          });
          const {
            _id: chatId,
            isGroup,
            friends,
            groupAdmin,
            chatName,
            chatImage,
            isMute,
          } = chatToOpen;
          setAllChatsData(newData);
          mainApi.getMessages(thunkDispatch, chatId).then((result) => {
            const { loadedAll } = result;
            if (loadedAll) {
              setLoadedAllMessages(true);
            }
            if (!loadedAll) {
              setLoadedAllMessages(false);
            }
            if (isGroup) {
              let subtitle = '';
              friends.forEach((friend) => {
                subtitle = subtitle.concat(`${friend.firstName} ${friend.lastName}, `);
              });
              setCurrentChat({
                ...result,
                friends,
                isGroup,
                groupAdmin,
                subtitle,
                chatName,
                chatImage,
                isMute,
              });
            }
            if (!isGroup) {
              setCurrentChat({
                ...result,
                friends,
                isGroup,
                chatName,
                chatImage,
                isMute,
              });
            }
            setIsChatOpen(true);
          });
        } else {
          setAllChatsData(data);
        }
      }),
    ]);
  }, []);
  return (
    <>
      {isMobile ? (
        isChatOpen ? (
          <div className="chats">
            <ChatsMessages
              isMobile={isMobile}
              currentChat={currentChat}
              handleMobileBack={handleMobileBack}
              handleOpenGroupSettings={handleOpenGroupSettings}
              handleOpenChatSettings={handleOpenChatSettings}
              isUserTyping={isUserTyping}
              userTypingText={userTypingText}
              messagesContainerRef={messagesContainerRef}
              handleMessagesScroll={handleMessagesScroll}
              messagesPreloaderRef={messagesPreloaderRef}
              loadedAllMessages={loadedAllMessages}
              handleSubmit={handleSubmit}
              messageInput={messageInput}
              handleChange={handleChange}
              handleKey={handleKey}
            />
          </div>
        ) : (
          <div className="chats">
            <ChatsContacts
              isMobile={isMobile}
              handleOpenNewGroup={handleOpenNewGroup}
              handleOpenCompose={handleOpenCompose}
              handleBack={handleBack}
              handleChatsScroll={handleChatsScroll}
              allChatsData={allChatsData}
              handleChatClick={handleChatClick}
              refsArray={refsArray}
              chatPreloaderRef={chatPreloaderRef}
              loadedAllChats={loadedAllChats}
            />
          </div>
        )
      ) : (
        <>
          <div className="chats">
            <ChatsContacts
              isMobile={isMobile}
              handleOpenNewGroup={handleOpenNewGroup}
              handleOpenCompose={handleOpenCompose}
              handleBack={handleBack}
              handleChatsScroll={handleChatsScroll}
              allChatsData={allChatsData}
              handleChatClick={handleChatClick}
              refsArray={refsArray}
              chatPreloaderRef={chatPreloaderRef}
              loadedAllChats={loadedAllChats}
            />

            <ChatsMessages
              isMobile={isMobile}
              currentChat={currentChat}
              handleMobileBack={handleMobileBack}
              handleOpenGroupSettings={handleOpenGroupSettings}
              handleOpenChatSettings={handleOpenChatSettings}
              isUserTyping={isUserTyping}
              userTypingText={userTypingText}
              messagesContainerRef={messagesContainerRef}
              handleMessagesScroll={handleMessagesScroll}
              messagesPreloaderRef={messagesPreloaderRef}
              loadedAllMessages={loadedAllMessages}
              handleSubmit={handleSubmit}
              messageInput={messageInput}
              handleChange={handleChange}
              handleKey={handleKey}
            />
          </div>
        </>
      )}
      <ComposePopup
        isPopupOpen={isComposePopupOpen}
        handleClose={closeAllPopups}
        composeList={composeList}
        initNewChat={initNewChat}
      />
      <NewGroupPopup
        isPopupOpen={isNewGroupPopupOpen}
        handleClose={closeAllPopups}
        friendsList={friendsList}
        initNewChat={initNewChat}
        createNewGroup={createNewGroup}
      />
      <ChatSettingsPopup
        currentChat={currentChat}
        isPopupOpen={isChatSettingsPopupOpen}
        handleClose={closeAllPopups}
      />
      <GroupSettingsPopup
        currentChat={currentChat}
        isPopupOpen={isGroupSettingsPopupOpen}
        handleClose={closeAllPopups}
      />
    </>
  );
}

export default Chats;
