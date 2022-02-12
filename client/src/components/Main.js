import React from 'react';
import { useNavigate } from 'react-router-dom';

function Main({ handleLogout }) {
  const navigate = useNavigate();
  const handleChatsNavigate = () => navigate('/chats');
  const handleAddFriendsNavigate = () => navigate('/addfriends');
  const handleSettingsNavigate = () => navigate('/settings');
  return (
    <main className="main">
      <h1 className="main__title">Welcome to the Messenger website</h1>

      <p className="main__subtitle">Get started by choosing section</p>

      <div className="main__container">
        <div className="main__link" onClick={handleChatsNavigate}>
          <h2 className="main__link-title">Messages &rarr;</h2>
          <p className="main__link-subtitle">Chats and messages</p>
        </div>

        <div className="main__link">
          <h2 className="main__link-title">Feed (in dev) &rarr;</h2>
          <p className="main__link-subtitle">To be</p>
        </div>

        <div className="main__link" onClick={handleAddFriendsNavigate}>
          <h2 className="main__link-title">Friends &rarr;</h2>
          <p className="main__link-subtitle">Add friends</p>
        </div>

        <div className="main__link" onClick={handleSettingsNavigate}>
          <h2 className="main__link-title">Settings &rarr;</h2>
          <p className="main__link-subtitle">User settings</p>
        </div>

        <div className="main__link" onClick={handleLogout}>
          <h2 className="main__link-title">Logout &rarr;</h2>
          <p className="main__link-subtitle">Logout</p>
        </div>
      </div>

      <footer>
        <p>Powered by Yaniv</p>
      </footer>
    </main>
  );
}

export default Main;
