import moment from 'moment';

/*
 * Mongoose field options wrapper
 */
export const field = options => {
  const { type, optional } = options;

  if (type === String && !optional) {
    options.validate = /\S+/;
  }

  return options;
};

const getNow = () => {
  return new Date();
};

/*
 * Doing this to mock date time now in test
 */
const utils = {
  getNow,
};

/*
 * Checks that given date is reached
 */
export const isReached = date => moment(date) <= utils.getNow();

export default utils;
