import React, { useContext } from 'react';
import Popup from './Popup';
import { fetchReducer, initialState, useThunkReducer } from '../utils/fetch';
import CurrentUserContext from '../contexts/CurrentUserContext';
import mainApi from '../utils/MainApi';

function PopupInfo({ name, popupTitle, isNotifPopupOpen, handleClose, setCurrentUser }) {
  const [state, thunkDispatch] = useThunkReducer(fetchReducer, initialState);
  const { image } = useContext(CurrentUserContext);
  const handleNewFile = (event) => {
    const formData = new FormData();
    const image = event.target.files[0];
    formData.append('profilePic', image, image.name);
    mainApi.setUserImage(thunkDispatch, formData).then((response) => {
      console.log(response);
      setCurrentUser(response);
    });
  };
  return (
    <Popup handleClose={handleClose} isOpen={isNotifPopupOpen} name={name}>
      <div className="popup__info-container">
        <div className="popup__header">
          <h2 className="popup__info-title">{popupTitle}</h2>
          <p>Seems like you dont have a profile picture yet</p>
          <button
            className="popup__close-button"
            type="button"
            aria-label="Close"
            onClick={handleClose}
          />
        </div>
        <div className="popup__info-main">
          <label
            className="popup__info-profile-image"
            htmlFor="profile-image"
            style={
              image
                ? {
                    backgroundImage: `url(${image})`,
                  }
                : {}
            }
          >
            <div className="popup__info-profile-image-overlay" />
            <p className="popup__info-profile-image-text">Upload</p>
            <input
              className="popup__info-input-file"
              type="file"
              id="profile-image"
              onChange={handleNewFile}
            ></input>
          </label>
          <div className="popup__info-content-container">
            <p className="popup__info-friend-name">a</p>
            <div className="popup__info-content">
              <p className="popup__info-text">b</p>
              <p className="popup__info-time">x</p>
              <p className="popup__info-count">z</p>
            </div>
          </div>
        </div>
      </div>
    </Popup>
  );
}

export default PopupInfo;
