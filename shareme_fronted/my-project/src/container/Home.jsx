import { useState, useRef, useEffect } from 'react';
import { HiMenu } from 'react-icons/hi';
import { AiFillCloseCircle } from 'react-icons/ai';
import { Link, Route, Routes } from 'react-router-dom';

import { Sidebar, UserProfile } from '../components';
import { userQuery } from '../utils/data';
import { client } from '../client';
import Pins from './Pins';
import logo from '../assets/logo.png';
import { fetchUser } from '../utils/fetchUser';

const Home = () => {
  const [toggleSidebar, setToggleSidebar] = useState(false);
  const [user, setUser] = useState();
  const scrollRef = useRef(null);

  const userInfo = fetchUser();

  useEffect(() => {
    if (!userInfo?._id) return;

    const query = userQuery(userInfo._id);

    client.fetch(query).then((data) => {
      setUser(data[0]);
    });
  }, [userInfo?._id]);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0);
  });

  return (
    <div className="app-shell">
      <div className="desktop-sidebar">
        <Sidebar />
      </div>

      <header className="mobile-topbar">
        <button type="button" className="icon-button" onClick={() => setToggleSidebar(true)} aria-label="Open menu">
          <HiMenu />
        </button>

        <Link to="/" className="mobile-brand">
          <img src={logo} alt="ShareMe" />
        </Link>

        {user?.image ? (
          <Link to={`/user-profile/${user._id}`} className="mobile-avatar-link">
            <img src={user.image} alt={user.userName || 'user'} className="user-avatar" />
          </Link>
        ) : (
          <span className="user-avatar user-avatar-empty" />
        )}
      </header>

      {toggleSidebar && (
        <div className="mobile-sidebar-panel">
          <button
            type="button"
            className="mobile-sidebar-backdrop"
            onClick={() => setToggleSidebar(false)}
            aria-label="Close menu"
          />
          <div className="mobile-sidebar-sheet">
            <button type="button" className="icon-button sidebar-close" onClick={() => setToggleSidebar(false)} aria-label="Close menu">
              <AiFillCloseCircle />
            </button>
            <Sidebar closeToggle={setToggleSidebar} />
          </div>
        </div>
      )}

      <main className="app-main" ref={scrollRef}>
        <Routes>
          <Route path="user-profile/:userId" element={<UserProfile />} />
          <Route path="category/:categoryId" element={<Pins user={user && user} />} />
          <Route path="*" element={<Pins user={user && user} />} />
        </Routes>
      </main>
    </div>
  );
};

export default Home;
