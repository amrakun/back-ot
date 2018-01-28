/* eslint-disable no-underscore-dangle */

export const paginate = (collection, params) => {
  const { page, perPage, sortField, sortDirection } = params || {};

  let sortedCollection = collection;

  if (sortField) {
    sortedCollection = collection.sort({ [sortField]: sortDirection || 1 });
  }

  if (!page && !perPage) {
    return sortedCollection;
  }

  const _page = Number(page || '1');
  const _limit = Number(perPage || '20');

  return sortedCollection.limit(_limit).skip((_page - 1) * _limit);
};
