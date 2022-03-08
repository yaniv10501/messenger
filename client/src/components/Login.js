import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import handleKeyPress from '../utils/form';
import mainApi from '../utils/MainApi';
import useFormValidation from '../utils/useFormValidation';
import { fetchReducer, initialState, useThunkReducer } from '../utils/fetch';
import initChatWebSocket from '../utils/WebSockets';

function Login({
  loggedIn,
  setLoggedIn,
  setCurrentUser,
  setChatWebSocket,
  setIsInfoPopupOpen,
  setNotification,
  setNotificationsQueue,
}) {
  const navigate = useNavigate();
  const [state, thunkDispatch] = useThunkReducer(fetchReducer, initialState);
  const { values, handleChange, errors, isValid, resetForm, setValues, setIsValid } =
    useFormValidation();
  const { email = '', password = '' } = values;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!isValid) return;
    mainApi.signIn(thunkDispatch, email, password).then(() => {
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
          setLoggedIn(false);
        }
      });
    });
  };

  const handleKey = (event) => handleKeyPress(event, handleSubmit);

  const handleRegisterNavigate = () => navigate('/register');

  useEffect(() => {
    if (loggedIn) {
      navigate('/');
    }
  }, [loggedIn]);

  return (
    <main className="form-page">
      <h1 className="form-page__title">Welcome to the Messenger website</h1>

      <p className="form-page__subtitle">Please Log in</p>

      <div className="form-page__grid">
        <form className="form-page__form" name="login" onSubmit={handleSubmit} noValidate>
          <div className="form-page__input-container">
            <p className="form-page__input-title">Email:</p>

            <input
              type="email"
              name="email"
              className="form-page__input login__input_email"
              value={email}
              onChange={handleChange}
              onKeyPress={handleKey}
            />
          </div>

          <div className="form-page__input-container">
            <p className="form-page__input-title">Password:</p>

            <input
              type="password"
              name="password"
              className="form-page__input login__input_password"
              value={password}
              onChange={handleChange}
              onKeyPress={handleKey}
            />
          </div>

          <button type="submit" className="form-page__submit-button">
            Login &rarr;
          </button>
        </form>
      </div>

      <div className="form-page__navigate-container" onClick={handleRegisterNavigate}>
        <p className="form-page__navigate-text">Register</p>
      </div>

      <footer>
        <p>Powered by Yaniv</p>
      </footer>
    </main>
  );
}

export default Login;
