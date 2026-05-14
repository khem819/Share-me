import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';

import { Navbar, Feed, PinDetail, CreatePin, Search } from '../components';

const Pins = ({ user }) => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="content-shell">
      <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} user={user && user} />
      <Routes>
        <Route path="/" element={<Feed user={user && user} />} />
        <Route path="/category/:categoryId" element={<Feed user={user && user} />} />
        <Route path="/pin-detail/:pinId" element={<PinDetail user={user && user} />} />
        <Route path="/create-pin" element={<CreatePin user={user && user} />} />
        <Route path="/search" element={<Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} user={user && user} />} />
      </Routes>
    </div>
  );
};

export default Pins;
