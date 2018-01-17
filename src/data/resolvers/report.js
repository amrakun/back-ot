const ReportsSupplier = {};

for (let key of []) {
  ReportsSupplier[key] = obj => getBasicInfo(obj, key);
}

for (let key of []) {
  ReportsSupplier[key] = obj => getBasicInfoAsInt(obj, key);
}

for (let key of []) {
  ReportsSupplier[key] = obj => getBasicInfoAsBoolean(obj, key);
}

export default {
  ...ReportsSupplier,
};
