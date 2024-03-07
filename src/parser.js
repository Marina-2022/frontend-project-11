/* eslint-env browser */
export default (rss) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(rss.data.contents, 'application/xml');
  const parsererror = doc.querySelector('parsererror');

  if (parsererror) {
    const error = new Error(parsererror.textContent);
    error.parserError = true;
    error.data = rss;
    console.dir(error);
    throw error;
  }
  const feed = {
    title: doc.querySelector('channel > title').textContent,
    description: doc.querySelector('channel > description').textContent,
  };

  const posts = Array.from(doc.querySelectorAll('channel > item')).map((item) => ({
    title: item.querySelector('title').textContent,
    link: item.querySelector('link').textContent,
    description: item.querySelector('description').textContent,
  }));

  return {
    feed,
    posts,
  };
};
