import onChange from 'on-change';
import _ from 'lodash';

const watch = (elements, i18n, state) => {
    // console.log(state)
    const { form, urlInput, submitButton, feedBack, divPosts, divFeeds } = elements;

    const renderFeedsCard = (state) => {
        const { feeds } = state;
        // console.log('feeds', feeds)
        if (!divFeeds.hasChildNodes()) {
            const cardfeeds = createPostsOrFeedsCard(i18n.t('feeds'));
            divFeeds.append(cardfeeds);
        };
        const list = divFeeds.querySelector('ul');
        // console.log('list', list)
        const itemsFeeds = feeds.map((feed) => {
            // console.log('itemsFeeds', feed)
            const li = document.createElement('li');
            const title = document.createElement('h3');
            const description = document.createElement('p');

            li.classList.add('list-group-item', 'border-0', 'border-end-0');
            title.classList.add('h6', 'm-0');
            description.classList.add('m-0', 'small', 'text-black-50');

            title.textContent = feed.title;
            description.textContent = feed.description;

            li.append(title, description);
            return li;
        })
        list.append(...itemsFeeds); 
    };

    const createPostsOrFeedsCard = (textCardTitle) => {
        const divCard = document.createElement('div');
        const divCardBody = document.createElement('div');
        const h2CardTitle = document.createElement('h2');
        const ulListGroup = document.createElement('ul');

        divCard.classList.add('card', 'border-0');
        divCardBody.classList.add('card-body');
        h2CardTitle.classList.add('card-title', 'h4');
        ulListGroup.classList.add('list-group', 'border-0', 'rounded-0');
        h2CardTitle.textContent = textCardTitle;

        divCard.append(divCardBody, ulListGroup);
        divCardBody.append(h2CardTitle);

        return divCard;
    }

    const renderPostsCard = (state) => {
        const { posts } = state;
        // console.log('posts', posts)
        if (!divPosts.hasChildNodes()) {
            const cardPosts = createPostsOrFeedsCard(i18n.t('posts'));
            divPosts.append(cardPosts);
        }
       const list = divPosts.querySelector('ul');
       const itemsPosts = posts.map((post) => {
        //    console.log('post!', post)
           const li = document.createElement('li');
           const link = document.createElement('a');
           const btn = document.createElement('button');

           li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
           link.classList.add('fw-bold');
           btn.textContent = i18n.t('show')
           btn.classList.add('btn', 'btn-outline-primary', 'btn-sm')
        
           link.textContent = post.title;
           link.href = post.link;

           li.append(link, btn);
           return li;
       })
    //    console.log('itemsPosts', itemsPosts)
       list.append(...itemsPosts);
    };

    const hendleErrorsForm = (state, value) => {
        const { form } = state;

        console.log('hendleErrorsForm value', value)

        if(value === 'fail') {
            urlInput.classList.add('is-invalid');
            feedBack.classList.add('text-danger');
            feedBack.textContent = i18n.t(form.errors.key);
            urlInput.focus();
        };
        if(value === 'sending') {
            urlInput.classList.remove('is-invalid');
            feedBack.classList.remove('text-danger');
            feedBack.textContent = '';
        };
    };

    const hendleErrorsLoadingProcess = (state, value) => {
        const { loadingProcess } = state;
        console.log('hendleErrorsLoadingProcess value', value)
        if(value === 'fail') {
            urlInput.classList.add('is-invalid');
            feedBack.classList.add('text-danger');
            feedBack.textContent = i18n.t(loadingProcess.errors);
            urlInput.focus();
        }
        if(value === 'succsess') {
            urlInput.classList.remove('is-invalid');
            feedBack.classList.remove('text-danger');
            feedBack.classList.add('text-success');
            // feedBack.textContent = '';
            feedBack.textContent = i18n.t('successLoad');
        }
    }

    const watchedState = onChange(state, (path, value) => {
        // console.log('wath', state.form.errors)
        // console.log('path', path)
        switch (path) {
            case 'form.status':
            //    console.log('switch', state.form.errors)
            //    console.log('value', value)
                hendleErrorsForm(state, value);
                break;
            case 'loadingProcess.status':
                hendleErrorsLoadingProcess(state, value);
                break;
            case 'posts':
                renderPostsCard(state);
                break;
            case 'feeds':
                renderFeedsCard(state);
                break;
        }
        // console.log(watchedState);
    })
    return watchedState;
};

export default watch;
