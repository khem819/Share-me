export const userQuery = (userId) => {
  const query = `*[_type == "user" && _id == '${userId}']`;

  return query;
};

const pinFields = `{
  image{
    asset->{
      url
    }
  },
  _id,
  _createdAt,
  userId,
  title,
  about,
  category,
  destination,
  postedBy->{
    _id,
    userName,
    image
  },
  save[]{
    _key,
    userId,
    postedBy->{
      _id,
      userName,
      image
    },
  },
  comments[]{
    _key,
    comment
  },
}`;

export const categories = [
  { name: 'cars' },
  { name: 'fitness' },
  { name: 'wallpaper' },
  { name: 'websites' },
  { name: 'photo' },
  { name: 'food' },
  { name: 'nature' },
  { name: 'art' },
  { name: 'travel' },
  { name: 'quotes' },
  { name: 'cats' },
  { name: 'dogs' },
  { name: 'others' },
];

export const searchQuery = (searchTerm) => {
  const query = `*[_type == "pin" && (title match '${searchTerm}*' || category match '${searchTerm}*' || about match '${searchTerm}*')] | order(_createdAt desc) ${pinFields}`;
  return query;
};

export const feedQuery = `*[_type == "pin"] | order(_createdAt desc) ${pinFields}`;

export const categoryFeedQuery = (category) => `*[_type == "pin" && category == '${category}'] | order(_createdAt desc) ${pinFields}`;

export const pinDetailQuery = (pinId) => `*[_type == "pin" && _id == '${pinId}']{
  image{
    asset->{
      url
    }
  },
  _id,
  title,
  about,
  category,
  destination,
  postedBy->{
    _id,
    userName,
    image
  },
  save[]{
    _key,
    userId,
    postedBy->{
      _id,
      userName,
      image
    },
  },
  comments[]{
    comment,
    _key,
    postedBy->{
      _id,
      userName,
      image
    },
  }
}`;

export const pinDetailMorePinQuery = (pin) => {
  const category = pin?.category;
  const pinId = pin?._id;

  return `*[_type == "pin" && category == '${category}' && _id != '${pinId}'] | order(_createdAt desc) ${pinFields}`;
};

export const userCreatedPinsQuery = (userId) => `*[_type == "pin" && userId == '${userId}'] | order(_createdAt desc) ${pinFields}`;

export const userSavedPinsQuery = (userId) => `*[_type == "pin" && '${userId}' in save[].postedBy._ref] | order(_createdAt desc) ${pinFields}`;
