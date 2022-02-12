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
  classType,
}) {
  const [buttonText, setButtonText] = useState(buttonReadyText);
  const handleFriendAction = () => {
    console.log(_id);
    setButtonText(buttonActiveText);
    friendAction(_id, index);
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
          <button className={`add-friends__${classType}-add-button`} onClick={handleFriendAction}>
            <img
              className={`add-friends__${classType}-add-icon`}
              src={buttonIcon}
              alt={buttonAlt}
            />
            <p className={`add-friends__${classType}-add-text`}>{buttonText}</p>
          </button>
          <button className={`add-friends__${classType}-add-button`} onClick={handleFriendAction}>
            <p className={`add-friends__${classType}-block-text`}>Block</p>
          </button>
        </div>
      </div>
    </div>
  );
}

export default FriendCard;
