const handleKeyPress = (event ,handleSubmit) => {
  if (event.key.toLowerCase() === 'enter') handleSubmit(event);
};

export default handleKeyPress;
