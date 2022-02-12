import React from 'react';
import PopupCard from './PopupCard';
import noProfile from '../images/no-profile.png';

function ChatSettingsPopup({ currentChat, isPopupOpen, handleClose }) {
  const handleSubmit = (event) => {
    event.preventDefault();
  };
  return (
    <PopupCard
      handleClose={handleClose}
      isOpen={isPopupOpen}
      name="new-group"
      popupTitle="Chat settings"
      popupBottomLink=""
      setLinkPopupOpen={() => {}}
    >
      <div className="popup__new-group-form" onSubmit={handleSubmit}>
        <div className="popup__new-group-details">
          <p className="popup__new-group-subtitle">{currentChat.chatName}</p>
          <img
            className="popup__new-group-image"
            src={currentChat.chatImage ? currentChat.chatImage : noProfile}
            alt="Friend avatar"
          />
          <button className="popup__new-group-submit-button" type="button">
            Mute
          </button>
          <button className="popup__new-group-submit-button" type="button">
            Block
          </button>
          <button className="popup__new-group-submit-button" type="button">
            Delete
          </button>
        </div>
        <div className="popup__new-group-friends">
          <h2 className="popup__new-group-friends-title">Media</h2>
          <div className="popup__new-group-friends-container no-scroll-bar">To be...</div>
        </div>
      </div>
    </PopupCard>
  );
}

export default ChatSettingsPopup;
