import { useEffect, useState, useCallback } from 'react';
import { MdDownloadForOffline, MdOutlineOpenInNew } from 'react-icons/md';
import { HiHeart, HiOutlineHeart } from 'react-icons/hi';
import { IoSend } from 'react-icons/io5';
import { Link, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

import { client, urlFor } from '../client';
import MasonryLayout from './MasonryLayout';
import { pinDetailMorePinQuery, pinDetailQuery } from '../utils/data';
import Spinner from './Spinner';

/* ─── Skeleton loader ───────────────────────────────────────────────────────── */
const Skeleton = () => (
  <div className="pd-skeleton">
    <div className="pd-skeleton__media" />
    <div className="pd-skeleton__body">
      <div className="pd-skeleton__line pd-skeleton__line--title" />
      <div className="pd-skeleton__line" />
      <div className="pd-skeleton__line pd-skeleton__line--short" />
      <div className="pd-skeleton__author">
        <div className="pd-skeleton__avatar" />
        <div className="pd-skeleton__line pd-skeleton__line--name" />
      </div>
    </div>
  </div>
);

/* ─── Single comment bubble ─────────────────────────────────────────────────── */
const CommentItem = ({ item, index }) => (
  <div className="pd-comment" style={{ animationDelay: `${index * 60}ms` }}>
    <img
      className="pd-comment__avatar"
      src={item?.postedBy?.image}
      alt={item?.postedBy?.userName || 'user'}
    />
    <div className="pd-comment__bubble">
      <span className="pd-comment__name">{item?.postedBy?.userName}</span>
      <p className="pd-comment__text">{item?.comment}</p>
    </div>
  </div>
);

/* ─── Main component ────────────────────────────────────────────────────────── */
const PinDetail = ({ user }) => {
  const { pinId } = useParams();

  const [pins, setPins]           = useState([]);
  const [pinDetail, setPinDetail] = useState(null);
  const [comment, setComment]     = useState('');
  const [addingComment, setAddingComment] = useState(false);
  const [liked, setLiked]         = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const fetchPinDetails = useCallback(async () => {
    try {
      const data = await client.fetch(pinDetailQuery(pinId));
      if (data?.[0]) {
        setPinDetail(data[0]);
        const morePins = await client.fetch(pinDetailMorePinQuery(data[0]));
        setPins(morePins);
      }
    } catch (error) {
      console.log('Error fetching pin details:', error);
    }
  }, [pinId]);

  useEffect(() => {
    fetchPinDetails();
  }, [fetchPinDetails]);

  const addComment = async (event) => {
    event?.preventDefault();
    if (!comment.trim()) return;
    if (!user?._id) { alert('Please sign in first'); return; }

    try {
      setAddingComment(true);
      await client
        .patch(pinId)
        .setIfMissing({ comments: [] })
        .append('comments', [{
          _key: uuidv4(),
          comment: comment.trim(),
          postedBy: { _type: 'reference', _ref: user._id },
        }])
        .commit();

      setComment('');
      fetchPinDetails();
    } catch (error) {
      console.log('Error adding comment:', error);
      alert('Failed to post comment');
    } finally {
      setAddingComment(false);
    }
  };

  if (!pinDetail) return <Skeleton />;

  const commentCount = pinDetail?.comments?.length ?? 0;

  return (
    <>
      {/* ── Pin detail card ───────────────────────────────────────────────── */}
      <article className="pd-root">

        {/* Left — media panel */}
        <div className="pd-media-panel">
          <div className={`pd-media-wrap ${imgLoaded ? 'pd-media-wrap--loaded' : ''}`}>
            <img
              className="pd-media-img"
              src={urlFor(pinDetail?.image).url()}
              alt={pinDetail?.title || 'pin'}
              onLoad={() => setImgLoaded(true)}
            />

            {/* Floating action bar */}
            <div className="pd-fab">
              <button
                className={`pd-fab__btn pd-fab__btn--like ${liked ? 'pd-fab__btn--liked' : ''}`}
                onClick={() => setLiked(l => !l)}
                aria-label={liked ? 'Unlike' : 'Like'}
              >
                {liked ? <HiHeart /> : <HiOutlineHeart />}
              </button>

              <a
                href={`${pinDetail?.image?.asset?.url}?dl=`}
                download
                className="pd-fab__btn"
                aria-label="Download image"
              >
                <MdDownloadForOffline />
              </a>
            </div>
          </div>
        </div>

        {/* Right — content panel */}
        <div className="pd-content-panel">

          {/* Destination chip */}
          {pinDetail?.destination && (
            <a
              href={pinDetail.destination}
              target="_blank"
              rel="noreferrer"
              className="pd-dest-chip"
            >
              <MdOutlineOpenInNew />
              <span className="pd-dest-chip__label">
                {new URL(pinDetail.destination).hostname.replace('www.', '')}
              </span>
            </a>
          )}

          {/* Title + description */}
          <div className="pd-copy">
            <h1 className="pd-copy__title">{pinDetail?.title}</h1>
            {pinDetail?.about && (
              <p className="pd-copy__about">{pinDetail.about}</p>
            )}
          </div>

          {/* Author row */}
          <Link
            to={`/user-profile/${pinDetail?.postedBy?._id}`}
            className="pd-author"
          >
            <img
              className="pd-author__avatar"
              src={pinDetail?.postedBy?.image}
              alt={pinDetail?.postedBy?.userName || 'user'}
            />
            <div>
              <span className="pd-author__name">
                {pinDetail?.postedBy?.userName}
              </span>
              <span className="pd-author__tag">Creator</span>
            </div>
            <span className="pd-author__follow">Follow</span>
          </Link>

          {/* Divider */}
          <div className="pd-divider" />

          {/* Comments section */}
          <div className="pd-comments">
            <div className="pd-comments__header">
              <h2 className="pd-comments__heading">
                Comments
                {commentCount > 0 && (
                  <span className="pd-comments__count">{commentCount}</span>
                )}
              </h2>
            </div>

            <div className="pd-comments__list">
              {commentCount > 0 ? (
                pinDetail.comments.map((item, i) => (
                  <CommentItem key={item._key} item={item} index={i} />
                ))
              ) : (
                <div className="pd-comments__empty">
                  <span className="pd-comments__empty-icon">💬</span>
                  <p>No comments yet. Be the first!</p>
                </div>
              )}
            </div>
          </div>

          {/* Comment input */}
          {user && (
            <form className="pd-compose" onSubmit={addComment}>
              <Link to={`/user-profile/${user?._id}`} className="pd-compose__avatar-link">
                <img
                  className="pd-compose__avatar"
                  src={user?.image}
                  alt={user?.userName || 'you'}
                />
              </Link>

              <div className="pd-compose__field">
                <input
                  className="pd-compose__input"
                  type="text"
                  placeholder="Add a comment…"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  disabled={addingComment}
                  maxLength={300}
                />
                <button
                  className="pd-compose__send"
                  type="submit"
                  disabled={addingComment || !comment.trim()}
                  aria-label="Post comment"
                >
                  {addingComment
                    ? <span className="pd-compose__spinner" />
                    : <IoSend />}
                </button>
              </div>
            </form>
          )}
        </div>
      </article>

      {/* ── More like this ────────────────────────────────────────────────── */}
      {pins?.length > 0 && (
        <section className="pd-more">
          <div className="pd-more__heading">
            <span className="pd-more__pill">More like this</span>
          </div>
          <MasonryLayout pins={pins} />
        </section>
      )}

      {/* ── Styles (scoped via class prefix) ─────────────────────────────── */}
      <style>{`
        /* ── tokens ───────────────────────────────────────── */
        :root {
          --pd-radius: 24px;
          --pd-radius-sm: 14px;
          --pd-bg: #0a0a0a;
          --pd-surface: #111111;
          --pd-surface2: #1a1a1a;
          --pd-border: rgba(255,255,255,0.07);
          --pd-text: #f0f0f0;
          --pd-muted: rgba(240,240,240,0.45);
          --pd-accent: #ff3f6c;
          --pd-accent-soft: rgba(255,63,108,0.12);
          --pd-font-display: 'Playfair Display', Georgia, serif;
          --pd-font-body: 'DM Sans', system-ui, sans-serif;
          --pd-transition: 0.22s cubic-bezier(0.4,0,0.2,1);
        }

        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500&display=swap');

        /* ── root card ────────────────────────────────────── */
        .pd-root {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
          background: var(--pd-surface);
          border-radius: var(--pd-radius);
          overflow: hidden;
          min-height: 600px;
          margin: 2rem auto;
          max-width: 1100px;
          box-shadow: 0 32px 80px rgba(0,0,0,0.6);
          animation: pd-rise 0.5s cubic-bezier(0.4,0,0.2,1) both;
        }

        @keyframes pd-rise {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .pd-root { grid-template-columns: 1fr; }
        }

        /* ── media panel ──────────────────────────────────── */
        .pd-media-panel {
          position: relative;
          background: #000;
          overflow: hidden;
        }

        .pd-media-wrap {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 500px;
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .pd-media-wrap--loaded { opacity: 1; }

        .pd-media-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.6s cubic-bezier(0.4,0,0.2,1);
        }

        .pd-media-panel:hover .pd-media-img {
          transform: scale(1.03);
        }

        /* floating action buttons */
        .pd-fab {
          position: absolute;
          top: 16px;
          right: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .pd-fab__btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: none;
          background: rgba(10,10,10,0.65);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          color: var(--pd-text);
          font-size: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          text-decoration: none;
          transition: background var(--pd-transition), transform var(--pd-transition), color var(--pd-transition);
        }

        .pd-fab__btn:hover {
          background: rgba(255,255,255,0.15);
          transform: scale(1.1);
        }

        .pd-fab__btn--liked {
          color: var(--pd-accent);
          background: var(--pd-accent-soft);
        }

        .pd-fab__btn--liked:hover {
          background: rgba(255,63,108,0.2);
        }

        /* ── content panel ────────────────────────────────── */
        .pd-content-panel {
          display: flex;
          flex-direction: column;
          padding: 36px 32px 24px;
          background: var(--pd-surface);
          overflow-y: auto;
          max-height: 85vh;
          gap: 20px;
        }

        /* scrollbar */
        .pd-content-panel::-webkit-scrollbar { width: 4px; }
        .pd-content-panel::-webkit-scrollbar-track { background: transparent; }
        .pd-content-panel::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.12);
          border-radius: 99px;
        }

        /* ── destination chip ─────────────────────────────── */
        .pd-dest-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px 6px 10px;
          background: var(--pd-surface2);
          border: 1px solid var(--pd-border);
          border-radius: 99px;
          font-family: var(--pd-font-body);
          font-size: 12px;
          color: var(--pd-muted);
          text-decoration: none;
          width: fit-content;
          transition: color var(--pd-transition), border-color var(--pd-transition);
        }

        .pd-dest-chip:hover {
          color: var(--pd-text);
          border-color: rgba(255,255,255,0.2);
        }

        .pd-dest-chip__label {
          max-width: 180px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* ── copy ─────────────────────────────────────────── */
        .pd-copy__title {
          font-family: var(--pd-font-display);
          font-size: clamp(1.5rem, 3vw, 2rem);
          font-weight: 700;
          color: var(--pd-text);
          margin: 0;
          line-height: 1.2;
          letter-spacing: -0.02em;
        }

        .pd-copy__about {
          font-family: var(--pd-font-body);
          font-size: 14px;
          color: var(--pd-muted);
          margin: 8px 0 0;
          line-height: 1.65;
        }

        /* ── author row ───────────────────────────────────── */
        .pd-author {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          padding: 12px 16px;
          border-radius: var(--pd-radius-sm);
          background: var(--pd-surface2);
          border: 1px solid var(--pd-border);
          transition: border-color var(--pd-transition), background var(--pd-transition);
        }

        .pd-author:hover {
          background: #202020;
          border-color: rgba(255,255,255,0.14);
        }

        .pd-author__avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--pd-accent);
          flex-shrink: 0;
        }

        .pd-author__name {
          display: block;
          font-family: var(--pd-font-body);
          font-size: 14px;
          font-weight: 500;
          color: var(--pd-text);
        }

        .pd-author__tag {
          display: block;
          font-size: 11px;
          color: var(--pd-muted);
          margin-top: 1px;
        }

        .pd-author__follow {
          margin-left: auto;
          font-size: 12px;
          font-weight: 500;
          font-family: var(--pd-font-body);
          color: var(--pd-accent);
          padding: 6px 14px;
          border: 1px solid var(--pd-accent);
          border-radius: 99px;
          transition: background var(--pd-transition), color var(--pd-transition);
        }

        .pd-author:hover .pd-author__follow {
          background: var(--pd-accent);
          color: #fff;
        }

        /* ── divider ──────────────────────────────────────── */
        .pd-divider {
          height: 1px;
          background: var(--pd-border);
        }

        /* ── comments ─────────────────────────────────────── */
        .pd-comments { flex: 1; display: flex; flex-direction: column; gap: 16px; }

        .pd-comments__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .pd-comments__heading {
          font-family: var(--pd-font-body);
          font-size: 13px;
          font-weight: 500;
          color: var(--pd-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .pd-comments__count {
          background: var(--pd-surface2);
          border: 1px solid var(--pd-border);
          font-size: 11px;
          color: var(--pd-muted);
          padding: 1px 8px;
          border-radius: 99px;
          font-weight: 400;
        }

        .pd-comments__list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .pd-comments__empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 32px 0;
          color: var(--pd-muted);
          font-family: var(--pd-font-body);
          font-size: 13px;
        }

        .pd-comments__empty-icon { font-size: 28px; }

        /* single comment */
        .pd-comment {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          animation: pd-comment-in 0.3s cubic-bezier(0.4,0,0.2,1) both;
        }

        @keyframes pd-comment-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .pd-comment__avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          object-fit: cover;
          flex-shrink: 0;
          border: 1.5px solid var(--pd-border);
        }

        .pd-comment__bubble {
          background: var(--pd-surface2);
          border: 1px solid var(--pd-border);
          border-radius: 4px 14px 14px 14px;
          padding: 10px 14px;
          flex: 1;
        }

        .pd-comment__name {
          font-family: var(--pd-font-body);
          font-size: 12px;
          font-weight: 500;
          color: var(--pd-text);
          display: block;
          margin-bottom: 3px;
        }

        .pd-comment__text {
          font-family: var(--pd-font-body);
          font-size: 13px;
          color: rgba(240,240,240,0.7);
          margin: 0;
          line-height: 1.5;
        }

        /* ── compose bar ──────────────────────────────────── */
        .pd-compose {
          display: flex;
          align-items: center;
          gap: 10px;
          padding-top: 4px;
          border-top: 1px solid var(--pd-border);
          margin-top: auto;
        }

        .pd-compose__avatar-link { flex-shrink: 0; }

        .pd-compose__avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--pd-accent);
          display: block;
        }

        .pd-compose__field {
          flex: 1;
          display: flex;
          align-items: center;
          background: var(--pd-surface2);
          border: 1px solid var(--pd-border);
          border-radius: 99px;
          padding: 0 6px 0 16px;
          transition: border-color var(--pd-transition);
        }

        .pd-compose__field:focus-within {
          border-color: rgba(255,63,108,0.5);
        }

        .pd-compose__input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          font-family: var(--pd-font-body);
          font-size: 13px;
          color: var(--pd-text);
          padding: 10px 0;
        }

        .pd-compose__input::placeholder { color: var(--pd-muted); }

        .pd-compose__send {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: none;
          background: var(--pd-accent);
          color: #fff;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: opacity var(--pd-transition), transform var(--pd-transition);
        }

        .pd-compose__send:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .pd-compose__send:not(:disabled):hover {
          transform: scale(1.1);
        }

        .pd-compose__spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: pd-spin 0.7s linear infinite;
          display: block;
        }

        @keyframes pd-spin {
          to { transform: rotate(360deg); }
        }

        /* ── skeleton ─────────────────────────────────────── */
        .pd-skeleton {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
          background: #111;
          border-radius: 24px;
          overflow: hidden;
          min-height: 600px;
          max-width: 1100px;
          margin: 2rem auto;
          box-shadow: 0 32px 80px rgba(0,0,0,0.6);
        }

        .pd-skeleton__media {
          background: linear-gradient(110deg, #1a1a1a 30%, #222 50%, #1a1a1a 70%);
          background-size: 200% 100%;
          animation: pd-shimmer 1.5s infinite;
        }

        .pd-skeleton__body {
          padding: 36px 32px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .pd-skeleton__line {
          height: 14px;
          background: linear-gradient(110deg, #1a1a1a 30%, #222 50%, #1a1a1a 70%);
          background-size: 200% 100%;
          border-radius: 99px;
          animation: pd-shimmer 1.5s infinite;
        }

        .pd-skeleton__line--title { height: 28px; width: 70%; }
        .pd-skeleton__line--short { width: 40%; }
        .pd-skeleton__line--name  { width: 120px; }

        .pd-skeleton__author {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 8px;
        }

        .pd-skeleton__avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: linear-gradient(110deg, #1a1a1a 30%, #222 50%, #1a1a1a 70%);
          background-size: 200% 100%;
          animation: pd-shimmer 1.5s infinite;
          flex-shrink: 0;
        }

        @keyframes pd-shimmer {
          to { background-position: -200% 0; }
        }

        /* ── more like this ───────────────────────────────── */
        .pd-more { margin-top: 3rem; }

        .pd-more__heading {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 2rem;
        }

        .pd-more__pill {
          font-family: var(--pd-font-body);
          font-size: 13px;
          font-weight: 500;
          color: var(--pd-muted);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          padding: 8px 24px;
          border: 1px solid var(--pd-border);
          border-radius: 99px;
          background: var(--pd-surface);
        }
      `}</style>
    </>
  );
};

export default PinDetail;