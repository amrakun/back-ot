const getBasicInfo = (obj, key) => (obj.basicInfo && obj.basicInfo[key] ? obj.basicInfo[key] : '');
const getBasicInfoAsInt = (obj, key) =>
  obj.basicInfo && obj.basicInfo[key] ? obj.basicInfo[key] : 0;
const getBasicInfoAsBoolean = (obj, key) =>
  obj.basicInfo && obj.basicInfo[key] && obj.basicInfo[key] === true ? true : false;

const ReportsSupplier = {};

for (let key of [
  'enName',
  'mnName',
  'address',
  'address2',
  'address3',
  'townOrCity',
  'country',
  'province',
  'registeredInCountry',
  'registeredInAimag',
  'registeredInSum',
  'website',
  'email',
  'foreignOwnershipPercentage',
]) {
  ReportsSupplier[key] = obj => getBasicInfo(obj, key);
}

for (let key of [
  'registrationNumber',
  'totalNumberOfEmployees',
  'totalNumberOfMongolianEmployees',
  'totalNumberOfUmnugoviEmployees',
]) {
  ReportsSupplier[key] = obj => getBasicInfoAsInt(obj, key);
}

for (let key of [
  'isRegisteredOnSup',
  'isPrequalified',
  'isProductsInfoValidated',
  'isChinese',
  'certificateOfRegistration',
]) {
  ReportsSupplier[key] = obj => getBasicInfoAsBoolean(obj, key);
}

export default {
  ...ReportsSupplier,
  difotScores: obj => obj.difotScores || [],
  certificateOfRegistration: obj =>
    obj &&
    obj.basicInfo.certificateOfRegistration &&
    obj.basicInfo.certificateOfRegistration.name &&
    obj.basicInfo.certificateOfRegistration.url
      ? true
      : false,
  phone: obj => (obj.contactInfo ? obj.contactInfo.phone : ''),
};
