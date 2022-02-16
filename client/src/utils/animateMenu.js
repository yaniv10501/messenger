const animateMenu = (menu) => {
  menu.animate(
    [
      {
        top: '-75px',
      },
      {
        top: '-95px',
      },
    ],
    {
      duration: 900,
      easing: 'cubic-bezier(.18,-0.7,.29,1.18)',
    }
  );
};

export default animateMenu;
