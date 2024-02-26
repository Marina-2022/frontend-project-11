export default (rss) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(rss.data.contents, 'application/xml')
    const parsererror = doc.querySelector('parsererror');
    // console.log('pars', doc)

    if (parsererror) {
        throw new Error ('errors.invalidRss');
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
    }))
    //    console.log('pars posts', posts)
    return {
        feed,
        posts,
    };            
}