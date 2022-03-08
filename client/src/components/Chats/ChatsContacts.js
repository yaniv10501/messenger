import React from 'react';
import Preloader from '../Preloader/Preloader';
import noProfile from '../../images/no-profile.png';
import composeIcon from '../../images/compose.png';

function ChatsContacts({
  isMobile,
  handleOpenNewGroup,
  handleOpenCompose,
  handleBack,
  handleChatsScroll,
  allChatsData,
  handleChatClick,
  refsArray,
  chatPreloaderRef,
  loadedAllChats,
}) {
  return isMobile ? (
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
              lastMessageByUser,
              lastMessageBy,
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
                      <span>{lastMessageByUser ? 'You:' : ''}</span>
                      {lastMessage}
                    </p>
                  ) : (
                    <p className="chats__chat-message">
                      <span>{lastMessageByUser ? 'You:' : ''}</span>
                      {lastMessage}
                    </p>
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
  ) : (
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
              lastMessageByUser,
              lastMessageBy,
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
                      <span>{lastMessageByUser ? 'You:' : ''}</span>
                      {lastMessage}
                    </p>
                  ) : (
                    <p className="chats__chat-message">
                      <span>{lastMessageByUser ? 'You:' : ''}</span>
                      {lastMessage}
                    </p>
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
  );
}

export default ChatsContacts;
