import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { client } from '../client';
import { categoryFeedQuery, feedQuery } from '../utils/data';
import MasonryLayout from './MasonryLayout';
import Spinner from './Spinner';

const Feed = ({ user }) => {
  const { categoryId } = useParams();
  const queryKey = categoryId || 'feed';
  const [feedState, setFeedState] = useState({ queryKey: '', pins: [] });
  const loading = feedState.queryKey !== queryKey;
  const ideaName = categoryId || 'new';

  useEffect(() => {
    let ignore = false;
    const query = categoryId ? categoryFeedQuery(categoryId) : feedQuery;

    client
      .fetch(query)
      .then((data) => {
        if (!ignore) setFeedState({ queryKey, pins: data || [] });
      })
      .catch((error) => {
        console.error('Failed to load feed', error);
        if (!ignore) setFeedState({ queryKey, pins: [] });
      });

    return () => {
      ignore = true;
    };
  }, [categoryId, queryKey]);

  if (loading) {
    return <Spinner message={`We are adding ${ideaName} ideas to your feed!`} />;
  }

  return (
    <section className="feed-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{categoryId ? 'Category feed' : 'Fresh posts'}</p>
          <h2>{categoryId || 'For you'}</h2>
        </div>
        <span>{feedState.pins.length} posts</span>
      </div>
      <MasonryLayout pins={feedState.pins} user={user} />
      {feedState.pins.length === 0 && <p className="empty-state">No posts found yet.</p>}
    </section>
  );
};

export default Feed;
