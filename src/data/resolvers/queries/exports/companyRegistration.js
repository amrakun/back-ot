/* eslint-disable max-len */

import cf from 'cellref';
import { readTemplate, generateXlsx } from '../../../utils';

const companyRegistration = async supplier => {
  const { workbook } = await readTemplate('company_registration');

  const sheet = workbook.sheet(0);

  const basicInfo = supplier.basicInfo || {};
  const contactInfo = supplier.contactInfo || {};
  const managementTeamInfo = supplier.managementTeamInfo || {};
  const shareholderInfo = supplier.shareholderInfo || {};
  const groupInfo = supplier.groupInfo || {};
  const certificateInfo = supplier.certificateInfo || {};

  let index = 1;

  sheet.column('B').width(40);
  sheet.column('C').width(40);

  const fillValue = (title, value, fill) => {
    const style = {
      horizontalAlignment: 'left',
      wrapText: true,
    };

    if (fill) {
      style.fill = fill;
      style.fontColor = 'ffffff';
    }

    sheet
      .cell(index, 2)
      .style(style)
      .value(title);
    sheet
      .cell(index, 3)
      .style(style)
      .value(value || '');

    index++;
  };

  const fillSection = title => {
    sheet
      .range(`${cf(`R${index}C2`)}:${cf(`R${index}C3`)}`)
      .merged(true)
      .style({
        horizontalAlignment: 'center',
        fill: 'f47721',
        fontColor: 'ffffff',
        bold: true,
      })
      .value(title);
    index++;
  };

  fillValue('Company name (English)', basicInfo.enName, '2496a9');
  fillValue('Vendor number', basicInfo.sapNumber, '2496a9');
  fillValue('Tier type', supplier.tierType, '2496a9');

  fillSection('Section 1. Company Information');

  fillValue('Address', '');
  fillValue('Address Line 1', basicInfo.address);
  fillValue('Address Line 2', basicInfo.address2);
  fillValue('Address Line 3', basicInfo.address3);
  fillValue('Town or city', basicInfo.townOrCity);
  fillValue('Province', basicInfo.province);
  fillValue('Zip code', basicInfo.zipCode);
  fillValue('Country', basicInfo.country);
  fillValue('Registered in country', basicInfo.registeredInCountry);
  fillValue('Registered in aimag', basicInfo.registeredInAimag);
  fillValue('Registered in sum', basicInfo.registeredInSum);
  fillValue('Is Chinese state owned entity', basicInfo.isChinese ? 'yes' : 'no');
  fillValue('Is registered sub-contractor', basicInfo.isSubcontractor ? 'yes' : 'no');
  fillValue('Closest matching corporate structure', basicInfo.corporateStructure);
  fillValue('Company Registration Number', basicInfo.registrationNumber);
  fillValue(
    'Certificate of Registration',
    basicInfo.certificateOfRegistration ? basicInfo.certificateOfRegistration.url : '',
  );
  fillValue('Company web site', basicInfo.website);
  fillValue('Company email address', basicInfo.email);
  fillValue('Foreign ownership percentage', basicInfo.foreignOwnershipPercentage);
  fillValue('Total number of employees', basicInfo.totalNumberOfEmployees);
  fillValue('Total number of mongolian employees', basicInfo.totalNumberOfMongolianEmployees);
  fillValue('Total number of Umnugovi employees', basicInfo.totalNumberOfUmnugoviEmployees);

  // contact details =====================
  fillSection('Section 2. Contact Details');

  fillValue('Name', contactInfo.name);
  fillValue('Job title', contactInfo.jobTitle);
  fillValue('Address', contactInfo.address);
  fillValue('Address 2', contactInfo.address2);
  fillValue('Address 3', contactInfo.address3);
  fillValue('Phone', contactInfo.phone);
  fillValue('Phone 2', contactInfo.phone2);
  fillValue('Email address', contactInfo.email);

  // management team =====================
  fillSection('Section 3. Management Team');

  const renderManagementTeam = (title, value) => {
    sheet.cell(index, 2).value(title);
    index++;

    fillValue('Name', value.name);
    fillValue('Job title', value.jobTitle);
    fillValue('Phone', value.phone);
    fillValue('Email', value.email);
  };

  const {
    managingDirector = {},
    executiveOfficer = {},
    salesDirector = {},
    financialDirector = {},
  } = managementTeamInfo;

  renderManagementTeam('Managing Director', managingDirector);
  renderManagementTeam('Executive Officer', executiveOfficer);
  renderManagementTeam('Sales Director', salesDirector);
  renderManagementTeam('Financial Director', financialDirector);

  const renderOtherMember = (title, value) => {
    sheet.cell(index, 2).value(title);
    index++;

    fillValue('Name', value.name);
    fillValue('Job title', value.jobTitle);
    fillValue('Phone', value.phone);
    fillValue('Email', value.email);
  };

  const otherMember1 = managementTeamInfo.otherMember1;
  const otherMember2 = managementTeamInfo.otherMember2;
  const otherMember3 = managementTeamInfo.otherMember3;

  if (otherMember1) {
    renderOtherMember('Other member 1', otherMember1);
  }

  if (otherMember2) {
    renderOtherMember('Other member 2', otherMember2);
  }

  if (otherMember3) {
    renderOtherMember('Other member 3', otherMember3);
  }

  // company shareholders ===============
  const shareholders = shareholderInfo.shareholders || [];

  fillSection('Section 4. Company Shareholder Information');

  for (let shareholder of shareholders) {
    fillValue('Name', shareholder.name);
    fillValue('Job title', shareholder.jobTitle);
    fillValue('Share percentage', shareholder.percentage || 0);
  }

  // groupInfo ===================
  fillSection('Section 5. Group Information');

  fillValue('Has a parent company', groupInfo.hasParent ? 'yes' : 'no');
  fillValue('Parent company is existing supplier?', groupInfo.isParentExistingSup ? 'yes' : 'no');
  fillValue('Parent company name', groupInfo.parentName);
  fillValue('Parent company address', groupInfo.parentAddress);
  fillValue('Registration number of parent company', groupInfo.parentRegistrationNumber);
  fillValue('Company role', groupInfo.role);

  if (groupInfo.role == 'EOM') {
    sheet.cell(index, 2).value('Factory name');
    sheet.cell(index, 3).value('Town or City');
    sheet.cell(index, 4).value('Country');
    sheet.cell(index, 5).value('Associated Product');
    index++;

    for (let factory of groupInfo.factories || []) {
      sheet.cell(index, 2).value(factory.name || '');
      sheet.cell(index, 3).value(factory.townOrCity || '');
      sheet.cell(index, 4).value(factory.country || '');
      sheet.cell(index, 5).value(factory.productCodes || '');
      index++;
    }
  }

  fillValue('Is exclusive distributor?', groupInfo.isExclusiveDistributor ? 'yes' : 'no');
  fillValue('Primary manufacturer name', groupInfo.primaryManufacturerName);
  fillValue('Country of primary manufacture', groupInfo.countryOfPrimaryManufacturer);

  // Product and Services ==========
  fillSection('Section 6. Product and Services');

  fillValue('Product/Service code', (supplier.productsInfo || []).join());

  // Capacity building certificate ===============
  fillSection('Capacity building certificate');

  fillValue('Company received capacity building certificate', certificateInfo.description);
  fillValue(
    'Certificate url',
    (certificateInfo && certificateInfo.file && certificateInfo.file.url) || '',
  );

  return generateXlsx(workbook, 'company_detail_export');
};

export default companyRegistration;
