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

    const loadingUrl = (url, watchedState) => {
        watchedState.loadingProcess.status = 'loading';
        // watchedState.loadingProcess.errors = null;
        return axios.get(getProxyRequestUrl(url))
            .then((response) => {
            // console.log(response)
            const { feed, posts } = parser(response)
            feed.url = url;
            feed.id = _.uniqueId();
            
            watchedState.feeds.unshift(feed);
            // watchedState.feeds = watchedState.feeds.concat(feed);
            watchedState.posts.unshift(...posts);
            watchedState.loadingProcess.status = 'succsess';
            // console.log('watchedState.loadingProcess.status', watchedState.loadingProcess.status)
            // watchedState.posts = watchedState.posts.concat(...posts);
            // watchedState.feeds = [...watchedState.feeds, feed];
            // watchedState.posts = [...watchedState.posts, ...posts];
            // watchedState.posts.push(posts);
            // const everyPosts = posts.map((post) => {
            //     console.log('everyPosts app', post)
            // })
        }) .catch((err) => {
            // console.log('err', err.message)
            watchedState.loadingProcess.errors = err.message;
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
    });
};

export default app;
