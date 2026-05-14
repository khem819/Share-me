import Masonry from 'react-masonry-css';
import Pin from './Pin';

const breakpointColumnsObj = {
  default: 4,
  3000: 6,
  2000: 5,
  1200: 3,
  1000: 2,
  500: 1,
};

const MasonryLayout = ({ pins, user }) => (
  <Masonry className="masonry-grid" columnClassName="masonry-column" breakpointCols={breakpointColumnsObj}>
    {pins?.map((pin) => <Pin key={pin._id} pin={pin} user={user} />)}
  </Masonry>
);

export default MasonryLayout;
