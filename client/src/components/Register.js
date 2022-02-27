import React, { useState } from 'react';
import useFormValidation from '../utils/useFormValidation';
import { yearsOptions, monthOptions, daysOption } from '../utils/birthday';
import { useNavigate } from 'react-router-dom';
import mainApi from '../utils/MainApi';
import { fetchReducer, initialState, useThunkReducer } from '../utils/fetch';
import Loading from './Loading';
import Preloader from './Preloader/Preloader';
import { testValid } from '../utils/regex';

function Register() {
  const navigate = useNavigate();
  const [state, thunkDispatch] = useThunkReducer(fetchReducer, initialState);
  const { loading, silentLoading } = state;
  const [isUserTakenLoading, setIsUserTakenLoading] = useState(false);
  const [isUserTaken, setIsUserTaken] = useState(false);
  const [isEmailTakenLoading, setIsEmailTakenLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [userNameTyping, setUserNameTyping] = useState({
    isTyping: false,
    timer: null,
  });
  const { values, handleChange, errors, isValid, resetForm, setValues, setIsValid } =
    useFormValidation();
  const {
    userName = '',
    firstName = '',
    lastName = '',
    gender,
    birthday,
    email = '',
    password = '',
  } = values;
  const {
    userName: userNameError,
    firstName: firstNameError,
    lastName: lastNameError,
    gender: genderError,
    birthday: birthdayError,
    email: emailError,
    password: passwordError,
  } = errors;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isValid) {
      console.log(values);
      mainApi
        .signUp(
          thunkDispatch,
          userName,
          firstName,
          lastName,
          gender,
          `${birthday.day}/${birthday.month < 10 ? '0' + birthday.month : birthday.month}/${
            birthday.year
          }`,
          email,
          password
        )
        .then((response) => {
          if (response instanceof Error) {
            console.log(response);
            return;
          }
          navigate('/login');
        });
    }
  };
  const togglePasswordShow = () => {
    const passwordShowButton = document.querySelector('[name=password]');

    setPasswordVisible(!passwordVisible);

    if (!passwordVisible) passwordShowButton.type = 'text';
    else passwordShowButton.type = 'password';
  };
  const checkUserTaken = (userNameValue) => {
    console.log(userNameValue);
    mainApi.checkUserTaken(thunkDispatch, userNameValue).then((response) => {
      console.log(response);
      const { isTaken } = response;
      setIsUserTakenLoading(false);
      if (isTaken) {
        setIsUserTaken(true);
      } else {
        setIsUserTaken(false);
      }
    });
  };
  const handleUserNameChange = (event) => {
    const userNameValue = event.target.value;
    if (userNameValue.length > 3 && testValid(userNameValue)) {
      if (!isUserTakenLoading) {
        setIsUserTakenLoading(true);
      }
      if (userNameTyping.isTyping) {
        clearTimeout(userNameTyping.timer);
        setUserNameTyping({
          isTyping: true,
          timer: setTimeout(() => {
            setUserNameTyping({
              isTyping: false,
              timer: null,
            });
            checkUserTaken(userNameValue);
          }, 1500),
        });
      } else {
        setUserNameTyping({
          isTyping: true,
          timer: setTimeout(() => {
            setUserNameTyping({
              isTyping: false,
              timer: null,
            });
            checkUserTaken(userNameValue);
          }, 1500),
        });
      }
    }

    handleChange(event);
  };
  const handleLoginNavigate = () => navigate('/login');
  return (
    <>
      <Loading isLoading={loading} />
      <main className={loading ? 'form-page form-page_hidden' : 'form-page'}>
        <h1 className="form-page__title">Welcome to the Messenger website</h1>

        <p className="form-page__subtitle">Please fill in your details</p>

        <div className="form-page__grid">
          <form
            name="register"
            className="form-page__form form-page__form_register"
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="form-page__input-row form-page__input-row_user">
              <div className="form-page__input-container form-page__input-container_user">
                <input
                  className="form-page__input"
                  type="text"
                  name="userName"
                  value={userName}
                  placeholder={'User name'}
                  minLength={4}
                  maxLength={30}
                  onChange={handleUserNameChange}
                  required
                />

                <span id="userName-error" className="form-page__error-input">
                  {userNameError}
                </span>
              </div>
              <div className="form-page__user-taken">
                {isUserTakenLoading ? (
                  <Preloader isLoading={isUserTakenLoading} />
                ) : isUserTaken ? (
                  <p className="form-page__user-taken-text form-page__user-taken-text_error">
                    This user name is taken
                  </p>
                ) : (
                  <p className="form-page__user-taken-text form-page__user-taken-text_ok">
                    {userName.length > 3 && testValid(userName) && 'This user name is available'}
                  </p>
                )}
              </div>
            </div>

            <div className="form-page__input-row">
              <div className="form-page__input-container form-page__input-container_register">
                <input
                  className="form-page__input"
                  type="text"
                  name="firstName"
                  value={firstName}
                  placeholder={'First Name'}
                  onChange={handleChange}
                  required
                />

                <span id="firstName-error" className="form-page__error-input">
                  {firstNameError}
                </span>
              </div>

              <div className="form-page__input-container form-page__input-container_register">
                <input
                  className="form-page__input"
                  type="text"
                  value={lastName}
                  name="lastName"
                  placeholder={'Last Name'}
                  onChange={handleChange}
                  required
                />

                <span id="lastName-error" className="form-page__error-input">
                  {lastNameError}
                </span>
              </div>
            </div>

            <div className="form-page__select-row">
              <div className="form-page__select-container">
                <p className="form-page__select-title">Gender</p>

                <input
                  type="radio"
                  name="gender"
                  aria-label="male"
                  onClick={handleChange}
                  required
                />

                <p className="form-page__select-gender">Male</p>

                <input
                  type="radio"
                  name="gender"
                  aria-label="female"
                  onClick={handleChange}
                  required
                />

                <p className="form-page__select-gender">Female</p>

                <span id="gender-error" className="form-page__error-input">
                  {genderError}
                </span>
              </div>

              <div className="form-page__select-container">
                <p className="form-page__select-title">Birthday</p>

                <select
                  className="form-page__select-input"
                  name="birthday"
                  aria-label="day"
                  onChange={handleChange}
                  required
                >
                  <option id="disabled" value="disabled">
                    -
                  </option>
                  {daysOption.map((day, index) => {
                    return (
                      <option value={day} key={index}>
                        {day}
                      </option>
                    );
                  })}
                </select>

                <select
                  className="form-page__select-input"
                  name="birthday"
                  aria-label="month"
                  onChange={handleChange}
                  required
                >
                  <option id="disabled" value="disabled">
                    -
                  </option>
                  {monthOptions.map((month, index) => {
                    return (
                      <option value={month} key={index}>
                        {month}
                      </option>
                    );
                  })}
                </select>

                <select
                  className="form-page__select-input"
                  name="birthday"
                  aria-label="year"
                  onChange={handleChange}
                  required
                >
                  <option id="disabled" value="disabled">
                    -
                  </option>
                  {yearsOptions.map((year, index) => {
                    return (
                      <option value={year} key={index}>
                        {year}
                      </option>
                    );
                  })}
                </select>

                <span id="birthday-error" className="form-page__error-input">
                  {birthdayError}
                </span>
              </div>
            </div>

            <input
              className="form-page__input form-page__input_email"
              placeholder={'Email'}
              type="email"
              name="email"
              value={email}
              onChange={handleChange}
              required
            />

            <span id="email-error" className="form-page__error-input">
              {emailError}
            </span>

            <div className="form-page__input-container form-page__input-container_password">
              <input
                className="form-page__input"
                name="password"
                type="password"
                placeholder={'New Password'}
                minLength="6"
                value={password}
                onChange={handleChange}
                required
              />

              <p className="form-page__show-password" onClick={togglePasswordShow}>
                Show
              </p>
            </div>

            <span id="password-error" className="form-page__error-input">
              {passwordError}
            </span>

            <button id="submitButton" type="submit" className="form-page__submit-button">
              Register
            </button>
          </form>
        </div>

        <div className="form-page__navigate-container" onClick={handleLoginNavigate}>
          <p className="form-page__navigate-text">Login</p>
        </div>

        <footer>
          <p>Powered by Yaniv</p>
        </footer>
      </main>
    </>
  );
}

export default Register;
