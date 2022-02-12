import React, { createRef, useEffect, useState } from 'react';
import PopupCard from './PopupCard';
import closeIcon from '../images/close-icon.svg';
import noProfile from '../images/no-profile.png';

function GroupSettingsPopup({ groupName, groupImage, groupFriends, isPopupOpen, handleClose }) {
  const [refsArray, setRefsArray] = useState([]);
  const [groupNameInput, setGroupNameInput] = useState('');
  const [groupImageInput, setGroupImageInput] = useState(null);
  const [formData, setFormData] = useState(null);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const handleSubmit = (event) => {
    event.preventDefault();
  };
  const handleGroupNameChange = (event) => {
    setGroupNameInput(event.target.value);
  };
  const handleNewGroupImage = (event) => {
    const tempData = new FormData();
    const image = event.target.files[0];
    const imageBlob = URL.createObjectURL(image);
    setGroupImageInput(imageBlob);
    tempData.append('groupPic', image, image.name);
    setFormData(tempData);
  };
  const addFriendToGroup = (event, _id, friendName) => {
    if (selectedFriends.length < 1 && groupName !== '' && errorMessage !== '') {
      setErrorMessage('');
    }
    const { target } = event;
    const { textContent } = target;
    if (textContent === 'Added') {
      target.textContent = 'Add';
      setSelectedFriends(selectedFriends.filter(({ _id: friendId }) => friendId !== _id));
    }
    if (textContent === 'Add') {
      target.textContent = 'Added';
      setSelectedFriends([{ _id, friendName }, ...selectedFriends]);
    }
    console.log(_id, friendName);
  };
  const removeSelectedFriend = (_id) => {
    setSelectedFriends(selectedFriends.filter(({ _id: friendId }) => friendId !== _id));
    console.log(refsArray);
    const {
      ref: { current: friendButton },
    } = refsArray.find(({ _id: friendId }) => friendId === _id);
    friendButton.textContent = 'Add';
  };
  useEffect(() => {
    if (groupFriends) {
      setRefsArray((refsArray) =>
        groupFriends.map(({ _id }, i) => refsArray[i] || { _id, ref: createRef() })
      );
    }
  }, [groupFriends]);
  return (
    <PopupCard
      handleClose={handleClose}
      isOpen={isPopupOpen}
      name="new-group"
      popupTitle="Create a new group"
      popupBottomLink=""
      setLinkPopupOpen={() => {}}
    >
      <form className="popup__new-group-form" onSubmit={handleSubmit}>
        <div className="popup__new-group-details">
          <label className="popup__new-group-subtitle">
            Group name
            <input
              className="popup__new-group-name-input"
              placeholder="Group name"
              value={groupNameInput}
              onChange={handleGroupNameChange}
            />
          </label>
          <p className="popup__new-group-subtitle">Group image</p>
          <label
            className="popup__new-group-image"
            htmlFor="profile-image"
            style={
              groupImage ? {
                backgroundImage: `url(${groupImage})`,
              } : {}
            }
          >
            <div className="popup__new-group-image-overlay" />
            <p className="popup__new-group-image-text">Upload</p>
            <input
              className="popup__new-group-image-input"
              type="file"
              id="profile-image"
              onChange={handleNewGroupImage}
            ></input>
          </label>
          <p className="popup__new-group-subtitle">Group friends</p>
          <ul className="popup__new-group-selcted-friends no-scroll-bar">
            {selectedFriends &&
              selectedFriends.length > 0 &&
              selectedFriends.map(({ _id, friendName }) => (
                <li className="popup__new-group-selcted-friend" key={_id}>
                  <p className="popup__new-group-selcted-friend-name">{friendName}</p>
                  <button
                    className="popup__new-group-diselect-friend-button"
                    onClick={() => removeSelectedFriend(_id)}
                  >
                    <img
                      className="popup__new-group-diselect-friend-icon"
                      src={closeIcon}
                      alt="diselect friend"
                    />
                  </button>
                </li>
              ))}
          </ul>
          <button className="popup__new-group-submit-button" type="submit">
            Create a new group
          </button>
          <p className="popup__new-group-error">{errorMessage}</p>
        </div>
        <div className="popup__new-group-friends">
          <h2 className="popup__new-group-friends-title">Add friends</h2>
          <div className="popup__new-group-friends-container no-scroll-bar">
            {groupFriends && groupFriends.length > 0 ? (
              groupFriends.map(({ _id, firstName, lastName, image }, index) => (
                <div className="popup__new-group-friend-card" key={_id}>
                  <img
                    className="popup__new-group-friend-image"
                    src={image ? image : noProfile}
                    alt="friend icon"
                  />
                  <div className="popup__new-group-friend-column">
                    <h2 className="popup__new-group-friend-name">
                      {firstName} {lastName}
                    </h2>
                    {refsArray[index] ? (
                      <button
                        className="popup__new-group-friend-add-button"
                        type="button"
                        onClick={(event) =>
                          addFriendToGroup(event, _id, `${firstName} ${lastName}`)
                        }
                        ref={refsArray[index].ref}
                      >
                        Add
                      </button>
                    ) : (
                      <button
                        className="popup__new-group-friend-add-button"
                        type="button"
                        onClick={(event) =>
                          addFriendToGroup(event, _id, `${firstName} ${lastName}`)
                        }
                      >
                        Add
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div>You have no friends</div>
            )}
          </div>
        </div>
      </form>
    </PopupCard>
  );
}

export default GroupSettingsPopup;
