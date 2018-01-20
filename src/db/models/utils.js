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

/*
 * Checks that given date is today
 */
export const isToday = date => {
  const startOfDay = moment().startOf('day');
  const nextDay = moment(startOfDay).add(1, 'days');
  const mDate = moment(date);

  return (mDate > startOfDay) & (mDate < nextDay);
};
