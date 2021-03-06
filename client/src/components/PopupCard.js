import React from 'react';
import Popup from './Popup';
import Preloader from './Preloader/Preloader';

function PopupCard({
  handleClose,
  isOpen,
  name,
  popupTitle,
  popupBottomLink,
  handleLinkClick,
  isLoading,
  children,
}) {
  return (
    <Popup handleClose={handleClose} isOpen={isOpen} name={name}>
      <Preloader isLoading={isLoading} />
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
        <div className={isLoading ? 'popup__main popup__main_hidden' : 'popup__main'}>
          {children}
          {popupBottomLink && (
            <button className="popup__bottom-link" onClick={handleLinkClick}>
              {popupBottomLink}
            </button>
          )}
        </div>
      </div>
    </Popup>
  );
}

export default PopupCard;
