import React, { useState } from 'react';
import useFormValidation from '../utils/useFormValidation';
import { yearsOptions, monthOptions, daysOption } from '../utils/birthday';
import { useNavigate } from 'react-router-dom';
import mainApi from '../utils/MainApi';
import { fetchReducer, initialState, useThunkReducer } from '../utils/fetch';
import Loading from './Loading';

function Register() {
  const navigate = useNavigate();
  const [state, thunkDispatch] = useThunkReducer(fetchReducer, initialState);
  const { silentLoading } = state;
  const [passwordVisible, setPasswordVisible] = useState(false);
  const { values, handleChange, errors, isValid, resetForm, setValues, setIsValid } =
    useFormValidation();
  const { firstName = '', lastName = '', gender, birthday, email = '', password = '' } = values;
  const {
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
      mainApi
        .signUp(
          thunkDispatch,
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
  const handleLoginNavigate = () => navigate('/login');
  return (
    <>
      <Loading isLoading={silentLoading} />
      <main className={silentLoading ? 'form-page form-page_hidden' : "form-page"}>
        <h1 className="form-page__title">Welcome to the Messenger website</h1>

        <p className="form-page__subtitle">Please fill in your details</p>

        <div className="form-page__grid">
          <form
            name="register"
            className="form-page__form form-page__form_register"
            onSubmit={handleSubmit}
            noValidate
          >
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
