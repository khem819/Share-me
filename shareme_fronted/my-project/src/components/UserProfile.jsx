import { useEffect, useState } from 'react';
import { AiOutlineLogout } from 'react-icons/ai';
import { useParams, useNavigate } from 'react-router-dom';

import { userCreatedPinsQuery, userQuery, userSavedPinsQuery } from '../utils/data';
import { client } from '../client';
import MasonryLayout from './MasonryLayout';
import Spinner from './Spinner';

const UserProfile = () => {
  const [user, setUser] = useState();
  const [pins, setPins] = useState();
  const [text, setText] = useState('Created');
  const [activeBtn, setActiveBtn] = useState('created');
  const navigate = useNavigate();
  const { userId } = useParams();

  const loggedInUser = localStorage.getItem('user') !== 'undefined' ? JSON.parse(localStorage.getItem('user')) : null;

  useEffect(() => {
    const query = userQuery(userId);
    client.fetch(query).then((data) => {
      setUser(data[0]);
    });
  }, [userId]);

  useEffect(() => {
    if (text === 'Created') {
      const createdPinsQuery = userCreatedPinsQuery(userId);

      client.fetch(createdPinsQuery).then((data) => {
        setPins(data);
      });
    } else {
      const savedPinsQuery = userSavedPinsQuery(userId);

      client.fetch(savedPinsQuery).then((data) => {
        setPins(data);
      });
    }
  }, [text, userId]);

  const logout = () => {
    localStorage.clear();

    navigate('/login');
  };

  if (!user) return <Spinner message="Loading profile" />;

  return (
    <section className="profile-page">
      <div className="profile-card">
        <div className="profile-cover">
          <img
            src="https://source.unsplash.com/1600x900/?nature,photography,technology"
            alt="profile cover"
          />
          {userId === loggedInUser?._id && (
            <button
              type="button"
              className="icon-button profile-logout"
              onClick={logout}
              aria-label="Log out"
            >
              <AiOutlineLogout />
            </button>
          )}
        </div>

        <div className="profile-info">
          <img
            className="profile-avatar"
            src={user.image}
            alt={user.userName || 'user'}
          />
          <div>
            <h1>{user.userName}</h1>
            <p>{pins?.length || 0} posts in this view</p>
          </div>
        </div>

        <div className="profile-tabs">
          <button
            type="button"
            onClick={(e) => {
              setText(e.target.textContent);
              setActiveBtn('created');
            }}
            className={activeBtn === 'created' ? 'tab-button tab-button-active' : 'tab-button'}
          >
            Created
          </button>
          <button
            type="button"
            onClick={(e) => {
              setText(e.target.textContent);
              setActiveBtn('saved');
            }}
            className={activeBtn === 'saved' ? 'tab-button tab-button-active' : 'tab-button'}
          >
            Saved
          </button>
        </div>
      </div>

      <MasonryLayout pins={pins} user={loggedInUser} />

      {pins?.length === 0 && (
        <p className="empty-state">No posts found.</p>
      )}
    </section>
  );
};

export default UserProfile;
