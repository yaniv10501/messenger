import React, { createRef, useEffect, useState } from 'react';
import Preloader from '../Preloader/Preloader';
import noProfile from '../../images/no-profile.png';
import sendIcon from '../../images/send.png';

function ChatsMessages({
  isMobile,
  currentChat,
  handleMobileBack,
  handleOpenGroupSettings,
  handleOpenChatSettings,
  isUserTyping,
  userTypingText,
  messagesContainerRef,
  handleMessagesScroll,
  messagesPreloaderRef,
  loadedAllMessages,
  handleSubmit,
  messageInput,
  handleChange,
  handleKey,
}) {
  let chatTimeIndex = 0;
  let animation;
  const [chatScrollIndex, setChatScrollIndex] = useState(0);
  const [chatTimeRefs, setChatTimeRefs] = useState([]);
  const handleSendMessage = (event) => {
    console.log(
      chatTimeRefs[1]?.current?.firstChild?.textContent !== 'Today' && chatTimeRefs.length > 1
    );
    console.log(chatTimeRefs.length < 1);
    if (
      (chatTimeRefs[1]?.current?.firstChild?.textContent !== 'Today' && chatTimeRefs.length > 1) ||
      chatTimeRefs.length < 1
    ) {
      handleSubmit(event, { today: true });
    } else {
      handleSubmit(event);
    }
  };
  const handleKeyPress = (event) => {
    handleKey(event, handleSendMessage);
  };
  const handleMessagesContainerScroll = (event) => {
    const currentChatTime = chatTimeRefs[0] ? chatTimeRefs[0].current : null;
    const nextChatTime = chatTimeRefs[chatScrollIndex + 1]
      ? chatTimeRefs[chatScrollIndex + 1].current
      : null;
    const prevChatTime = chatTimeRefs[chatScrollIndex]
      ? chatTimeRefs[chatScrollIndex].current
      : null;
    const { style } = currentChatTime || {};
    if (style) {
      if (!animation) {
        if (currentChatTime) {
          animation = currentChatTime.animate(
            [
              {
                opacity: 0,
              },
              {
                opacity: 1,
              },
              {
                opacity: 0,
              },
            ],
            {
              duration: 2000,
              easing: 'cubic-bezier(0,.99,1,.08)',
            }
          );
          animation.play();
          animation.onfinish = () => {
            animation = null;
          };
        }
      } else {
        if (animation.currentTime > 750) {
          style.opacity = 1;
          animation.cancel();
          animation = currentChatTime.animate(
            [
              {
                opacity: 1,
              },
              {
                opacity: 0,
              },
            ],
            {
              duration: 2000,
              easing: 'cubic-bezier(1,0,1,0)',
            }
          );
          animation.play();
          animation.onfinish = () => {
            animation = null;
            style.opacity = 0;
          };
        }
      }
    }
    if (nextChatTime || prevChatTime) {
      const { y: currentY } = currentChatTime ? currentChatTime.getBoundingClientRect() : {};
      const { y: nextY } = nextChatTime ? nextChatTime.getBoundingClientRect() : {};
      const { y: prevY } = prevChatTime ? prevChatTime.getBoundingClientRect() : {};
      if (currentY - nextY < 30) {
        animation.cancel();
        const nextTime = nextChatTime.firstChild.textContent;
        nextChatTime.firstChild.textContent = currentChatTime.firstChild.textContent;
        currentChatTime.firstChild.textContent = nextTime;
        setChatScrollIndex((value) => value + 1);
      }
      if (chatScrollIndex !== 0 && prevY - currentY < 20) {
        const prevTime = prevChatTime.firstChild.textContent;
        prevChatTime.firstChild.textContent = currentChatTime.firstChild.textContent;
        currentChatTime.firstChild.textContent = prevTime;
        setChatScrollIndex((value) => value - 1);
      }
    }
    handleMessagesScroll(event);
  };
  useEffect(() => {
    const { messages } = currentChat || {};
    if (messages && messages.length > 0) {
      setChatTimeRefs((chatTimeRefsState) => {
        const newRefs = [];
        let i = 0;
        let updateToday;
        messages.forEach((message) => {
          if (!message.messageContent && message.chatTime) {
            if (
              message.chatTime === 'Today' &&
              chatTimeRefsState[0]?.current?.firstChild?.textContent === 'Today' &&
              chatTimeRefs.length > 1
            ) {
              updateToday = true;
            } else {
              const currentRef = chatTimeRefsState[i];
              if (!currentRef) {
                newRefs.push(createRef());
              }
              i += 1;
            }
          }
        });
        console.log(updateToday);
        if (updateToday) {
          return [createRef(), ...chatTimeRefsState, ...newRefs];
        }
        return [...chatTimeRefsState, ...newRefs];
      });
    }
  }, [currentChat]);
  useEffect(() => {
    if (chatTimeRefs[0]) {
      const currentChatTime = chatTimeRefs[0].current;
      if (currentChatTime) {
        if (currentChatTime.firstChild.textContent === 'Today') {
          const nextChatTime = chatTimeRefs[1] ? chatTimeRefs[1].current : null;
          if (nextChatTime) {
            const nextTime = nextChatTime.firstChild.textContent;
            nextChatTime.firstChild.textContent = currentChatTime.firstChild.textContent;
            currentChatTime.firstChild.textContent = nextTime;
            setChatScrollIndex(1);
          }
        }
        console.log(currentChatTime);
        const { style } = currentChatTime;
        style.opacity = 0;
        style.position = 'absolute';
        style.top = '190px';
        style.left = '50%';
        style.transform = 'translateX(-50%)';
      }
    }
  }, [chatTimeRefs]);
  return isMobile ? (
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
                    <span className="chats__friend-header-bottom-text">{currentChat.subtitle}</span>
                  </p>
                ) : (
                  <p className="chats__friend-header-bottom-title">
                    {currentChat.isOnline.online ? 'Online' : ''}
                    <span className="chats__friend-header-bottom-text">
                      {currentChat.isOnline.online ? '' : `Was online ${currentChat.isOnline.time}`}
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
            onScroll={handleMessagesContainerScroll}
          >
            {currentChat.messages.length > 0
              ? currentChat.messages.map(
                  (
                    {
                      _id,
                      messageByUser,
                      messageBy,
                      messageContent,
                      messageTime,
                      chatTime,
                      groupMessage,
                    },
                    index
                  ) => {
                    if (index === 0) {
                      chatTimeIndex = 0;
                    }
                    if (messageByUser) {
                      return (
                        <div className="chats__message chats__message_user" key={_id}>
                          <div className="chats__message-content">
                            <p className="chats__message-text">{messageContent}</p>

                            <p className="chats__message-date">{messageTime}</p>
                          </div>
                        </div>
                      );
                    } else {
                      if (!messageContent && chatTime) {
                        console.log(chatTime);
                        chatTimeIndex += 1;
                        return chatTimeRefs[chatTimeIndex - 1] ? (
                          <div
                            className="chats__message-time"
                            key={chatTime}
                            ref={chatTimeRefs[chatTimeIndex - 1]}
                          >
                            <p className="chats__message-time-text">{chatTime}</p>
                          </div>
                        ) : (
                          <div className="chats__message-time" key={chatTime}>
                            <p className="chats__message-time-text">{chatTime}</p>
                          </div>
                        );
                      }
                      if (groupMessage) {
                        return (
                          <div className="chats__message-time" key={groupMessage}>
                            <p className="chats__message-time-text">{groupMessage}</p>
                          </div>
                        );
                      }
                      return (
                        <div className="chats__message chats__message_friend" key={_id}>
                          {currentChat.isGroup && <p className="chats__message-by">{messageBy}</p>}
                          <div className="chats__message-content">
                            <p className="chats__message-text">{messageContent}</p>

                            <p className="chats__message-date">{messageTime}</p>
                          </div>
                        </div>
                      );
                    }
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

          <form className="chats__send-form" name="message" onSubmit={handleSendMessage}>
            <textarea
              className="chats__message-input"
              value={messageInput}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
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
  ) : (
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
                  <span className="chats__friend-header-bottom-text">{currentChat.subtitle}</span>
                </p>
              ) : (
                <p className="chats__friend-header-bottom-title">
                  {currentChat.isOnline.online ? 'Online' : ''}
                  <span className="chats__friend-header-bottom-text">
                    {currentChat.isOnline.online ? '' : `Was online ${currentChat.isOnline.time}`}
                  </span>
                </p>
              )}
            </div>
          </button>

          <div
            id="messagesContainer"
            className="chats__messages-container no-scroll-bar"
            ref={messagesContainerRef}
            onScroll={handleMessagesContainerScroll}
          >
            {currentChat.messages.length > 0
              ? currentChat.messages.map(
                  (
                    {
                      _id,
                      messageByUser,
                      messageBy,
                      messageContent,
                      messageTime,
                      chatTime,
                      groupMessage,
                    },
                    index
                  ) => {
                    if (index === 0) {
                      chatTimeIndex = 0;
                    }
                    if (messageByUser) {
                      return (
                        <div className="chats__message chats__message_user" key={_id}>
                          <div className="chats__message-content">
                            <p className="chats__message-text">{messageContent}</p>

                            <p className="chats__message-date">{messageTime}</p>
                          </div>
                        </div>
                      );
                    } else {
                      if (!messageContent && chatTime) {
                        chatTimeIndex += 1;
                        return chatTimeRefs[chatTimeIndex - 1] ? (
                          <div
                            className="chats__message-time"
                            key={chatTime}
                            ref={chatTimeRefs[chatTimeIndex - 1]}
                          >
                            <p className="chats__message-time-text">{chatTime}</p>
                          </div>
                        ) : (
                          <div className="chats__message-time" key={chatTime}>
                            <p className="chats__message-time-text">{chatTime}</p>
                          </div>
                        );
                      }
                      if (groupMessage) {
                        return (
                          <div className="chats__message-time" key={groupMessage}>
                            <p className="chats__message-time-text">{groupMessage}</p>
                          </div>
                        );
                      }
                      return (
                        <div className="chats__message chats__message_friend" key={_id}>
                          {currentChat.isGroup && <p className="chats__message-by">{messageBy}</p>}
                          <div className="chats__message-content">
                            <p className="chats__message-text">{messageContent}</p>

                            <p className="chats__message-date">{messageTime}</p>
                          </div>
                        </div>
                      );
                    }
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

          <form className="chats__send-form" name="message" onSubmit={handleSendMessage}>
            <textarea
              className="chats__message-input"
              value={messageInput}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
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
  );
}

export default ChatsMessages;
