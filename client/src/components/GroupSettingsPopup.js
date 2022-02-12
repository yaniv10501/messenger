import React, { createRef, useEffect, useState } from 'react';
import PopupCard from './PopupCard';
import { fetchReducer, initialState, useThunkReducer } from '../utils/fetch';
import mainApi from '../utils/MainApi';
import closeIcon from '../images/close-icon.svg';
import noProfile from '../images/no-profile.png';

function GroupSettingsPopup({ currentChat, isPopupOpen, handleClose }) {
  const [state, thunkDispatch] = useThunkReducer(fetchReducer, initialState);
  const [isMoreFriendsPopupOpen, setIsMoreFriendsPopupOpen] = useState(false);
  const [moreFriends, setMoreFriends] = useState([]);
  const [refsArray, setRefsArray] = useState([]);
  const [groupNameInput, setGroupNameInput] = useState('');
  const [groupImageInput, setGroupImageInput] = useState(null);
  const [formData, setFormData] = useState(null);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const handleMoreFriendsPopupClose = () => {
    setIsMoreFriendsPopupOpen(false);
  };
  const handleMoreFriendsPopupOpen = () => {
    mainApi.getMoreGroupFriends(thunkDispatch, currentChat._id).then((response) => {
      setMoreFriends(response);
      setIsMoreFriendsPopupOpen(true);
    });
  };
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
    const { chatName } = currentChat;
    if (selectedFriends.length < 1 && chatName !== '' && errorMessage !== '') {
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
    const { friends } = currentChat;
    if (friends) {
      setRefsArray((refsArray) =>
        friends.map(({ _id }, i) => refsArray[i] || { _id, ref: createRef() })
      );
    }
  }, [currentChat]);
  return (
    <PopupCard
      handleClose={handleClose}
      isOpen={isPopupOpen}
      name="new-group"
      popupTitle="Group settings"
      popupBottomLink=""
      handleLinkClick={() => {}}
    >
      <form className="popup__new-group-form" onSubmit={handleSubmit}>
        <div className="popup__new-group-details">
          <label className="popup__new-group-subtitle">
            Group name
            <p className="popup__new-group-name-input">{currentChat.chatName}</p>
          </label>
          <p className="popup__new-group-subtitle">Group image</p>
          <label
            className="popup__new-group-image"
            htmlFor="profile-image"
            style={
              currentChat.chatImage
                ? {
                    backgroundImage: `url(${currentChat.chatImage})`,
                  }
                : {}
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
            {currentChat.friends &&
              currentChat.friends.length > 0 &&
              currentChat.friends.map(({ _id, firstName, lastName }) => (
                <li className="popup__new-group-selcted-friend" key={_id}>
                  <p className="popup__new-group-selcted-friend-name">
                    {firstName} {lastName}
                  </p>
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
          <h2 className="popup__new-group-friends-title">Edit friends</h2>
          <div className="popup__new-group-friends-container no-scroll-bar">
            {currentChat.friends && currentChat.friends.length > 0 ? (
              currentChat.friends.map(({ _id, firstName, lastName, image }, index) => (
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
                        Remove
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
            <button
              className="popup__new-group-submit-button"
              type="button"
              onClick={handleMoreFriendsPopupOpen}
            >
              Add more friends
            </button>
          </div>
        </div>
      </form>
      <PopupCard
        handleClose={handleMoreFriendsPopupClose}
        isOpen={isMoreFriendsPopupOpen}
        name="add-group-friends"
        popupTitle="Add friends"
        popupBottomLink="Done"
        handleLinkClick={handleMoreFriendsPopupClose}
      >
        <div className="popup__compose-user-cards">
          {moreFriends && moreFriends.length > 0 ? (
            moreFriends.map(({ _id, firstName, lastName, image }) => (
              <div className="popup__compose-user-card" key={_id}>
                <img
                  className="popup__compose-user-image"
                  src={image ? image : noProfile}
                  alt="friend icon"
                />
                <h2 className="popup__compose-user-name">{firstName} {lastName}</h2>
                <button className="popup__compose-send-button" onClick={() => {}}>
                  <p className="popup__compose-send-button-text">Add to group</p>
                </button>
              </div>
            ))
          ) : (
            <div>You have no friends</div>
          )}
        </div>
      </PopupCard>
    </PopupCard>
  );
}

export default GroupSettingsPopup;
