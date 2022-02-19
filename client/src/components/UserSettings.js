import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CurrentUserContext from '../contexts/CurrentUserContext';
import mainApi from '../utils/MainApi';
import { fetchReducer, initialState, useThunkReducer } from '../utils/fetch';
import useFormValidation from '../utils/useFormValidation';
import { testEmail, testValid } from '../utils/regex';
import noProfile from '../images/no-profile.png';

function UserSettings({ setCurrentUser }) {
  const [state, thunkDispatch] = useThunkReducer(fetchReducer, initialState);
  const { name, email, image } = useContext(CurrentUserContext);
  const [friendsList, setFriendsList] = useState([]);
  const { values, handleChange, errors, isValid, resetForm, setValues, setIsValid } =
    useFormValidation();
  const { name: nameInput = name, email: emailInput = email } = values;
  const handleInputChange = (event) => {
    handleChange(event);
    const { name: inputName, value: inputValue, nextElementSibling: updateButton } = event.target;
    if (inputName === 'name') {
      if (inputValue === name) {
        updateButton.classList.remove('settings__update-button_active');
      } else {
        const isValid = testValid(inputValue);
        isValid
          ? updateButton.classList.add('settings__update-button_active')
          : updateButton.classList.remove('settings__update-button_active');
      }
    }
    if (inputName === 'email') {
      if (inputValue === email) {
        updateButton.classList.remove('settings__update-button_active');
      } else {
        const isValid = testEmail(inputValue);
        isValid
          ? updateButton.classList.add('settings__update-button_active')
          : updateButton.classList.remove('settings__update-button_active');
      }
    }
  };
  const navigate = useNavigate();
  const handleBack = () => navigate('/');
  const handleNewFile = (event) => {
    const formData = new FormData();
    const image = event.target.files[0];
    formData.append('profilePic', image, image.name);
    mainApi.setUserImage(thunkDispatch, formData).then((response) => {
      console.log(response);
      setCurrentUser(response);
    });
  };
  const handleUserUpdate = (event) => {
    event.preventDefault();
    const { name } = event.target;
    console.log(name);
    if (name === 'name') {
      console.log(nameInput);
    }
    if (name === 'email') {
      console.log(emailInput);
    }
  };
  const handleFriendMute = (event, friendId) => {
    console.log(friendId);
    mainApi.setFriendMute(thunkDispatch, friendId).then((result) => {
      const newFriendsList = friendsList.map((friendElem) => {
        const {
          friend: { _id },
        } = friendElem;
        console.log(_id === friendId);
        if (_id === friendId) {
          console.log(result);
          const { isMute } = result;
          return {
            ...friendElem,
            isMute,
          };
        }
        return friendElem;
      });
      console.log(friendsList, newFriendsList);
      setFriendsList(newFriendsList);
    });
  };
  useEffect(() => {
    mainApi.getFriendsList(thunkDispatch).then((friendsListResult) => {
      console.log(friendsListResult);
      setFriendsList(friendsListResult);
    });
  }, []);
  return (
    <main className="settings">
      <div className="settings__back-button" onClick={handleBack}>
        <p className="settings__back-title">Back</p>
      </div>
      <h2 className="settings__title">Settings</h2>
      <h3 className="settings__subtitle">Your profile</h3>
      <div className="settings__profile-container">
        <div className="settings__user-container">
          <label
            className="settings__profile-image"
            htmlFor="profile-image"
            style={
              image
                ? {
                    backgroundImage: `url(${image})`,
                  }
                : {}
            }
          >
            <div className="settings__profile-image-overlay" />
            <p className="settings__profile-image-text">Upload</p>
            <input
              className="settings__input-file"
              type="file"
              id="profile-image"
              onChange={handleNewFile}
            ></input>
          </label>
          <form className="settings__profile-form" onSubmit={(event) => event.preventDefault()} noValidate>
            <p className="settings__profile-name">
              Name
              <span className="settings__profile-info">{name}</span>
            </p>
            <label className="settings__profile-name">
              UserName
              <input
                className="settings__profile-info"
                name="name"
                type="text"
                value={nameInput}
                onChange={handleInputChange}
              ></input>
              <button
                className="settings__update-button"
                type="submit"
                name="name"
                onClick={handleUserUpdate}
              >
                Update
              </button>
            </label>
            <label className="settings__profile-name">
              Email
              <input
                className="settings__profile-info"
                name="email"
                type="email"
                value={emailInput}
                onChange={handleInputChange}
              ></input>
              <button
                className="settings__update-button"
                type="submit"
                name="email"
                onClick={handleUserUpdate}
              >
                Update
              </button>
            </label>
          </form>
        </div>
        <div className="settings__user-friends">
          <h2 className="settings__friends-title">Friends List</h2>
          <ul className="settings__friends-list no-scroll-bar">
            {friendsList.length > 0 ? (
              friendsList.map(({ _id, firstName, lastName, image: friendImage }) => (
                <li className="settings__friend-card" key={_id}>
                  <img
                    className="settings__friend-image"
                    src={friendImage ? friendImage : noProfile}
                    alt="friend icon"
                  />
                  <div className="settings__friend-container">
                    <h2 className="settings__friend-name">
                      {firstName} {lastName}
                    </h2>
                    <div className="settings__friend-buttons">
                      <button
                        className="settings__friend-button"
                        onClick={(event) => handleFriendMute(event, _id)}
                      >
                        <p className="settings__friend-button-text">Remove</p>
                      </button>
                      <button
                        className="settings__friend-button"
                        onClick={(event) => handleFriendMute(event, _id)}
                      >
                        <p className="settings__friend-button-text">Block</p>
                      </button>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <p>No friends</p>
            )}
          </ul>
        </div>
      </div>
      <h3 className="settings__subtitle">Privacy</h3>
      <p>To be...</p>
    </main>
  );
}

export default UserSettings;
