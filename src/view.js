import onChange from 'on-change';
import _ from 'lodash';

const watch = (elements, i18n, state) => {
    const { form, urlInput, submitButton, feedBack } = elements;

    const hendleErrors = (errors) => {
        if(state.form.valid === false) {
            // submitButton.disabled = false;
            urlInput.classList.add('is-invalid');
            feedBack.classList.add('text-danger');
            feedBack.textContent = i18n.t(errors.key, errors.values);
            urlInput.focus();
        } else {
            submitButton.disabled = false;
            urlInput.classList.remove('is-invalid');
            feedBack.classList.remove('text-danger');
            feedBack.textContent = '';
        }
    };

    const watchedState = onChange(state, (path) => {
        // console.log(path)
        switch (path) {
            case 'errors':
                console.log(state.errors)
                hendleErrors(state.errors);
        }
        // console.log(watchedState.form);
        // console.log(watchedState.errors)
    })
    return watchedState;
};

export default watch;
