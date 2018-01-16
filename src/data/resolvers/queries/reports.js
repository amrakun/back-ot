import { Companies, Tenders } from '../../../db/models';

const updateFilter = (filter, additionalFilter) => ({ ...filter, ...additionalFilter });

const reportsSuppliersQuery = {
  async reportsSuppliers(root, { dateInterval, affiliation, sectCodes, statuses }) {
    // console.log('affiliation: ', affiliation);
    let filter = {};

    if (affiliation && Object.keys(affiliation).length > 0) {
      filter = affiliation.country
        ? updateFilter(filter, { 'basicInfo.country': affiliation.country })
        : filter;

      filter = affiliation.province
        ? updateFilter(filter, { 'basicInfo.province': affiliation.province })
        : filter;
    }

    // if (statuses && statuses.length > 0) {
    //   filter = updateFilter(filter, {
    //     'investigations.status': { $in: statuses },
    //   });
    // }

    // console.log(await (Companies.find({}).count()));
    // console.log('filter: ', filter);
    return Companies.find(filter);
  },

  reportsTenders(root, { type, publishDate, closeDate }) {
    const filter = {};

    return Tenders.find(filter);
  },
};

export default reportsSuppliersQuery;
