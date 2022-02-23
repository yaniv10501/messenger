import React, { useContext, useState } from 'react';
import Popup from './Popup';
import { fetchReducer, initialState, useThunkReducer } from '../utils/fetch';
import CurrentUserContext from '../contexts/CurrentUserContext';
import mainApi from '../utils/MainApi';

function PopupInfo({ name, popupTitle, isNotifPopupOpen, handleClose, setCurrentUser }) {
  const [state, thunkDispatch] = useThunkReducer(fetchReducer, initialState);
  const { image } = useContext(CurrentUserContext);
  const [dontdisturbProfile, setDontDisturbProfile] = useState(false);
  const handleNewFile = (event) => {
    const formData = new FormData();
    const image = event.target.files[0];
    formData.append('profilePic', image, image.name);
    mainApi.setUserImage(thunkDispatch, formData).then((response) => {
      console.log(response);
      setCurrentUser(response);
      handleClose();
    });
  };
  const handleDisturbChange = (event) => {
    setDontDisturbProfile(event.target.checked);
  };
  const handleDone = () => {
    if (!dontdisturbProfile) {
      handleClose();
    } else {
      mainApi.setDontDisturbProfile(thunkDispatch).then((response) => {
        console.log(response);
        handleClose();
      })
    }
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
          <h2>Upload now!</h2>
          <label
            className="popup__info-profile-image"
            htmlFor="popup-info-profile-image"
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
              id="popup-info-profile-image"
              onChange={handleNewFile}
            />
          </label>
          <div className="popup__info-content-container">
            <div className="popup__info-content">
              <label>
                <input type="checkbox" onChange={handleDisturbChange} value={dontdisturbProfile} />
                Dont remind
              </label>
            </div>
            <button type="button" onClick={handleDone}>
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </Popup>
  );
}

export default PopupInfo;
