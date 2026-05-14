import { Link, NavLink } from 'react-router-dom';
import { FiPlusSquare, FiSearch } from 'react-icons/fi';
import { IoHome } from 'react-icons/io5';
import {
  FaCarSide,
  FaCat,
  FaCamera,
  FaDog,
  FaDumbbell,
  FaGlobe,
  FaImage,
  FaLeaf,
  FaPalette,
  FaPlane,
  FaQuoteLeft,
  FaUtensils,
} from 'react-icons/fa';

import logo from '../assets/logo.png';
import { categories } from '../utils/data';

const categoryIcons = {
  cars: FaCarSide,
  fitness: FaDumbbell,
  wallpaper: FaImage,
  websites: FaGlobe,
  photo: FaCamera,
  food: FaUtensils,
  nature: FaLeaf,
  art: FaPalette,
  travel: FaPlane,
  quotes: FaQuoteLeft,
  cats: FaCat,
  dogs: FaDog,
};

const activeLink = 'sidebar-link sidebar-link-active';
const normalLink = 'sidebar-link';

const Sidebar = ({ closeToggle }) => {
  const handleCloseSidebar = () => {
    if (closeToggle) closeToggle(false);
  };

  return (
    <aside className="social-sidebar">
      <Link to="/" className="sidebar-brand" onClick={handleCloseSidebar}>
        <img src={logo} alt="ShareMe" />
      </Link>

      <nav className="sidebar-nav" aria-label="Primary">
        <NavLink
          to="/"
          end
          className={({ isActive }) => (isActive ? activeLink : normalLink)}
          onClick={handleCloseSidebar}
        >
          <span className="sidebar-link-icon">
            <IoHome />
          </span>
          Home
        </NavLink>

        <NavLink
          to="/search"
          className={({ isActive }) => (isActive ? activeLink : normalLink)}
          onClick={handleCloseSidebar}
        >
          <span className="sidebar-link-icon">
            <FiSearch />
          </span>
          Search
        </NavLink>

        <NavLink
          to="/create-pin"
          className={({ isActive }) => (isActive ? activeLink : normalLink)}
          onClick={handleCloseSidebar}
        >
          <span className="sidebar-link-icon">
            <FiPlusSquare />
          </span>
          Create
        </NavLink>
      </nav>

      <div className="sidebar-section">
        <h3 className="sidebar-section-title">Discover categories</h3>
        {categories.slice(0, categories.length - 1).map((category) => {
          const CategoryIcon = categoryIcons[category.name] || FaImage;

          return (
            <NavLink
              to={`/category/${category.name}`}
              className={({ isActive }) => (isActive ? activeLink : normalLink)}
              onClick={handleCloseSidebar}
              key={category.name}
            >
              <span className="sidebar-link-icon">
                <CategoryIcon />
              </span>
              <span className="capitalize">{category.name}</span>
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
