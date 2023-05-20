import React from "react";

const Feed = ({ onLogout }) => {
  return (
    <div className="feed-page">
      <header>
        <h2>Welcome to the Social Network Feed!</h2>
        <button onClick={onLogout}>Logout</button>
      </header>
      <div className="feed">
        {/* Render your feed items here */}
        <div className="feed-item">
          <div className="user-info">
            <img src="user-avatar.png" alt="User Avatar" />
            <h3>John Doe</h3>
          </div>
          <p>This is a feed item.</p>
        </div>
        <div className="feed-item">
          <div className="user-info">
            <img src="user-avatar.png" alt="User Avatar" />
            <h3>Jane Smith</h3>
          </div>
          <p>This is another feed item.</p>
        </div>
      </div>
    </div>
  );
};

export default Feed;
