import * as yup from 'yup';
import i18next from 'i18next';
import resources from './locales/index.js';
import watch from './view.js';

const app = () => {

    const elements = {
        form: document.querySelector('.rss-form'),
        urlInput: document.querySelector('#url-input'),
        submitButton: document.querySelector('button[type="submit"]'),
        feedBack: document.querySelector('.feedback'),
    };
    // console.dir(elements.form);

    const initialState = {
        form: {
            fieldUrl: '',
            status: 'filling',
            valid: true,
            allAddedUrls: [],
        },
        errors: null,
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
    // console.log(i18n)
    .then(() => {
        const watchedState = watch(elements, i18n, initialState);
        // console.log(watchedState);
    
        const validateSchema = (curentUrl, allAddedUrls) => {
            const schema = yup.string().trim().required().url()
                .notOneOf(allAddedUrls);
            return schema.validate(curentUrl);
        } 
    
         elements.form.addEventListener('submit', (event) => {
            event.preventDefault();
            watchedState.form.status = 'sending';
            const formData = new FormData(event.target);
            // console.log(formData)
            // console.log([...formData])
            const curentUrl = formData.get('url');
            validateSchema(curentUrl, initialState.form.allAddedUrls)
                .then(() => {
                    watchedState.form.valid = true;
                    watchedState.form.allAddedUrls.push(curentUrl);
                    watchedState.errors = [];
                })
                .catch((err) => {
                    watchedState.form.valid = false;
                    watchedState.errors = err.errors[0];
                    // watchedState.errors.push(err.errors);
                })
         });  
    }) 

    
};

export default app;
