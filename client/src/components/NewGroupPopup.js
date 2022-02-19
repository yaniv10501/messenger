import React, { createRef, useEffect, useState } from 'react';
import { fetchReducer, initialState, useThunkReducer } from '../utils/fetch';
import PopupCard from './PopupCard';
import noProfile from '../images/no-profile.png';
import closeIcon from '../images/close-icon.svg';
import mainApi from '../utils/MainApi';

function NewGroupPopup({
  handleClose,
  isPopupOpen,
  friendsList: { groupId, friendsList },
  createNewGroup,
}) {
  const [state, thunkDispatch] = useThunkReducer(fetchReducer, initialState);
  const { silentLoading } = state;
  const [errorMessage, setErrorMessage] = useState('');
  const [groupName, setGroupName] = useState('');
  const [groupImage, setGroupImage] = useState(null);
  const [formData, setFormData] = useState(null);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [refsArray, setRefsArray] = useState([]);
  const handleGroupNameChange = (event) => {
    if (groupName === '' && selectedFriends.length > 0 && errorMessage !== '') {
      setErrorMessage('');
    }
    const {
      target: { value },
    } = event;
    setGroupName(value);
  };
  const handleNewGroupImage = (event) => {
    const tempData = new FormData();
    const image = event.target.files[0];
    const imageBlob = URL.createObjectURL(image);
    setGroupImage(imageBlob);
    tempData.append('groupPic', image, image.name);
    setFormData(tempData);
  };
  const addFriendToGroup = (event, _id, firstName, lastName, image) => {
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
      setSelectedFriends([{ _id, firstName, lastName, image }, ...selectedFriends]);
    }
  };
  const removeSelectedFriend = (_id) => {
    setSelectedFriends(selectedFriends.filter(({ _id: friendId }) => friendId !== _id));
    console.log(refsArray);
    const {
      ref: { current: friendButton },
    } = refsArray.find(({ _id: friendId }) => friendId === _id);
    friendButton.textContent = 'Add';
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    if (groupName === '') {
      setErrorMessage('Group must have a name');
      return;
    }
    if (selectedFriends.length < 1) {
      setErrorMessage('Group must have a friend');
      return;
    }
    mainApi
      .initNewGroup(thunkDispatch, groupId, groupName, formData, selectedFriends)
      .then((response) => {
        handleClose();
        createNewGroup(groupId, groupName, selectedFriends, formData)
      });
  };
  useEffect(() => {
    if (friendsList) {
      setRefsArray((refsArray) =>
        friendsList.map(({ _id }, i) => refsArray[i] || { _id, ref: createRef() })
      );
    }
  }, [friendsList]);
  return (
    <PopupCard
      handleClose={handleClose}
      isOpen={isPopupOpen}
      name="new-group"
      popupTitle="Create a new group"
      popupBottomLink=""
      setLinkPopupOpen={() => {}}
      isLoading={silentLoading}
    >
      <form className="popup__new-group-form" onSubmit={handleSubmit}>
        <div className="popup__new-group-details">
          <label className="popup__new-group-subtitle">
            Group name
            <input
              className="popup__new-group-name-input"
              placeholder="Group name"
              value={groupName}
              onChange={handleGroupNameChange}
            />
          </label>
          <p className="popup__new-group-subtitle">Group image</p>
          <label
            className="popup__new-group-image"
            htmlFor="profile-image"
            style={
              groupImage && {
                backgroundImage: `url(${groupImage})`,
              }
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
              selectedFriends.map(({ _id, firstName, lastName }) => (
                <li className="popup__new-group-selcted-friend" key={_id}>
                  <p className="popup__new-group-selcted-friend-name">{firstName} {lastName}</p>
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
            {friendsList && friendsList.length > 0 ? (
              friendsList.map(({ _id, firstName, lastName, image }, index) => (
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
                          addFriendToGroup(event, _id, firstName, lastName, image)
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
                          addFriendToGroup(event, _id, firstName, lastName, image)
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

export default NewGroupPopup;
