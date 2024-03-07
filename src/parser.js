/* eslint-env browser */
export default (rss) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(rss.data.contents, 'application/xml');
  const parsererror = doc.querySelector('parsererror');
  //   console.log('parsErr', parsererror)

  if (parsererror) {
    const error = new Error(parsererror.textContent);
    error.parserError = true;
    error.data = rss;
    console.dir(error);
    // console.log('parsererror', parsererror);
    // console.log('rss', rss);
    throw error;
  }
  const feed = {
    title: doc.querySelector('channel > title').textContent,
    description: doc.querySelector('channel > description').textContent,
  };
    //  console.log('pars feed', feed)

  const posts = Array.from(doc.querySelectorAll('channel > item')).map((item) => ({
    title: item.querySelector('title').textContent,
    link: item.querySelector('link').textContent,
    description: item.querySelector('description').textContent,
  }));
  //    console.log('pars posts', posts)
  return {
    feed,
    posts,
  };
};
