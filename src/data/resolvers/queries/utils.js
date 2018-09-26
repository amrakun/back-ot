/* eslint-disable no-underscore-dangle */

import { Companies } from '../../../db/models';

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

export const supplierFilter = async (query, search, hook) => {
  if (search) {
    const suppliers = await Companies.find({
      $or: [
        { 'basicInfo.mnName': new RegExp(`.*${search}.*`, 'i') },
        { 'basicInfo.enName': new RegExp(`.*${search}.*`, 'i') },
        { 'basicInfo.sapNumber': new RegExp(`.*${search}.*`, 'i') },
      ],
    });

    const supplierIds = suppliers.map(s => s._id);

    query.supplierId = { $in: hook ? hook(supplierIds) : supplierIds };
  }

  return query;
};

export const fixValue = value => {
  if (typeof value === 'boolean') {
    return value ? 'YES' : 'NO';
  }

  if (value === 'true') {
    return 'YES';
  }

  if (value === 'false') {
    return 'NO';
  }

  return value;
};
