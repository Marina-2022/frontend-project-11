/* eslint-env browser */
import onChange from 'on-change';

const watch = (elements, i18n, state) => {
  const {
    urlInput, submitButton, feedBack, divPosts,
    divFeeds, modal,
  } = elements;

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
  };

  const renderFeedsCard = () => {
    const { feeds } = state;
    if (!divFeeds.hasChildNodes()) {
      const cardfeeds = createPostsOrFeedsCard(i18n.t('feeds'));
      divFeeds.append(cardfeeds);
    }
    const list = divFeeds.querySelector('ul');
    list.innerHTML = '';
    const itemsFeeds = feeds.map((feed) => {
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
    });
    list.append(...itemsFeeds);
  };

  const renderPostsCard = () => {
    const { posts, ui } = state;
    if (!divPosts.hasChildNodes()) {
      const cardPosts = createPostsOrFeedsCard(i18n.t('posts'));
      divPosts.append(cardPosts);
    }
    const list = divPosts.querySelector('ul');
    list.innerHTML = '';
    const itemsPosts = posts.map((post) => {
      const li = document.createElement('li');
      const link = document.createElement('a');
      const btn = document.createElement('button');

      li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
      link.classList.add('fw-bold');
      link.textContent = post.title;
      link.href = post.link;
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
      link.dataset.id = post.id;

      btn.setAttribute('type', 'button');
      btn.dataset.id = post.id;
      btn.dataset.bsToggle = 'modal';
      btn.dataset.bsTarget = '#modal';
      btn.textContent = i18n.t('show');
      btn.classList.add('btn', 'btn-outline-primary', 'btn-sm');

      if (ui.showedPosts.has(post.id)) {
        link.classList.remove('fw-bold');
        link.classList.add('fw-normal', 'link-secondary');
      } else {
        link.classList.add('fw-bold');
      }

      li.append(link, btn);
      return li;
    });
    list.append(...itemsPosts);
  };

  const renderModalCard = () => {
    const { posts, ui } = state;
    const titleModal = modal.querySelector('.modal-title');
    const descriptionModal = modal.querySelector('.modal-body');
    const footerModal = modal.querySelector('.modal-footer');
    const linkBtn = footerModal.querySelector('a');
    const watchedPost = posts.find((post) => post.id === ui.id);
    titleModal.textContent = watchedPost.title;
    descriptionModal.textContent = watchedPost.description;
    linkBtn.setAttribute('href', watchedPost.link);
  };

  const hendleErrorsForm = (value) => {
    const { form } = state;

    if (value === 'fail') {
      urlInput.classList.add('is-invalid');
      feedBack.classList.add('text-danger');
      feedBack.textContent = i18n.t(form.errors.key);
      submitButton.removeAttribute('disabled');
      urlInput.removeAttribute('disabled');
      urlInput.focus();
    }
    if (value === 'sending') {
      submitButton.removeAttribute('disabled');
      urlInput.removeAttribute('disabled');
      urlInput.classList.remove('is-invalid');
      feedBack.classList.remove('text-danger');
      feedBack.textContent = '';
    }
  };

  const hendleErrorsLoadingProcess = (value) => {
    const { loadingProcess } = state;
    if (value === 'fail') {
      urlInput.classList.add('is-invalid');
      feedBack.classList.add('text-danger');
      feedBack.textContent = i18n.t(loadingProcess.errors);
      submitButton.removeAttribute('disabled');
      urlInput.removeAttribute('disabled');
      urlInput.focus();
    }
    if (value === 'succsess') {
      urlInput.classList.remove('is-invalid');
      feedBack.classList.remove('text-danger');
      feedBack.classList.add('text-success');
      feedBack.textContent = i18n.t('successLoad');
      submitButton.removeAttribute('disabled');
      urlInput.removeAttribute('disabled');
      urlInput.value = '';
      urlInput.focus();
    }
    if (value === 'loading') {
      urlInput.setAttribute('disabled', '');
      submitButton.setAttribute('disabled', '');
    }
  };

  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'form.status':
        hendleErrorsForm(value);
        break;
      case 'loadingProcess.status':
        hendleErrorsLoadingProcess(value);
        break;
      case 'posts':
        renderPostsCard();
        break;
      case 'feeds':
        renderFeedsCard();
        break;
      case 'ui.showedPosts':
        renderModalCard();
        renderPostsCard();
        break;
      default:
        console.error('Unknown path:', path);
        break;
    }
  });
  return watchedState;
};

export default watch;
