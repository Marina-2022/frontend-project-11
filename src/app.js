import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
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
            // fieldUrl: '',
            status: 'filling',
            isValid: '',
            // feeds: [],
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
        }
    });

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
            const schema = yup.string().trim().required().url()
                .notOneOf(feeds);
            return schema.validate(curentUrl)
            .then(() => {
                watchedState.form.isValid = true;
                // watchedState.feeds.push(curentUrl);
                watchedState.form.errors = null;
            })
            .catch((err) => {
                watchedState.form.isValid = false;
                watchedState.form.errors = err.message;
            })
        };

        const loadingUrl = (url) => {
            watchedState.loadingProcess.status = 'loading';
            watchedState.loadingProcess.errors = null;
            return axios.get(getProxyRequestUrl(url))
                .then((response) => {
                // console.log(response)
                const { feed, posts } = parser(response)
                feed.url = url;
                feed.id = _.uniqueId();
                watchedState.feeds.unshift(feed);
                // watchedState.feeds = watchedState.feeds.concat(feed);
                watchedState.posts.unshift(...posts);
                // watchedState.posts = watchedState.posts.concat(...posts);
                // watchedState.feeds = [...watchedState.feeds, feed];
                // watchedState.posts = [...watchedState.posts, ...posts];
                // watchedState.posts.push(posts);
                // const everyPosts = posts.map((post) => {
                //     console.log('everyPosts app', post)
                // })
            }) 
        }
    
        elements.form.addEventListener('submit', (event) => {
            event.preventDefault();
            watchedState.form.status = 'sending';
            const formData = new FormData(event.target);
            // console.log([...formData])
            const curentUrl = formData.get('url');
            const urls = watchedState.feeds.map((link) => link.url);
            validateSchema(curentUrl, urls)
            // console.log(validateSchema(curentUrl, initialState.feeds))
                .then(() => loadingUrl(curentUrl))
         });  
    }) 
};

export default app;
