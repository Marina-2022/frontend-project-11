export default {
  string: {
    url: () => ({ key: 'errors.invalidUrl' }),
    required: () => ({ key: 'errors.required' }),
  },
  mixed: {
    notOneOf: () => ({ key: 'errors.sameRss' }),
  },
};
