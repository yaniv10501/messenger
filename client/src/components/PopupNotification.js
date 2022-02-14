import React from 'react';
import Popup from './Popup';
import noProfile from '../images/no-profile.png';

function PopupNotification({
  name,
  popupTitle,
  notification,
  notificationsQueue,
  isNotifPopupOpen,
  handleClose,
}) {
  return (
    <Popup handleClose={handleClose} isOpen={isNotifPopupOpen} name={name}>
      <div className="popup__notif-container">
        <div className="popup__header">
          <p className="popup__notif-title">{notification.type}</p>
          <button
            className="popup__close-button"
            type="button"
            aria-label="Close"
            onClick={handleClose}
          />
        </div>
        {notification.user && (
          <div className="popup__notif-main">
            <img
              className="popup__notif-image"
              src={notification.user.image || noProfile}
              alt="User avatar"
            />
            <div className="popup__notif-content-container">
              <p className="popup__notif-friend-name">{notification.user.userName}</p>
              <div className="popup__notif-content">
                {notification.type === 'New message' && (
                  <>
                    <p className="popup__notif-text">{notification.message.messageContent}</p>
                    <p className="popup__notif-time">{notification.message.messageTime}</p>
                    <p className="popup__notif-count">{notificationsQueue.length + 1}</p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Popup>
  );
}

export default PopupNotification;
