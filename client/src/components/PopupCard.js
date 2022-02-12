import React from 'react';
import Popup from './Popup';

function PopupCard({
  handleClose,
  isOpen,
  name,
  popupTitle,
  popupBottomLink,
  handleLinkClick,
  children,
}) {
  return (
    <Popup handleClose={handleClose} isOpen={isOpen} name={name} >
      <div className="popup__container">
        <div className="popup__header">
          <p className={name === 'info' ? 'popup__title popup__title_type_info' : 'popup__title'}>
            {popupTitle}
          </p>
          <button
            className="popup__close-button"
            type="button"
            aria-label="Close"
            onClick={handleClose}
          />
        </div>
        <div className="popup__main">
          {children}
          <a className="popup__bottom-link" href={popupTitle} onClick={handleLinkClick}>
            {popupBottomLink}
          </a>
        </div>
      </div>
    </Popup>
  );
}

export default PopupCard;
