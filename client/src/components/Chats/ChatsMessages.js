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
  const [chatTimeRefs, setChatTimeRefs] = useState([]);
  useEffect(() => {
    if (currentChat.messages && currentChat.messages.length > 0) {
      const newTimeRef = [];
      currentChat.messages.forEach((message) => {
        if (!message.messageContent && message.chatTime) {
          newTimeRef.push(createRef());
          setChatTimeRefs(newTimeRef);
        }
      });
    }
  }, [currentChat.messages]);
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
            onScroll={handleMessagesScroll}
          >
            {currentChat.messages.length > 0
              ? currentChat.messages.map(
                  ({ messageByUser, messageBy, messageContent, messageTime, chatTime }, index) => {
                    if (messageByUser) {
                      return (
                        <div className="chats__message chats__message_user" key={index}>
                          <div className="chats__message-content">
                            <p className="chats__message-text">{messageContent}</p>

                            <p className="chats__message-date">{messageTime}</p>
                          </div>
                        </div>
                      );
                    } else {
                      if (!messageContent && chatTime) {
                        return (
                          <div className="chats__message-time" key={index} ref={chatTimeRefs.shift()}>
                            <p className="chats__message-time-text">{chatTime}</p>
                          </div>
                        );
                      }
                      return (
                        <div className="chats__message chats__message_friend" key={index}>
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
            onScroll={handleMessagesScroll}
          >
            {currentChat.messages.length > 0
              ? currentChat.messages.map(
                  ({ messageByUser, messageBy, messageContent, messageTime, chatTime }, index) => {
                    if (messageByUser) {
                      return (
                        <div className="chats__message chats__message_user" key={index}>
                          <div className="chats__message-content">
                            <p className="chats__message-text">{messageContent}</p>

                            <p className="chats__message-date">{messageTime}</p>
                          </div>
                        </div>
                      );
                    } else {
                      if (!messageContent && chatTime) {
                        return (
                          <div className="chats__message-time" key={index} ref={chatTimeRefs.shift()}>
                            <p className="chats__message-time-text">{chatTime}</p>
                          </div>
                        );
                      }
                      return (
                        <div className="chats__message chats__message_friend" key={index}>
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
  );
}

export default ChatsMessages;
