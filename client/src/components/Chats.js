import React, { createRef, useCallback, useEffect, useRef, useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import { useNavigate } from 'react-router-dom';
import composeIcon from '../images/compose.png';
import sendIcon from '../images/send.png';
import { fetchReducer, initialState, useThunkReducer } from '../utils/fetch';
import handleKeyPress from '../utils/form';
import mainApi from '../utils/MainApi';
import noProfile from '../images/no-profile.png';
import ComposePopup from './ComposePopup';
import Preloader from './Preloader/Preloader';
import NewGroupPopup from './NewGroupPopup';
import ChatSettingsPopup from './ChatSettingsPopup';
import GroupSettingsPopup from './GroupSettingsPopup';

function Chats({
  chatWebSocket,
  isComposePopupOpen,
  setIsComposePopupOpen,
  isNewGroupPopupOpen,
  setIsNewGroupPopupOpen,
  isChatSettingsPopupOpen,
  setIsChatSettingsPopupOpen,
  isGroupSettingsPopupOpen,
  setIsGroupSettingsPopupOpen,
  closeAllPopups,
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
  const [currentChat, setCurrentChat] = useState({});
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

  const createNewGroup = (chatId, chatName, friends, image) => {
    setAllChatsData([
      {
        _id: chatId,
        chatName,
        friends,
        groupAdmin: '',
        image: '',
        isGroup: true,
        isMute: 0,
        unreadCount: 0,
      },
      ...allChatsData,
    ]);
  };

  const handleChange = (event) => {
    const { _id: chatId, friends } = currentChat;
    setMessageInput(event.target.value);
    mainApi.setUserTyping(thunkDispatch, chatId, friends).then((response) => console.log(response));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
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
        const currentChatData = allChatsData.find((chat) => chat._id === chatId);
        console.log(currentChatData);
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
            lastMessageTime,
            unreadCount: 0,
          };
          const newAllChatsData = allChatsData.filter((chat) => chat._id !== chatId);
          setAllChatsData([newFriendChatData, ...newAllChatsData]);
        }
        setMessageInput('');
      });
  };

  const handleKey = (event) => handleKeyPress(event, handleSubmit);

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
    console.log(isGroup);
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
            console.log(response);
            return true;
          })
        : null;
    const messagesPromise = mainApi.getMessages(thunkDispatch, chatId).then((result) => {
      console.log(result);
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
    Promise.all([resetUnreadPromise, messagesPromise]).then((result) => {
      if (result[0]) {
        const newChats = allChatsData.map((chat) =>
          chat._id === chatId ? { ...chat, unreadCount: 0 } : chat
        );
        setAllChatsData(newChats);
      }
      console.log(result[0], result[1]);
    });
  };
  const handleOpenCompose = () => {
    mainApi.getComposeList(thunkDispatch).then((composeListResult) => {
      console.log(composeListResult);
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
  const initNewChat = (chatId, chatName, chatImage, friends) => {
    const { _id } = currentChat;
    if (_id) {
      const { current: messagesContainer } = messagesContainerRef;
      messagesContainer.scrollTo({
        top: 0,
        left: 0,
      });
      console.log(_id);
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
    });
    setLoadedAllMessages(true);
    closeAllPopups();
  };
  const handleOpenNewGroup = () => {
    mainApi.getGroupFriendsList(thunkDispatch).then((friendsListResult) => {
      console.log(friendsListResult);
      setIsNewGroupPopupOpen(true);
      setFriendsList(friendsListResult);
    });
  };
  const handleBack = () => {
    mainApi.leaveChats(thunkDispatch).then((result) => {
      console.log(result);
      navigate('/');
    });
  };
  const handleMessagesScroll = (event) => {
    console.log(loadedAllMessages);
    if (!loadedAllMessages) {
      if (!silentLoading) {
        const {
          target: { scrollTop },
        } = event;
        const {
          current: { offsetTop },
        } = messagesPreloaderRef;
        if (scrollTop - offsetTop < 120) {
          console.log('Time to load more!');
          if (!loadedAllMessages) {
            mainApi.getMoreMessages(thunkDispatch, currentChat._id).then((moreMessages) => {
              console.log(moreMessages);
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
        console.log(offsetTop, offsetHeight);
        if (offsetTop - (scrollTop + offsetHeight) < 180) {
          console.log('Time to load more!');
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
          mainApi.getNewChat(thunkDispatch, chatId).then((friend) => {
            console.log(friend);
            const { messageContent: lastMessage, messageTime: lastMessageTime } = newMessage;
            const newFriendChatData = {
              ...friend,
              lastMessage,
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
            lastMessage,
            lastMessageTime,
            unreadCount: 0,
          };
          setAllChatsData([newFriendChatData, ...allChatsData]);
          if (_id === chatId) {
            setCurrentChat({
              ...currentChat,
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
          lastMessageTime,
          unreadCount: chatId === currentChat._id ? 0 : unreadCount + 1,
        };
        const newAllChatsData = allChatsData.filter((chat) => chat._id !== chatId);
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
          const { chatId, message } = data;
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
          updateMessages(data);
        }
        if (message === 'User typing') {
          console.log(data);
          const { friendName, chatId } = data;
          const chatTypingTimer = chatTypingTimers.find((chatTimer) => chatTimer._id === chatId);
          const chatRef = refsArray.find((ref) => ref._id === chatId);
          if ((!chatRef && !isMobile) || (isMobile && isChatOpen)) {
            if (currentChat._id === chatId) {
              const chatUserTyping = isUserTyping.find((user) => user._id === chatId);
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
            }
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
          if ((chatRef && !isMobile) || (isMobile && !isChatOpen)) {
            const {
              ref: { current: lastMessageTarget },
            } = chatRef;
            if (!chatTypingTimer) {
              lastMessageTarget.textContent = `${friendName} Typing`;
              const chatInterval = setInterval(() => {
                const currentTimerText = lastMessageTarget.textContent;
                console.log(currentTimerText);
                if (currentTimerText === `${friendName} Typing...`) {
                  lastMessageTarget.textContent = `${friendName} Typing`;
                } else {
                  lastMessageTarget.textContent = `${currentTimerText}.`;
                }
              }, 400);
              const chatTimer = setTimeout(() => {
                const { lastMessage } = allChatsData.find((chat) => chat._id === chatId);
                lastMessageTarget.textContent = lastMessage;
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
            if (chatTypingTimer) {
              const { timer, interval } = chatTypingTimer;
              clearTimeout(timer);
              const chatTimer = setTimeout(() => {
                const { lastMessage } = allChatsData.find((chat) => chat._id === chatId);
                lastMessageTarget.textContent = lastMessage;
                const newChatTimers = chatTypingTimers.filter(
                  (chatTimer) => chatTimer._id !== chatId
                );
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
            const { isTyping } = isUserTyping.find((user) => user._id === chatId);
            console.log(isTyping);
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
        if (message === 'New group') {
          const { group } = data;
          const { friends } = group;
          const listWithImages = friends.map(async (friend) => {
            const imagePromise = new Promise((resolve) => {
              console.log(friend);
              if (friend.image !== 'Uploaded') {
                resolve(friend);
              }
              mainApi
                .getFriendImage(thunkDispatch, friend, {
                  listType: 'group',
                  chatId: currentChat._id,
                })
                .then((resultFriend) => {
                  console.log(resultFriend);
                  resolve(resultFriend);
                });
            });
            return imagePromise.then((result) => result);
          });
          Promise.all(listWithImages).then((friendsList) => {
            setAllChatsData([
              {
                ...group,
                friends: friendsList,
              },
              ...allChatsData,
            ]);
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
    isChatOpen,
    isMobile,
  ]);
  /** Making dynamic ref objects for chats array and user typing array */
  useEffect(() => {
    console.log(allChatsData);
    if (allChatsData.length > 0) {
      setRefsArray((refsArray) =>
        allChatsData.map(({ _id }, i) => {
          const currentRef = refsArray[i];
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
      setIsUserTyping((isUserTyping) =>
        allChatsData.map(({ _id }, i) => {
          const currentRef = isUserTyping[i];
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
    mainApi.getChats(thunkDispatch).then((response) => {
      console.log(response);
      const { loadedAll, data } = response;
      setAllChatsData(data);
      setLoadedAllChats(loadedAll);
    });
  }, []);
  return (
    <>
      {isMobile ? (
        isChatOpen ? (
          <div className="chats">
            <div className="chats__chat-messages-container">
              {currentChat.messages ? (
                <>
                  <div className="chats__messages-header_mobile">
                    <div
                      className="chats__back-button chats__back-button_mobile"
                      onClick={handleMobileBack}
                    >
                      <p className="chats__back-title">Back</p>
                    </div>
                    <button
                      className="chats__messages-header"
                      key={currentChat._id}
                      onClick={
                        currentChat.isGroup ? handleOpenGroupSettings : handleOpenChatSettings
                      }
                    >
                      <img
                        src={currentChat.chatImage ? currentChat.chatImage : noProfile}
                        className="chats__friend-header-icon"
                        alt="friend icon"
                      />
                      <div className="chats__friend-header-texts">
                        <h2 className="chats__friend-header-name">{currentChat.chatName}</h2>
                        <p className="chats__friend-header-typing">
                          {isUserTyping.some((isUser) =>
                            isUser._id === currentChat._id ? isUser.isTyping : false
                          ) && userTypingText}
                        </p>
                        {currentChat.isGroup && (
                          <p className="chats__friend-header-bottom-title">
                            Friends:
                            <span className="chats__friend-header-bottom-text">
                              {currentChat.subtitle}
                            </span>
                          </p>
                        )}
                      </div>
                    </button>
                  </div>

                  <div
                    id="messagesContainer"
                    className="chats__messages-container no-scroll-bar"
                    ref={messagesContainerRef}
                    onScroll={handleMessagesScroll}
                  >
                    {currentChat.messages.length > 0
                      ? currentChat.messages.map(
                          (
                            { messageByUser, messageBy, messageContent, messageTime, messageDate },
                            index
                          ) => {
                            if (messageByUser)
                              return (
                                <div className="chats__message chats__message_user" key={index}>
                                  <div className="chats__message-content">
                                    <p className="chats__message-text">{messageContent}</p>

                                    <p className="chats__message-date">{messageTime}</p>
                                  </div>
                                </div>
                              );
                            else
                              return (
                                <div className="chats__message chats__message_friend" key={index}>
                                  {currentChat.isGroup && (
                                    <p className="chats__message-by">{messageBy}</p>
                                  )}
                                  <div className="chats__message-content">
                                    <p className="chats__message-text">{messageContent}</p>

                                    <p className="chats__message-date">{messageTime}</p>
                                  </div>
                                </div>
                              );
                          }
                        )
                      : ''}
                    <div
                      className="chats__preloader"
                      ref={messagesPreloaderRef}
                      style={{
                        position: 'relative',
                        width: '100%',
                        minHeight: '70px',
                      }}
                    >
                      <Preloader isLoading={!loadedAllMessages} />
                    </div>
                  </div>

                  <form className="chats__send-form" name="message" onSubmit={handleSubmit}>
                    <textarea
                      className="chats__message-input"
                      value={messageInput}
                      onChange={handleChange}
                      onKeyPress={handleKey}
                    ></textarea>

                    <button type="submit" className="chats__send-button">
                      <img src={sendIcon} className="chats__send-icon" alt="send-icon" />
                    </button>
                  </form>
                </>
              ) : (
                ''
              )}
            </div>
          </div>
        ) : (
          <div className="chats">
            <div className="chats__contacts">
              <div className="chats__contacts-top">
                <button className="chats__group-title" onClick={handleOpenNewGroup}>
                  New group
                </button>
                <button className="chats__compose-button" onClick={handleOpenCompose}>
                  <img
                    src={composeIcon}
                    width="50"
                    height="50"
                    className="chats__compose-icon"
                    alt="compose icon"
                  />
                </button>

                <h1 className="chats__title">Chats</h1>

                <div className="chats__back-button" onClick={handleBack}>
                  <p className="chats__back-title">Back</p>
                </div>
              </div>

              <div className="chats__contacts-main no-scroll-bar" onScroll={handleChatsScroll}>
                {allChatsData.map(
                  (
                    {
                      _id,
                      chatName,
                      image,
                      isGroup,
                      groupAdmin,
                      friends,
                      lastMessage,
                      lastMessageTime,
                      unreadCount,
                      isMute,
                    },
                    index
                  ) => (
                    <div
                      className="chats__chat-link"
                      key={_id}
                      id={_id}
                      onClick={() =>
                        handleChatClick(
                          _id,
                          chatName,
                          image,
                          isMute,
                          isGroup,
                          groupAdmin,
                          friends,
                          unreadCount,
                          index
                        )
                      }
                    >
                      <img
                        className="chats__friend-icon"
                        src={image ? image : noProfile}
                        alt="friend icon"
                      />

                      <div className="chats__chat-row">
                        <div className="chats__chat-column">
                          <p className="chats__chat-title">{chatName}</p>

                          {refsArray[index] ? (
                            <p className="chats__chat-message" ref={refsArray[index].ref}>
                              {lastMessage}
                            </p>
                          ) : (
                            <p className="chats__chat-message">{lastMessage}</p>
                          )}
                        </div>

                        <div className="chats__chat-end-column">
                          <p className="chats__chat-time">{lastMessageTime}</p>

                          {isMute ? (
                            <img className="chats__chat-mute" src="/mute.png" alt="chat mute" />
                          ) : null}

                          {unreadCount > 0 ? (
                            <div className="chats__chat-unread">
                              <p className="chats__chat-unread-count">{unreadCount}</p>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  )
                )}
                <div
                  className="chats__preloader"
                  ref={chatPreloaderRef}
                  style={{
                    position: 'relative',
                    width: '100%',
                    minHeight: '70px',
                  }}
                >
                  <Preloader isLoading={!loadedAllChats} />
                </div>
              </div>
            </div>
          </div>
        )
      ) : (
        <>
          <div className="chats">
            <div className="chats__contacts">
              <div className="chats__contacts-top">
                <button className="chats__group-title" onClick={handleOpenNewGroup}>
                  New group
                </button>
                <button className="chats__compose-button" onClick={handleOpenCompose}>
                  <img
                    src={composeIcon}
                    width="50"
                    height="50"
                    className="chats__compose-icon"
                    alt="compose icon"
                  />
                </button>

                <h1 className="chats__title">Chats</h1>

                <div className="chats__back-button" onClick={handleBack}>
                  <p className="chats__back-title">Back</p>
                </div>
              </div>

              <div className="chats__contacts-main no-scroll-bar" onScroll={handleChatsScroll}>
                {allChatsData.map(
                  (
                    {
                      _id,
                      chatName,
                      image,
                      isGroup,
                      groupAdmin,
                      friends,
                      lastMessage,
                      lastMessageTime,
                      unreadCount,
                      isMute,
                    },
                    index
                  ) => (
                    <div
                      className="chats__chat-link"
                      key={_id}
                      id={_id}
                      onClick={() =>
                        handleChatClick(
                          _id,
                          chatName,
                          image,
                          isMute,
                          isGroup,
                          groupAdmin,
                          friends,
                          unreadCount
                        )
                      }
                    >
                      <img
                        className="chats__friend-icon"
                        src={image ? image : noProfile}
                        alt="friend icon"
                      />

                      <div className="chats__chat-row">
                        <div className="chats__chat-column">
                          <p className="chats__chat-title">{chatName}</p>

                          {refsArray[index] ? (
                            <p className="chats__chat-message" ref={refsArray[index].ref}>
                              {lastMessage}
                            </p>
                          ) : (
                            <p className="chats__chat-message">{lastMessage}</p>
                          )}
                        </div>

                        <div className="chats__chat-end-column">
                          <p className="chats__chat-time">{lastMessageTime}</p>

                          {isMute ? (
                            <img className="chats__chat-mute" src="/mute.png" alt="chat mute" />
                          ) : null}

                          {unreadCount > 0 ? (
                            <div className="chats__chat-unread">
                              <p className="chats__chat-unread-count">{unreadCount}</p>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  )
                )}
                <div
                  className="chats__preloader"
                  ref={chatPreloaderRef}
                  style={{
                    position: 'relative',
                    width: '100%',
                    minHeight: '70px',
                  }}
                >
                  <Preloader isLoading={!loadedAllChats} />
                </div>
              </div>
            </div>

            <div className="chats__chat-messages-container">
              {currentChat.messages ? (
                <>
                  <button
                    className="chats__messages-header"
                    key={currentChat._id}
                    onClick={currentChat.isGroup ? handleOpenGroupSettings : handleOpenChatSettings}
                  >
                    <img
                      src={currentChat.chatImage ? currentChat.chatImage : noProfile}
                      className="chats__friend-header-icon"
                      alt="friend icon"
                    />
                    <div className="chats__friend-header-texts">
                      <h2 className="chats__friend-header-name">{currentChat.chatName}</h2>
                      <p className="chats__friend-header-typing">
                        {isUserTyping.some((isUser) =>
                          isUser._id === currentChat._id ? isUser.isTyping : false
                        ) && userTypingText}
                      </p>
                      {currentChat.isGroup ? (
                        <p className="chats__friend-header-bottom-title">
                          Friends:
                          <span className="chats__friend-header-bottom-text">
                            {currentChat.subtitle}
                          </span>
                        </p>
                      ) : (
                        <p className="chats__friend-header-bottom-title">
                          {currentChat.friends[0].isOnline ? 'Online' : currentChat.chatName}
                          <span className="chats__friend-header-bottom-text">
                            {currentChat.friends[0].isOnline ? '' : 'Was online'}
                          </span>
                        </p>
                      )}
                    </div>
                  </button>

                  <div
                    id="messagesContainer"
                    className="chats__messages-container no-scroll-bar"
                    ref={messagesContainerRef}
                    onScroll={handleMessagesScroll}
                  >
                    {currentChat.messages.length > 0
                      ? currentChat.messages.map(
                          (
                            { messageByUser, messageBy, messageContent, messageTime, messageDate },
                            index
                          ) => {
                            if (messageByUser)
                              return (
                                <div className="chats__message chats__message_user" key={index}>
                                  <div className="chats__message-content">
                                    <p className="chats__message-text">{messageContent}</p>

                                    <p className="chats__message-date">{messageTime}</p>
                                  </div>
                                </div>
                              );
                            else
                              return (
                                <div className="chats__message chats__message_friend" key={index}>
                                  {currentChat.isGroup && (
                                    <p className="chats__message-by">{messageBy}</p>
                                  )}
                                  <div className="chats__message-content">
                                    <p className="chats__message-text">{messageContent}</p>

                                    <p className="chats__message-date">{messageTime}</p>
                                  </div>
                                </div>
                              );
                          }
                        )
                      : ''}
                    <div
                      className="chats__preloader"
                      ref={messagesPreloaderRef}
                      style={{
                        position: 'relative',
                        width: '100%',
                        minHeight: '70px',
                      }}
                    >
                      <Preloader isLoading={!loadedAllMessages} />
                    </div>
                  </div>

                  <form className="chats__send-form" name="message" onSubmit={handleSubmit}>
                    <textarea
                      className="chats__message-input"
                      value={messageInput}
                      onChange={handleChange}
                      onKeyPress={handleKey}
                    ></textarea>

                    <button type="submit" className="chats__send-button">
                      <img src={sendIcon} className="chats__send-icon" alt="send-icon" />
                    </button>
                  </form>
                </>
              ) : (
                ''
              )}
            </div>
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
