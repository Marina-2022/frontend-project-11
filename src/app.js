import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import _ from 'lodash';
import resources from './locales/index.js';
import watch from './view.js';
import parser from './parser.js';

const getProxyRequestUrl= (url) => {
    const proxyUrl = 'https://allorigins.hexlet.app/get';
    const proxyParams = `?disableCache=true&url=${encodeURIComponent(url)}`;
    return `${proxyUrl}${proxyParams}`;
}

const app = () => {

    const elements = {
        form: document.querySelector('.rss-form'),
        urlInput: document.querySelector('#url-input'),
        submitButton: document.querySelector('button[type="submit"]'),
        feedBack: document.querySelector('.feedback'),
        divPosts: document.querySelector('.posts'),
        divFeeds: document.querySelector('.feeds'),
    };
    // console.dir(elements.form);

    const initialState = {
        form: {
            status: 'filling',
            isValid: '',
            errors: null,
        },
        loadingProcess: {
            status: '',
            errors: null,
        },
        ui: {
        },
        posts: [],
        feeds: [],
    };

    yup.setLocale({
        string: {
            url: () => ({ key: 'errors.invalidUrl' }),
        },
        mixed: {
            notOneOf: () => ({ key: 'errors.sameRss' }),
        },
    });

    const loadingError = (error) => {
        // console.log('loadError', error)
        if (error === 'Network Error')  {
            return 'errors.networkError';
        }
        if (error === 'Parser error')  {
            return 'errors.invalidRss';
        }
        return 'errors.unknown';
    };

    const checkPosts = (watchedState) => {
        const { feeds } = watchedState;
        const promises = feeds.map((feed) => {
            return axios.get(getProxyRequestUrl(feed.url), { timeout: 10000 })
            .then((response) => {
                const { posts } = parser(response);
               
                const oldPosts = watchedState.posts.map((post) => post.link);
                const newPosts = posts.filter((post) => !oldPosts.some((oldPost) => oldPost === post.link ));
                watchedState.posts.unshift(...newPosts);
                // console.log('newPosts', newPosts);
            })
            .catch(() => {});
        })
            Promise.all(promises)
            .then(() => {
                // console.log('done')
                setTimeout(() => checkPosts(watchedState), 5000);
            })
        // console.log('checkPosts', feeds) 
    };

    const loadingUrl = (url, watchedState) => {
        watchedState.loadingProcess.status = 'loading';
        // watchedState.loadingProcess.errors = null;
        return axios.get(getProxyRequestUrl(url), { timeout: 10000 })
            .then((response) => {
            // console.log('respons', response)
            const { feed, posts } = parser(response)
            feed.url = url;
            feed.id = _.uniqueId();
            
            watchedState.feeds.unshift(feed);

            const everyPosts = posts.map((post) => ({ ...post, id: feed.id}))
            // console.log('everyPosts app', everyPosts)
            
            watchedState.posts.unshift(...everyPosts);

            watchedState.loadingProcess.status = 'succsess';
            // console.log('watchedState feed', watchedState.feeds)
            
        }) .catch((err) => {
            // console.log('err message', err.message);
            watchedState.loadingProcess.errors = loadingError(err.message);
            // console.log('watchedState.loadingProcess.errors', watchedState.loadingProcess.errors)
            watchedState.form.isValid = false;
            watchedState.loadingProcess.status = 'fail';            
        })
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
            .catch((err) => {
                // // console.log(err.message)
                return err;
            })
        };
    
        elements.form.addEventListener('submit', (event) => {
            event.preventDefault();
            watchedState.form.isValid = '';
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
                        watchedState.form.isValid = true;
                        watchedState.form.status = 'ok';
                    } else {
                        watchedState.form.errors = error.message;
                        watchedState.form.isValid = false;
                        watchedState.form.status = 'fail';
                        
                        // console.log('error.message', error.message)
                        // console.log('watchedState.form', watchedState.form)
                    }
                    // console.log('After validation:', watchedState.form);
                    // loadingUrl(curentUrl, watchedState);
                })
         });

            elements.divPosts.addEventListener('click', (event) => {
            // console.log('event', event.target.dataset)
         });
         checkPosts(watchedState);
    });
};

export default app;
