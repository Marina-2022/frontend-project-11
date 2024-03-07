/* eslint-env browser */
import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import * as _ from 'lodash';
import resources from './locales/index.js';
import watch from './view.js';
import parser from './parser.js';
import setlocalErr from './locales/setLocale.js';

const getProxyRequestUrl = (url) => {
  const proxyUrl = 'https://allorigins.hexlet.app/get';
  const proxyParams = `?disableCache=true&url=${encodeURIComponent(url)}`;
  return `${proxyUrl}${proxyParams}`;
};

const delay = 5000;

const loadingError = (error) => {
  if (error.name === 'AxiosError') {
    return 'errors.networkError';
  }
  if (error.parserError) {
    return 'errors.invalidRss';
  }
  return 'errors.unknown';
};

const loadingUrl = (url, watchedState) => {
  watchedState.loadingProcess.status = 'loading';
  // watchedState.loadingProcess.errors = null;
  return axios.get(getProxyRequestUrl(url), { timeout: 10000 })
    .then((response) => {
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
      watchedState.loadingProcess.errors = loadingError(err);
      watchedState.loadingProcess.status = 'fail';
    });
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
    .catch(() => {}));
  Promise.all(promises)
    .then(() => {
      setTimeout(() => checkPosts(watchedState), delay);
    });
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

  yup.setLocale(setlocalErr);

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

      // const loadingUrl = (url) => {
      //   watchedState.loadingProcess.status = 'loading';
      //   // watchedState.loadingProcess.errors = null;
      //   return axios.get(getProxyRequestUrl(url), { timeout: 10000 })
      //     .then((response) => {
      //       const { feed, posts } = parser(response);
      //       feed.url = url;
      //       feed.id = _.uniqueId();
      //       watchedState.feeds.unshift(feed);
      //       const everyPosts = posts.map((post) => ({
      //         ...post,
      //         idFeed: feed.id,
      //         id: _.uniqueId(),
      //       }));

      //       watchedState.posts.unshift(...everyPosts);
      //       watchedState.loadingProcess.status = 'succsess';
      //     }).catch((err) => {
      //       watchedState.loadingProcess.errors = loadingError(err);
      //       watchedState.loadingProcess.status = 'fail';
      //     });
      // };

      elements.form.addEventListener('submit', (event) => {
        event.preventDefault();
        watchedState.form.status = 'sending';
        const formData = new FormData(event.target);
        const curentUrl = formData.get('url');
        const urls = watchedState.feeds.map((feed) => feed.url);
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
        const { id } = event.target.dataset;
        if (id) {
          watchedState.ui.id = id;
          watchedState.ui.showedPosts.add(id);
        }
      });
      checkPosts(watchedState, delay);
    });
};

export default app;
