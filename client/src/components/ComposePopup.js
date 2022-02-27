import React from 'react';
import noProfile from '../images/no-profile.png';
import PopupCard from './PopupCard';

function ComposePopup({ isPopupOpen, handleClose, composeList, initNewChat }) {
  return (
    <PopupCard
      handleClose={handleClose}
      isOpen={isPopupOpen}
      name="compose"
      popupTitle="Compose"
      popupBottomLink="Add more friends"
      setLinkPopupOpen={() => {}}
    >
      <div className="popup__compose-user-cards">
        {composeList && composeList.length > 0 ? (
          composeList.map(({ _id, chatName, chatImage, friends, isOnline }) => (
            <div className="popup__compose-user-card" key={_id}>
              <img
                className="popup__compose-user-image"
                src={chatImage ? chatImage : noProfile}
                alt="friend icon"
              />
              <h2 className="popup__compose-user-name">{chatName}</h2>
              <button
                className="popup__compose-send-button"
                onClick={() => initNewChat(_id, chatName, chatImage, friends, isOnline)}
              >
                <p className="popup__compose-send-button-text">Send a message</p>
              </button>
            </div>
          ))
        ) : (
          <div>You have no friends</div>
        )}
      </div>
    </PopupCard>
  );
}

export default ComposePopup;
