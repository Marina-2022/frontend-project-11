import onChange from 'on-change';
import _ from 'lodash';

const watch = (elements, i18n, state) => {
    const { form, urlInput, submitButton, feedBack } = elements;

    const hendleErrors = () => {
        if(state.form.valid === false) {
            // submitButton.disabled = false;
            urlInput.classList.add('is-invalid');
            feedBack.classList.add('text-danger');
            urlInput.focus();
            switch (true) {
                case _.some(state.errors, { key:'errors.invalidUrl' }):
                    console.log('invalid url')
                    feedBack.textContent = i18n.t('errors.invalidUrl');
                    break;
                case _.some(state.errors, { key:'errors.sameRss' }):
                    console.log('same rss')
                    feedBack.textContent = i18n.t('errors.sameRss');
                    break;
                default: break;
            }
        } else {
            submitButton.disabled = false;
            urlInput.classList.remove('is-invalid');
            feedBack.classList.remove('text-danger');
            feedBack.textContent = '';
        }
    };

    const watchedState = onChange(state, (path) => {
        console.log(path)
        switch (path) {
            case 'errors':
                hendleErrors();
        }
        // console.log(watchedState.form);
        // console.log(watchedState.errors)
    })
    return watchedState;
};

export default watch;
