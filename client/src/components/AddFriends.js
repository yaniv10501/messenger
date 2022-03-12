import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchReducer, initialState, useThunkReducer } from '../utils/fetch';
import mainApi from '../utils/MainApi';
import addButton from '../images/add-button.svg';
import FriendCard from './FriendCard';
import Preloader from './Preloader/Preloader';

function AddFriends({ chatWebSocket, setNotification, setNotificationsQueue }) {
  const navigate = useNavigate();
  const friendsRef = useRef();
  const requestsRef = useRef();
  const pendingRef = useRef();
  const [state, thunkDispatch] = useThunkReducer(fetchReducer, initialState);
  const { silentLoading } = state;
  const [loadedAllFriends, setLoadedAllFriends] = useState(false);
  const [loadedAllRequests, setLoadedAllRequests] = useState(false);
  const [loadedAllPending, setLoadedAllPending] = useState(false);
  const [addFriendsList, setAddFriendsList] = useState([]);
  const [friendRequestsList, setFriendRequestsList] = useState([]);
  const [pendingFriendRequestsList, setPendingFriendRequestsList] = useState([]);
  const [userQuery, setUserQuery] = useState('');
  const handleBack = () => navigate('/');
  const handleAddFriend = (friendId, index, image, requestResponse) =>
    mainApi.addFriend(thunkDispatch, friendId, index, requestResponse).then((response) => {
      const newAddFriendsList = addFriendsList.filter((friend) => friend._id !== friendId);
      if ((!image && response.image === 'Uploaded') || image === 'Uploaded') {
        mainApi
          .getFriendImage(
            thunkDispatch,
            { _id: friendId, image: 'Uploaded' },
            {
              listType: 'friendRequests',
            }
          )
          .then((data) => {
            setFriendRequestsList([
              {
                ...response,
                image: data.image,
              },
              ...pendingFriendRequestsList,
            ]);
          });
      }
      if (image && image !== 'Uploaded') {
        setFriendRequestsList([
          {
            ...response,
            image,
          },
          ...pendingFriendRequestsList,
        ]);
      } else {
        setFriendRequestsList([response, ...friendRequestsList]);
      }
      setAddFriendsList(newAddFriendsList);
    });
  const handleAcceptRequest = (requestId, index, image, requestResponse) =>
    mainApi
      .responseFriendRequest(thunkDispatch, requestId, index, requestResponse)
      .then((response) => {
        const newPendingFriendsList = pendingFriendRequestsList.filter(
          (friend) => friend._id !== requestId
        );
        setPendingFriendRequestsList(newPendingFriendsList);
      });
  const handleFriendsScroll = (event) => {
    if (!loadedAllFriends) {
      if (!silentLoading) {
        const {
          target: { scrollTop, clientHeight },
        } = event;
        const {
          current: { offsetTop },
        } = friendsRef;
        console.log(scrollTop, offsetTop, clientHeight);
        if (offsetTop - (scrollTop + clientHeight) < 120) {
          console.log('Time to load more!');
          mainApi.getMoreMoreFriends(thunkDispatch, addFriendsList.length).then((moreFriends) => {
            setAddFriendsList([...addFriendsList, ...moreFriends.data]);
            setLoadedAllFriends(moreFriends.loadedAll);
          });
        }
      }
    }
  };
  const handleRequestsScroll = (event) => {
    if (!loadedAllRequests) {
      if (!silentLoading) {
        const {
          target: { scrollTop, offsetHeight },
        } = event;
        const {
          current: { offsetTop },
        } = requestsRef;
        console.log(offsetTop, offsetHeight);
        if (offsetTop - (scrollTop + offsetHeight) < 180) {
          console.log('Time to load more!');
          mainApi
            .getMoreFriendsRequests(thunkDispatch, friendRequestsList.length)
            .then((moreRequests) => {
              setFriendRequestsList([...friendRequestsList, ...moreRequests.data]);
              setLoadedAllRequests(moreRequests.loadedAll);
            });
        }
      }
    }
  };
  const handlePendingScroll = (event) => {
    if (!loadedAllPending) {
      if (!silentLoading) {
        const {
          target: { scrollTop, offsetHeight },
        } = event;
        const {
          current: { offsetTop },
        } = pendingRef;
        console.log(offsetTop, offsetHeight);
        if (offsetTop - (scrollTop + offsetHeight) < 180) {
          console.log('Time to load more!');
          mainApi.getMoreChats(thunkDispatch).then((morePending) => {
            setPendingFriendRequestsList([...pendingFriendRequestsList, ...morePending.data]);
            setLoadedAllPending(morePending.loadedAll);
          });
        }
      }
    }
  };
  const handleSearchChange = (event) => {
    setUserQuery(event.target.value);
  };
  const handleUserSearch = () => {
    console.log(userQuery);
    mainApi.findOtherUsers(thunkDispatch, userQuery).then(({ loadedAll, moreFriendsList }) => {
      setAddFriendsList(moreFriendsList);
      setLoadedAllFriends(loadedAll);
    });
  };
  useEffect(() => {
    mainApi.deleteNotificationType(thunkDispatch, 'friend').then((notifications) => {
      setNotificationsQueue(notifications);
      setNotification(notifications[0] || {});
    });
    mainApi.getAddFriends(thunkDispatch).then((response) => {
      console.log(response);
      const { moreFriends, friendRequests, pendingFriendRequests } = response;
      setAddFriendsList(moreFriends.data);
      setLoadedAllFriends(moreFriends.loadedAll);
      setFriendRequestsList(friendRequests.data);
      setLoadedAllRequests(friendRequests.loadedAll);
      setPendingFriendRequestsList(pendingFriendRequests.data);
      setLoadedAllPending(pendingFriendRequests.loadedAll);
    });
  }, []);
  useEffect(() => {
    if (chatWebSocket) {
      chatWebSocket.onmessage = (wsMessage) => {
        const { message, data } = JSON.parse(wsMessage.data);
        if (message === 'Friend request') {
          const otherUser = addFriendsList.find((friend) => friend._id === data._id);
          const newAddFriendsList = addFriendsList.filter((friend) => friend._id !== data._id);
          if ((!otherUser.image && data.image === 'Uploaded') || otherUser.image === 'Uploaded') {
            mainApi
              .getFriendImage(thunkDispatch, data, {
                listType: 'pendingRequests',
              })
              .then((data) => {
                setPendingFriendRequestsList([data, ...pendingFriendRequestsList]);
              });
          }
          if (otherUser.image && otherUser.image !== 'Uploaded') {
            setPendingFriendRequestsList([
              {
                ...data,
                image: otherUser.image,
              },
              ...pendingFriendRequestsList,
            ]);
          } else {
            setPendingFriendRequestsList([data, ...pendingFriendRequestsList]);
          }
          setAddFriendsList(newAddFriendsList);
        }
        if (message === 'Friend accept') {
          const newFriendRequestsList = friendRequestsList.filter(
            ({ _id: requestId }) => requestId !== data._id
          );
          setFriendRequestsList(newFriendRequestsList);
        }
      };
    }
  }, [chatWebSocket, friendRequestsList, pendingFriendRequestsList, addFriendsList]);
  return (
    <main className="add-friends">
      <div className="add-friends__back-button" onClick={handleBack}>
        <p className="add-friends__back-title">Back</p>
      </div>
      <div className="add-friends__friends">
        <div className="add-friends__more-friends">
          <h2 className="add-friends__more-title">Add Friends</h2>
          <div
            className="add-friends__more-friends-container no-scroll-bar"
            onScroll={handleFriendsScroll}
          >
            <input type="text" onChange={handleSearchChange}></input>
            <button type="button" onClick={handleUserSearch}>
              Search
            </button>
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
                  buttonAltReadyText="Block"
                  buttonAltActiveText="Blocked"
                  classType="more"
                />
              ))}
            <div
              className="chats__preloader"
              ref={friendsRef}
              style={{
                position: 'relative',
                width: '100%',
                minHeight: '70px',
              }}
            >
              <Preloader isLoading={!loadedAllFriends} />
            </div>
          </div>
        </div>
        <div className="add-friends__friend-requests">
          <h2 className="add-friends__requests-title">Friend Requests</h2>
          <div
            className="add-friends__friend-requests-container no-scroll-bar"
            onScroll={handleRequestsScroll}
          >
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
                  buttonAltReadyText="Block"
                  buttonAltActiveText="Blocked"
                  classType="request"
                />
              ))}
            <div
              className="chats__preloader"
              ref={requestsRef}
              style={{
                position: 'relative',
                width: '100%',
                minHeight: '70px',
              }}
            >
              <Preloader isLoading={!loadedAllRequests} />
            </div>
          </div>
        </div>
        <div className="add-friends__pending">
          <h2 className="add-friends__pending-title">Pending Requests</h2>
          <div
            className="add-friends__pending-container no-scroll-bar"
            onScroll={handlePendingScroll}
          >
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
                  buttonAltReadyText="Decline"
                  buttonAltActiveText="Declined"
                  classType="pending"
                />
              ))}
            <div
              className="chats__preloader"
              ref={pendingRef}
              style={{
                position: 'relative',
                width: '100%',
                minHeight: '70px',
              }}
            >
              <Preloader isLoading={!loadedAllPending} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default AddFriends;
