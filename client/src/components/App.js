import React, { useEffect, useRef, useState } from 'react';
import {
  Route,
  Routes,
  Navigate,
  useLocation,
  useNavigationType,
  useNavigate,
} from 'react-router-dom';
import Main from './Main';
import Login from './Login';
import Chats from './Chats';
import ProtectedRoute from './ProtectedRoute';
import Register from './Register';
import CurrentUserContext from '../contexts/CurrentUserContext';
import mainApi from '../utils/MainApi';
import { fetchReducer, initialState, useThunkReducer } from '../utils/fetch';
import initChatWebSocket from '../utils/WebSockets';
import Loading from './Loading';
import AddFriends from './AddFriends';
import UserSettings from './UserSettings';
import PopupInfo from './PopupInfo';
import Menu from './Menu';
import animateMenu from '../utils/animateMenu';

function App() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const navigate = useNavigate();
  const [state, thunkDispatch] = useThunkReducer(fetchReducer, initialState);
  const menuRef = useRef();
  const [pageLoading, setPageLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState({});
  const [chatWebSocket, setChatWebSocket] = useState({});
  const [currentChat, setCurrentChat] = useState({});
  const [isComposePopupOpen, setIsComposePopupOpen] = useState(false);
  const [isNewGroupPopupOpen, setIsNewGroupPopupOpen] = useState(false);
  const [isGroupSettingsPopupOpen, setIsGroupSettingsPopupOpen] = useState(false);
  const [isChatSettingsPopupOpen, setIsChatSettingsPopupOpen] = useState(false);
  const [isInfoPopupOpen, setIsInfoPopupOpen] = useState(false);
  const [notification, setNotification] = useState({});
  const [notificationsQueue, setNotificationsQueue] = useState([]);
  const closeAllPopups = () => {
    setIsComposePopupOpen(false);
    setIsInfoPopupOpen(false);
    setIsNewGroupPopupOpen(false);
    setIsChatSettingsPopupOpen(false);
    setIsGroupSettingsPopupOpen(false);
  };
  const openChat = (chatId) => {
    setCurrentChat({
      _id: chatId,
    });
  };
  const handleLogout = () => {
    mainApi
      .signOut(thunkDispatch)
      .then(() => {
        setCurrentUser({});
        chatWebSocket.close();
        setLoggedIn(false);
        navigate('/login');
      })
      .catch((error) => console.log(error));
  };
  useEffect(() => {
    if (location.pathname === '/register') {
      setPageLoading(false);
    }
    if (location.pathname === '/login') {
      if (navigationType === 'REPLACE' || navigationType === 'POP') {
        mainApi.getUserMe(thunkDispatch).then((response) => {
          if (response.user) {
            const { user, notifications } = response;
            const dontDisturb = user.dontDisturb.some((value) => value === 'profile');
            if (!user.image && !dontDisturb) {
              setIsInfoPopupOpen(true);
            }
            setCurrentUser(user);
            if (notifications.length > 0) {
              setNotification(notifications[0]);
              setNotificationsQueue(notifications);
            }
            setChatWebSocket(initChatWebSocket());
            setLoggedIn(true);
            navigate('/');
          } else {
            setPageLoading(false);
            setLoggedIn(false);
          }
        });
      }
    }
    if (location.pathname === '/') {
      const { email } = currentUser;
      const { binaryType } = chatWebSocket;
      if (email && binaryType) {
        setPageLoading(false);
      }
    }
  }, [location]);
  useEffect(() => {
    if (chatWebSocket && location.pathname === '/') {
      chatWebSocket.onmessage = (wsMessage) => {
        const { message, data } = JSON.parse(wsMessage.data);
        console.log(data);
        if (location.pathname !== '/chats') {
          if (message === 'New message') {
            const friend = data.user;
            mainApi
              .getFriendImage(
                thunkDispatch,
                { ...friend, _id: data.chatId },
                {
                  listType: 'messageNotif',
                }
              )
              .then((friendWithImage) => {
                console.log(friendWithImage);
                setNotification({
                  type: 'New message',
                  ...data,
                  user: friendWithImage,
                });
                setNotificationsQueue([
                  {
                    type: 'New message',
                    ...data,
                    user: friendWithImage,
                  },
                  ...notificationsQueue,
                ]);
                animateMenu(menuRef.current);
              });
          }
        }
        if (location.pathname !== '/addfriends') {
          if (message === 'Friend request') {
            mainApi
              .getFriendImage(thunkDispatch, data, {
                listType: 'pendingRequests',
              })
              .then((friendWithImage) => {
                console.log(friendWithImage);
                setNotification({
                  type: 'Friend request',
                  user: friendWithImage,
                });
                setNotificationsQueue([
                  {
                    type: 'Friend request',
                    user: friendWithImage,
                  },
                  ...notificationsQueue,
                ]);
                animateMenu(menuRef.current);
              });
          }
          if (message === 'Friend accept') {
            mainApi
              .getFriendImage(thunkDispatch, data, {
                listType: 'friends',
              })
              .then((friendWithImage) => {
                console.log(friendWithImage);
                setNotification({
                  type: 'Friend accept',
                  user: friendWithImage,
                });
                setNotificationsQueue([
                  {
                    type: 'Friend accept',
                    user: friendWithImage,
                  },
                  ...notificationsQueue,
                ]);
                animateMenu(menuRef.current);
              });
          }
        }
      };
    }
  }, [location, chatWebSocket, notificationsQueue]);
  return (
    <>
      <Loading isLoading={pageLoading} />
      <div className={pageLoading ? 'page page_hidden' : 'page'}>
        <CurrentUserContext.Provider value={currentUser}>
          <Menu
            loggedIn={loggedIn}
            openChat={openChat}
            menuRef={menuRef}
            notification={notification}
            setNotification={setNotification}
            notificationsQueue={notificationsQueue}
            setNotificationsQueue={setNotificationsQueue}
          />
          <Routes>
            <Route path="/loading" element={<Loading />} />
            <Route
              path="/login"
              element={
                <Login
                  loggedIn={loggedIn}
                  setLoggedIn={setLoggedIn}
                  setCurrentUser={setCurrentUser}
                  setChatWebSocket={setChatWebSocket}
                  setIsInfoPopupOpen={setIsInfoPopupOpen}
                  setNotification={setNotification}
                  setNotificationsQueue={setNotificationsQueue}
                />
              }
            />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <ProtectedRoute loggedIn={loggedIn}>
                  <Main handleLogout={handleLogout} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chats"
              element={
                <ProtectedRoute loggedIn={loggedIn}>
                  <Chats
                    chatWebSocket={chatWebSocket}
                    currentChat={currentChat}
                    setCurrentChat={setCurrentChat}
                    isComposePopupOpen={isComposePopupOpen}
                    setIsComposePopupOpen={setIsComposePopupOpen}
                    isNewGroupPopupOpen={isNewGroupPopupOpen}
                    setIsNewGroupPopupOpen={setIsNewGroupPopupOpen}
                    isChatSettingsPopupOpen={isChatSettingsPopupOpen}
                    setIsChatSettingsPopupOpen={setIsChatSettingsPopupOpen}
                    isGroupSettingsPopupOpen={isGroupSettingsPopupOpen}
                    setIsGroupSettingsPopupOpen={setIsGroupSettingsPopupOpen}
                    closeAllPopups={closeAllPopups}
                    setNotification={setNotification}
                    setNotificationsQueue={setNotificationsQueue}
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/addfriends"
              element={
                <ProtectedRoute loggedIn={loggedIn}>
                  <AddFriends
                    chatWebSocket={chatWebSocket}
                    setNotification={setNotification}
                    setNotificationsQueue={setNotificationsQueue}
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute loggedIn={loggedIn}>
                  <UserSettings setCurrentUser={setCurrentUser} />
                </ProtectedRoute>
              }
            />
          </Routes>
          <PopupInfo
            name="notif"
            popupTitle="Update your profile"
            notification={notification}
            notificationsQueue={notificationsQueue}
            isNotifPopupOpen={isInfoPopupOpen}
            handleClose={closeAllPopups}
          />
        </CurrentUserContext.Provider>
      </div>
    </>
  );
}

export default App;
