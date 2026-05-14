import { Link } from 'react-router-dom';
import { IoMdAdd, IoMdSearch } from 'react-icons/io';

const Navbar = ({ user }) => {
  if (user) {
    return (
      <div className="top-composer">
        <div>
          <p className="eyebrow">Today on ShareMe</p>
          <h1>Discover what people are sharing</h1>
        </div>

        <div className="top-actions">
          <Link to="/search" className="search-icon-button" aria-label="Search">
            <IoMdSearch />
          </Link>

          <Link to={`user-profile/${user?._id}`} className="profile-pill">
            <img src={user.image} alt={user.userName || 'user'} />
            <span>{user.userName}</span>
          </Link>

          <Link to="/create-pin" className="create-button" aria-label="Create post">
            <IoMdAdd />
          </Link>
        </div>
      </div>
    );
  }

  return null;
};

export default Navbar;
