/* eslint-env browser */
import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import * as _ from 'lodash';
import resources from './locales/index.js';
import watch from './view.js';
import parser from './parser.js';

const getProxyRequestUrl = (url) => {
  const proxyUrl = 'https://allorigins.hexlet.app/get';
  const proxyParams = `?disableCache=true&url=${encodeURIComponent(url)}`;
  return `${proxyUrl}${proxyParams}`;
};

const app = () => {
  const initialState = {
    form: {
      status: 'filling',
      errors: null,
    },
    loadingProcess: {
      status: '',
      errors: null,
    },
    ui: {
      id: '',
      showedPosts: new Set(),
    },
    posts: [],
    feeds: [],
  };

  const elements = {
    form: document.querySelector('.rss-form'),
    urlInput: document.querySelector('#url-input'),
    submitButton: document.querySelector('button[type="submit"]'),
    feedBack: document.querySelector('.feedback'),
    divPosts: document.querySelector('.posts'),
    divFeeds: document.querySelector('.feeds'),
    modal: document.querySelector('.modal'),
  };

  yup.setLocale({
    string: {
      url: () => ({ key: 'errors.invalidUrl' }),
      required: () => ({ key: 'errors.required' }),
    },
    mixed: {
      notOneOf: () => ({ key: 'errors.sameRss' }),
    },
  });

  const loadingError = (error) => {
    // console.log('loadError', error)
    if (error.name === 'AxiosError') {
      return 'errors.networkError';
    }
    if (error.parserError) {
      return 'errors.invalidRss';
    }
    return 'errors.unknown';
  };

  const checkPosts = (watchedState) => {
    const { feeds } = watchedState;
    const promises = feeds.map((feed) => axios.get(getProxyRequestUrl(feed.url), { timeout: 10000 })
      .then((response) => {
        const { posts } = parser(response);

        const oldPosts = watchedState.posts.map((post) => post.link);
        const newPosts = posts
          .filter((post) => !oldPosts.includes(post.link))
          .map((post) => ({ ...post, id: _.uniqueId(), idFeed: feed.id }));
        watchedState.posts.unshift(...newPosts);
      })
      //   {
      //     const isNewPost = !oldPosts.some((oldPost) => oldPost === post.link);
      //     if (isNewPost) {
      //       post.id = _.uniqueId();
      //       post.idFeed = feed.id;
      //     }
      //     return isNewPost;
      //   });
      //   watchedState.posts.unshift(...newPosts);
      // })
      .catch(() => {}));
    Promise.all(promises)
      .then(() => {
        setTimeout(() => checkPosts(watchedState), 5000);
      });
    // console.log('checkPosts', feeds)
  };

  const defaultlang = 'ru';
  const i18n = i18next.createInstance();
  i18n.init({
    debug: false,
    lng: defaultlang,
    resources,
  })
    .then(() => {
      const watchedState = watch(elements, i18n, initialState);

      const validateSchema = (curentUrl, feeds) => {
        const schema = yup.string().required().url().notOneOf(feeds);
        return schema
          .validate(curentUrl)
          .then(() => { })
          .catch((err) => err);
      };

      const loadingUrl = (url) => {
        watchedState.loadingProcess.status = 'loading';
        // watchedState.loadingProcess.errors = null;
        return axios.get(getProxyRequestUrl(url), { timeout: 10000 })
          .then((response) => {
            // console.log('respons', response)
            const { feed, posts } = parser(response);
            feed.url = url;
            feed.id = _.uniqueId();

            watchedState.feeds.unshift(feed);

            const everyPosts = posts.map((post) => ({
              ...post,
              idFeed: feed.id,
              id: _.uniqueId(),
            }));

            watchedState.posts.unshift(...everyPosts);
            watchedState.loadingProcess.status = 'succsess';
          }).catch((err) => {
            // console.log('err message', err);
            watchedState.loadingProcess.errors = loadingError(err);
            watchedState.loadingProcess.status = 'fail';
          });
      };

      elements.form.addEventListener('submit', (event) => {
        event.preventDefault();
        watchedState.form.status = 'sending';
        const formData = new FormData(event.target);
        const curentUrl = formData.get('url');
        const urls = watchedState.feeds.map((feed) => feed.url);
        // console.log('urls', urls)
        validateSchema(curentUrl, urls)
          .then((error) => {
            if (!error) {
              loadingUrl(curentUrl, watchedState);
              watchedState.form.errors = null;
              watchedState.form.status = 'ok';
            } else {
              watchedState.form.errors = error.message;
              watchedState.form.status = 'fail';

              console.log('error.message', error);
            }
          });
      });

      elements.divPosts.addEventListener('click', (event) => {
        // console.log('event', event.target.dataset)
        const { id } = event.target.dataset;
        if (id) {
          watchedState.ui.id = id;
          // console.log('watchedState.ui.id', watchedState.ui.id);
          watchedState.ui.showedPosts.add(id);
        }
      });
      checkPosts(watchedState);
    });
};

export default app;
