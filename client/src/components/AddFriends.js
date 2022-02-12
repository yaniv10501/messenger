import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchReducer, initialState, useThunkReducer } from '../utils/fetch';
import mainApi from '../utils/MainApi';
import addButton from '../images/add-button.svg';
import FriendCard from './FriendCard';

function AddFriends({ chatWebSocket }) {
  const navigate = useNavigate();
  const [state, thunkDispatch] = useThunkReducer(fetchReducer, initialState);
  const [addFriendsList, setAddFriendsList] = useState([]);
  const [friendRequestsList, setFriendRequestsList] = useState([]);
  const [pendingFriendRequestsList, setPendingFriendRequestsList] = useState([]);
  const handleBack = () => navigate('/');
  const handleAddFriend = (friendId, index) => mainApi.addFriend(thunkDispatch, friendId, index);
  const handleAcceptRequest = (requestId, index) =>
    mainApi.acceptFriendRequest(thunkDispatch, requestId, index);
  useEffect(() => {
    mainApi.getAddFriends(thunkDispatch).then((response) => {
      console.log(response);
      const { moreFriends, friendRequests, pendingFriendRequests } = response;
      setAddFriendsList(moreFriends);
      setFriendRequestsList(friendRequests);
      setPendingFriendRequestsList(pendingFriendRequests);
    });
  }, []);
  useEffect(() => {
    if (chatWebSocket) {
      chatWebSocket.onmessage = (wsMessage) => {
        const { message, data } = JSON.parse(wsMessage.data);
        if (message === 'Friend request') {
          setPendingFriendRequestsList([data, ...pendingFriendRequestsList]);
        }
        if (message === 'Friend accept') {
          const newPendingList = pendingFriendRequestsList.filter(({_id: requestId}) => requestId !== data._id)
          setPendingFriendRequestsList(newPendingList);
        }
      };
    }
  }, [chatWebSocket]);
  return (
    <main className="add-friends">
      <div className="add-friends__back-button" onClick={handleBack}>
        <p className="add-friends__back-title">Back</p>
      </div>
      <div className="add-friends__friends">
        <div className="add-friends__more-friends">
          <h2 className="add-friends__more-title">Add Friends</h2>
          <div className="add-friends__more-friends-container no-scroll-bar">
            {addFriendsList &&
              addFriendsList.length > 0 &&
              addFriendsList.map(({ _id, firstName, lastName, image }, index) => (
                <FriendCard
                  key={_id}
                  _id={_id}
                  image={image}
                  firstName={firstName}
                  lastName={lastName}
                  index={index}
                  friendAction={handleAddFriend}
                  buttonIcon={addButton}
                  buttonAlt="Add button"
                  buttonReadyText="Add"
                  buttonActiveText="Sent"
                  classType="more"
                />
              ))}
          </div>
        </div>
        <div className="add-friends__friend-requests">
          <h2 className="add-friends__requests-title">Friend Requests</h2>
          <div className="add-friends__friend-requests-container no-scroll-bar">
            {friendRequestsList &&
              friendRequestsList.length > 0 &&
              friendRequestsList.map(({ _id, firstName, lastName, image }, index) => (
                <FriendCard
                  key={_id}
                  _id={_id}
                  image={image}
                  firstName={firstName}
                  lastName={lastName}
                  index={index}
                  friendAction={handleAddFriend}
                  buttonIcon={addButton}
                  buttonAlt="Add button"
                  buttonReadyText="Remove"
                  buttonActiveText="Removed"
                  classType="request"
                />
              ))}
          </div>
        </div>
        <div className="add-friends__pending">
          <h2 className="add-friends__pending-title">Pending Requests</h2>
          <div className="add-friends__pending-container no-scroll-bar">
            {pendingFriendRequestsList &&
              pendingFriendRequestsList.length > 0 &&
              pendingFriendRequestsList.map(({ _id, firstName, lastName, image }, index) => (
                <FriendCard
                  key={_id}
                  _id={_id}
                  image={image}
                  firstName={firstName}
                  lastName={lastName}
                  index={index}
                  friendAction={handleAcceptRequest}
                  buttonIcon={addButton}
                  buttonAlt="Add button"
                  buttonReadyText="Accept"
                  buttonActiveText="Accepted"
                  classType="pending"
                />
              ))}
          </div>
        </div>
      </div>
    </main>
  );
}

export default AddFriends;
