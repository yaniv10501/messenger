import React, { useState } from 'react';
import noProfile from '../images/no-profile.png';

function FriendCard({
  _id,
  image,
  firstName,
  lastName,
  index,
  friendAction,
  buttonIcon,
  buttonAlt,
  buttonReadyText,
  buttonActiveText,
  buttonAltReadyText,
  buttonAltActiveText,
  classType,
}) {
  const [buttonText, setButtonText] = useState(buttonReadyText);
  const [buttonAltText, setButtonAltText] = useState(buttonAltReadyText);
  const handleFriendAction = (response) => {
    if (response === true) {
      setButtonText(buttonActiveText);
    } else {
      setButtonAltText(buttonAltActiveText);
    }
    friendAction(_id, index, image, response);
  };
  return (
    <div className={`add-friends__${classType}-friend-container`} key={_id}>
      <img
        className={`add-friends__${classType}-friend-image`}
        src={image ? image : noProfile}
        alt="User avater"
      />
      <div className={`add-friends__${classType}-action-container`}>
        <h2 className={`add-friends__${classType}-friend-name`}>
          {firstName} {lastName}
        </h2>
        <div className={`add-friends__${classType}-buttons-container`}>
          <button
            className={`add-friends__${classType}-add-button`}
            onClick={() => handleFriendAction(true)}
          >
            <img
              className={`add-friends__${classType}-add-icon`}
              src={buttonIcon}
              alt={buttonAlt}
            />
            <p className={`add-friends__${classType}-add-text`}>{buttonText}</p>
          </button>
          <button
            className={`add-friends__${classType}-add-button`}
            onClick={() => handleFriendAction(false)}
          >
            <p className={`add-friends__${classType}-block-text`}>{buttonAltText}</p>
          </button>
        </div>
      </div>
    </div>
  );
}

export default FriendCard;
