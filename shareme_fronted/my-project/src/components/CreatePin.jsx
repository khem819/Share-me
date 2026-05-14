import { useState } from 'react';
import { AiOutlineCloudUpload } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import { MdDelete } from 'react-icons/md';

import { categories } from '../utils/data';
import { client } from '../client';
import Spinner from './Spinner';

const CreatePin = ({ user }) => {
  const [title, setTitle] = useState('');
  const [about, setAbout] = useState('');
  const [loading, setLoading] = useState(false);
  const [destination, setDestination] = useState();
  const [fields, setFields] = useState();
  const [category, setCategory] = useState();
  const [imageAsset, setImageAsset] = useState();
  const [wrongImageType, setWrongImageType] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  const uploadImage = (e) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    setErrorMessage('');

    // uploading asset to sanity
    if (selectedFile.type === 'image/png' || selectedFile.type === 'image/svg+xml' || selectedFile.type === 'image/jpeg' || selectedFile.type === 'image/gif' || selectedFile.type === 'image/tiff') {
      setWrongImageType(false);
      setLoading(true);
      client.assets
        .upload('image', selectedFile, { contentType: selectedFile.type, filename: selectedFile.name })
        .then((document) => {
          setImageAsset(document);
          setLoading(false);
        })
        .catch((error) => {
          console.log('Upload failed:', error.message);
          setErrorMessage('Image upload failed. Please try again.');
          setLoading(false);
        });
    } else {
      setLoading(false);
      setWrongImageType(true);
    }
  };

  const savePin = () => {
    setErrorMessage('');

    if (!user?._id) {
      setErrorMessage('Please sign in again before publishing.');
      return;
    }

    if (title && about && destination && imageAsset?._id && category) {
      const doc = {
        _type: 'pin',
        title,
        about,
        destination,
        image: {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: imageAsset?._id,
          },
        },
        userId: user._id,
        postedBy: {
          _type: 'postedBy',
          _ref: user._id,
        },
        category,
      };
      setLoading(true);
      client
        .create(doc)
        .then(() => {
          navigate('/');
        })
        .catch((error) => {
          console.log('Pin creation failed:', error.message);
          setErrorMessage('Could not publish this post. Please check your Sanity token and try again.');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setFields(true);

      setTimeout(
        () => {
          setFields(false);
        },
        2000,
      );
    }
  };
  return (
    <section className="create-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Create</p>
          <h2>Share a new post</h2>
        </div>
      </div>

      {fields && <p className="form-alert">Please add all fields.</p>}
      {errorMessage && <p className="form-alert">{errorMessage}</p>}

      <div className="create-card">
        <div className="upload-panel">
          <div className="upload-dropzone">
            {loading && (
              <Spinner message="Uploading image" />
            )}
            {
              wrongImageType && (
                <p className="form-alert">This file type is not supported.</p>
              )
            }
            {!imageAsset ? (
              <label htmlFor="upload-image" className="upload-label">
                <AiOutlineCloudUpload />
                <strong>Click to upload media</strong>
                <span>JPG, JPEG, SVG, PNG, GIF or TIFF under 20MB</span>
                <input
                  id="upload-image"
                  type="file"
                  name="upload-image"
                  onChange={uploadImage}
                />
              </label>
            ) : (
              <div className="upload-preview">
                <img
                  src={imageAsset?.url}
                  alt="uploaded-pic"
                />
                <button
                  type="button"
                  className="icon-button preview-delete"
                  onClick={() => setImageAsset(null)}
                  aria-label="Remove uploaded image"
                >
                  <MdDelete />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="form-panel">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title"
            className="field field-title"
          />
          {user && (
            <div className="composer-author">
              <img
                src={user.image}
                alt="user-profile"
              />
              <span>{user.userName}</span>
            </div>
          )}
          <textarea
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            placeholder="Caption"
            className="field field-textarea"
            rows={4}
          />
          <input
            type="url"
            value={destination || ''}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Destination link"
            className="field"
          />

          <div className="field-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                onChange={(e) => {
                  setCategory(e.target.value);
                }}
              className="field"
              >
              <option value="">Select category</option>
                {categories.map((item) => (
                <option key={item.name} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={savePin}
              className="primary-button"
              >
              Publish post
              </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CreatePin;
