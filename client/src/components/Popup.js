import React from 'react';
import PropTypes from 'prop-types';

function Popup({
  handleClose,
  isOpen,
  name,
  children,
}) {
  const handleClick = (event) => {
    if (event.target.className.includes('popup_opened')) {
      handleClose();
    }
  };
  // const handleLinkClick = (event) => {
  //   event.preventDefault();
  //   handleClose();
  //   setTimeout(() => {
  //     setLinkPopupOpen(true);
  //   }, 350);
  // };
  // const mobileQuery = useMediaQuery({ query: '(max-width: 495px)' });
  // useEffect(() => {
  //   lockScreen(isOpen, headerRef);
  // }, [isOpen]);
  // useEffect(() => {
  //   const headerElement = headerRef.current;
  //   if (!mobileQuery) {
  //     headerElement.style.visibility = 'visible';
  //   }
  //   if (mobileQuery && isOpen) {
  //     headerElement.style.visibility = 'hidden';
  //   }
  // }, [mobileQuery, isOpen]);
  return (
    <div
      onClick={handleClick}
      className={isOpen ? `popup popup_type_${name} popup_opened` : `popup popup_type_${name}`}
    >{children}</div>
  );
}

Popup.propTypes = {
  handleClose: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  name: PropTypes.string.isRequired,
  popupTitle: PropTypes.string.isRequired,
  popupBottomLink: PropTypes.string.isRequired,
  setLinkPopupOpen: PropTypes.func.isRequired,
  headerRef: PropTypes.instanceOf(Object).isRequired,
  children: PropTypes.instanceOf(Object),
};

Popup.defaultProps = {
  children: [],
};

export default Popup;
