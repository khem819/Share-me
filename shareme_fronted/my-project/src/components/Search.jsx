import { useEffect, useState } from 'react';
import { IoMdSearch } from 'react-icons/io';

import MasonryLayout from './MasonryLayout';
import { client } from '../client';
import { feedQuery, searchQuery } from '../utils/data';
import Spinner from './Spinner';

const Search = ({ searchTerm, setSearchTerm, user }) => {
  const queryKey = searchTerm || 'feed';
  const [searchState, setSearchState] = useState({ queryKey: '', pins: [] });
  const loading = searchState.queryKey !== queryKey;
  const pins = searchState.pins;

  useEffect(() => {
    let ignore = false;
    const updatePins = (data) => {
      if (!ignore) setSearchState({ queryKey, pins: data || [] });
    };

    if (searchTerm !== '') {
      const query = searchQuery(searchTerm.toLowerCase());
      client.fetch(query).then(updatePins);
    } else {
      client.fetch(feedQuery).then(updatePins);
    }

    return () => {
      ignore = true;
    };
  }, [queryKey, searchTerm]);

  return (
    <section className="feed-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Search</p>
          <h2>{searchTerm ? `Results for "${searchTerm}"` : 'Explore everything'}</h2>
        </div>
        <span>{pins.length} posts</span>
      </div>
      <label className="search-page-box" htmlFor="search-page-input">
        <IoMdSearch />
        <input
          id="search-page-input"
          type="text"
          value={searchTerm}
          placeholder="Search posts, captions, categories"
          onChange={(event) => setSearchTerm(event.target.value)}
          autoFocus
        />
      </label>
      {loading && <Spinner message="Searching pins" />}
      {pins?.length !== 0 && <MasonryLayout pins={pins} user={user} />}
      {pins?.length === 0 && searchTerm !== '' && !loading && (
        <p className="empty-state">No posts matched your search.</p>
      )}
    </section>
  );
};

export default Search;
