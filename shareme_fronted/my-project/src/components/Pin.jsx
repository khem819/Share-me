import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { FiBookmark, FiDownload, FiExternalLink, FiHeart, FiMessageCircle } from 'react-icons/fi';
import { v4 as uuidv4 } from 'uuid';

import { client } from '../client';

const formatDate = (date) => {
  if (!date) return '';

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
};

const Pin = ({ pin, user }) => {
  const [localPin, setLocalPin] = useState(pin);
  const [saving, setSaving] = useState(false);

  const saves = useMemo(() => localPin.save || [], [localPin.save]);
  const alreadySaved = useMemo(
    () => saves.find((item) => item?.postedBy?._id === user?._id || item?.userId === user?._id),
    [saves, user?._id],
  );
  const saveCount = saves.length;
  const commentCount = localPin.comments?.length || 0;

  if (!pin?.image?.asset?.url) return null;

  const toggleSave = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!user?._id || saving) return;

    setSaving(true);

    if (alreadySaved?._key) {
      client
        .patch(localPin._id)
        .unset([`save[_key=="${alreadySaved._key}"]`])
        .commit()
        .then(() => {
          setLocalPin((current) => ({
            ...current,
            save: (current.save || []).filter((item) => item._key !== alreadySaved._key),
          }));
        })
        .finally(() => setSaving(false));
      return;
    }

    const newSave = {
      _key: uuidv4(),
      _type: 'save',
      userId: user._id,
      postedBy: {
        _type: 'postedBy',
        _ref: user._id,
      },
    };

    client
      .patch(localPin._id)
      .setIfMissing({ save: [] })
      .insert('after', 'save[-1]', [newSave])
      .commit()
      .then(() => {
        setLocalPin((current) => ({
          ...current,
          save: [
            ...(current.save || []),
            {
              ...newSave,
              postedBy: {
                _id: user._id,
                userName: user.userName,
                image: user.image,
              },
            },
          ],
        }));
      })
      .finally(() => setSaving(false));
  };

  return (
    <article className="pin-card">
      <Link to={`/pin-detail/${pin._id}`} className="pin-media">
        <img src={pin.image.asset.url} alt={pin.title || 'pin'} loading="lazy" />
        <div className="pin-hover-actions">
          <button
            type="button"
            className={alreadySaved ? 'pin-action pin-action-active' : 'pin-action'}
            onClick={toggleSave}
            disabled={!user || saving}
            aria-label={alreadySaved ? 'Remove saved post' : 'Save post'}
          >
            <FiBookmark />
          </button>
          <a
            className="pin-action"
            href={`${pin.image.asset.url}?dl=`}
            download
            onClick={(event) => event.stopPropagation()}
            aria-label="Download image"
          >
            <FiDownload />
          </a>
        </div>
      </Link>

      <div className="pin-content">
        <div className="pin-meta-row">
          {pin.category && <span className="pin-chip">{pin.category}</span>}
          {pin._createdAt && <span className="pin-date">{formatDate(pin._createdAt)}</span>}
        </div>
        {pin.title && <h2><Link to={`/pin-detail/${pin._id}`}>{pin.title}</Link></h2>}
        {pin.about && <p>{pin.about}</p>}

        <div className="pin-metrics">
          <button
            type="button"
            className={alreadySaved ? 'metric-button metric-button-active' : 'metric-button'}
            onClick={toggleSave}
            disabled={!user || saving}
            aria-label={alreadySaved ? 'Unsave post' : 'Save post'}
          >
            <FiHeart /> {saveCount}
          </button>
          <Link to={`/pin-detail/${pin._id}`}><FiMessageCircle /> {commentCount}</Link>
          {pin.destination && (
            <a href={pin.destination} target="_blank" rel="noreferrer" aria-label="Open destination">
              <FiExternalLink />
            </a>
          )}
        </div>

        {pin.postedBy && (
          <Link to={`/user-profile/${pin.postedBy._id}`} className="pin-author">
            <img src={pin.postedBy.image} alt={pin.postedBy.userName || 'user'} />
            <span>{pin.postedBy.userName}</span>
          </Link>
        )}
      </div>
    </article>
  );
};

export default Pin;
