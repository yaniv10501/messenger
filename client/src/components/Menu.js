import React, { useRef, useState } from 'react';
import notifIcon from '../images/notifications.svg';
import menuIcon from '../images/menu.png';
import arrow from '../images/arrow.svg';
import noProfile from '../images/no-profile.svg';

function Menu({
  loggedIn,
  notification,
  setNotification,
  notificationsQueue,
  setNotificationsQueue,
}) {
  console.log(notification, notificationsQueue);
  const menuRef = useRef();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notificationIndex, setNotificationIndex] = useState(0);
  const toggleMenuOpen = () => {
    const { current } = menuRef;
    if (isMenuOpen) {
      current.style.top = '-95px';
      setIsMenuOpen(false);
    }
    if (!isMenuOpen) {
      current.style.top = '0';
      setIsMenuOpen(true);
    }
  };
  const handleNotifUp = () => {
    if (notificationIndex > 0) {
      setNotification(notificationsQueue[notificationIndex - 1]);
      setNotificationIndex(notificationIndex - 1);
    }
  };
  const handleNotifDown = () => {
    if (notificationIndex + 1 < notificationsQueue.length) {
      setNotification(notificationsQueue[notificationIndex + 1]);
      setNotificationIndex(notificationIndex + 1);
    }
  };
  return (
    <>
      {loggedIn && (
        <div className="menu" ref={menuRef}>
          <div className="menu__notif-icon-overlay">
            <img className="menu__notif-icon" src={notifIcon} alt="notif" />
            {notificationsQueue && notificationsQueue.length > 0 && (
              <p className="menu__notif-count">{notificationsQueue.length}</p>
            )}
          </div>
          {notification.user ? (
            <div className="menu__notif-continer">
              <img
                className="menu__notif-friend-image"
                src={notification.user.image ? notification.user.image : noProfile}
                alt="Friend avatar"
              />
              <div className="menu__notif-friend-content">
                <p className="menu__notif-friend-name">
                  {notification.user.userName ||
                    `${notification.user.firstName} ${notification.user.lastName}`}
                </p>
                {notification.type === 'New message' && (
                  <>
                    <p className="menu__notif-text">{notification.message.messageContent}</p>
                    <p className="menu__notif-time">{notification.message.messageTime}</p>
                  </>
                )}
                {notification.type === 'Friend request' && (
                  <>
                    <p className="menu__notif-text">Sent you a friend request</p>
                  </>
                )}
                {notification.type === 'Friend accept' && (
                  <>
                    <p className="menu__notif-text">Accepted your friend request</p>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="menu__no-notif-container">
              <p className="menu__no-notif-text">No new notifications</p>
            </div>
          )}
          {notificationsQueue.length > 1 && (
            <div className="menu__notif-buttons">
              <button
                className="menu__notif-button menu__notif-button_up"
                type="button"
                onClick={handleNotifUp}
              >
                <img className="menu__notif-button-image" src={arrow} alt="Arrow" />
              </button>
              <button
                className="menu__notif-button menu__notif-button_down"
                type="button"
                onClick={handleNotifDown}
              >
                <img className="menu__notif-button-image" src={arrow} alt="Arrow" />
              </button>
            </div>
          )}
          <button className="menu__button" type="button" onClick={toggleMenuOpen}>
            <img className="menu__icon" src={menuIcon} alt="notif" />
            {notificationsQueue && notificationsQueue.length > 0 && (
              <p className="menu__button-count">{notificationsQueue.length}</p>
            )}
          </button>
        </div>
      )}
    </>
  );
}

export default Menu;
