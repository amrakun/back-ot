export const ROLES = {
  ADMIN: 'admin',
  CONTRIBUTOR: 'contributor',
};

export const PERMISSION_LIST = [
  'physicalAuditsAdd',
  'configsSaveImprovementPlanDow',
  'companiesValidateProductsInfo',
  'blockedCompaniesBlock',
  'blockedCompaniesUnblock',
  'tenderResponses',
  'tendersEdit',
  'tendersCancel',
  'tendersExport',
  'tendersSendRegretLetter',
  'tenderResponsesRfqBidSummaryReport',
  'tendersAward',
  'reportsTendersExport',
  'reportsAuditExport',
  'companyRegistrationExport',
  'usersAdd',
  'usersEdit',
  'usersToggleState',
  'tenderResponsesEoiShortList',
  'tenderResponsesEoiBidderList',
  'feedbacksAdd',
  'companiesGenerateDifotScoreList',
  'companiesGenerateDueDiligenceList',
  'companiesAddDifotScores',
  'qualificationsPrequalify',
  'qualificationsSaveTierType',
  'auditsAdd',
  'auditReport',
  'auditsBuyerSendFiles',
  'dueDiligencesEnableState',
];

export const PERMISSIONS = [
  {
    name: 'Pre-qualification',
    permissions: ['qualificationsPrequalify', 'qualificationsSaveTierType'],
  },
  {
    name: 'Qualification',
    permissions: [
      'physicalAuditsAdd',
      'configsSaveImprovementPlanDow',
      'auditsAdd',
      'auditReport',
      'auditsBuyerSendFiles',
    ],
  },
  {
    name: 'Validation',
    permissions: ['companiesValidateProductsInfo'],
  },
  {
    name: 'Difot score',
    permissions: ['companiesGenerateDifotScoreList', 'companiesAddDifotScores'],
  },
  {
    name: 'Due diligence',
    permissions: ['dueDiligencesEnableState', 'companiesGenerateDueDiligenceList'],
  },
  {
    name: 'Blocking',
    permissions: ['blockedCompaniesBlock', 'blockedCompaniesUnblock'],
  },
  {
    name: 'Success feedback',
    permissions: ['feedbacksAdd'],
  },
  {
    name: 'RFQ/EOI responses',
    permissions: ['tendersEdit', 'tendersCancel', 'tendersExport', 'tendersSendRegretLetter'],
  },
  {
    name: 'RFQ responses',
    permissions: ['tenderResponses', 'tenderResponsesRfqBidSummaryReport', 'tendersAward'],
  },
  {
    name: 'EOI responses',
    permissions: ['tenderResponses', 'tenderResponsesEoiShortList', 'tenderResponsesEoiBidderList'],
  },
  {
    name: 'Report',
    permissions: ['reportsTendersExport', 'reportsAuditExport', 'companyRegistrationExport'],
  },
  {
    name: 'Settings',
    permissions: ['usersAdd', 'usersEdit', 'usersToggleState'],
  },
];

export const MODULES = {
  DASHBOARD: 'dashboard',
  SUPPLIERS: 'companies',
  PRE_QUALIFICATION: 'prequalification-status',
  QUALIFICATION_SEND: 'audit',
  QUALIFICATION_RESPONSES_DESKTOP: 'audit/responses',
  QUALIFICATION_RESPONSES_PHYSICAL: 'audit/responses-physical',
  QUALIFICATION_R_I_PLAN: 'audit/reports',
  VALIDATION: 'validation',
  DIFOT_SCORE: 'difot',
  DUE_DILIGENCE: 'due-diligence',
  SUCCESS_FEEDBACK_REQUEST_FEEDBACK: 'feedback',
  SUCCESS_FEEDBACK_RESPONSES: 'feedback/responses',
  BLOCK_SUPPLIER: 'blocking',
  RFQ: 'rfq',
  EOI_RESPONSES: 'eoi',
  REPORTS: 'report',
  LOGS: 'logs',
  SETTINGS_TEMPLATES: 'settings/templates',
  SETTINGS_EXPIRY_DATES: 'settings/manage-expiry-dates',
  SETTINGS_USER_LIST: 'user-list',
  ALL: [
    'dashboard',
    'companies',
    'prequalification-status',
    'audit',
    'audit/responses',
    'audit/responses-physical',
    'audit/reports',
    'validation',
    'difot',
    'due-diligence',
    'feedback',
    'feedback/responses',
    'blocking',
    'rfq',
    'eoi',
    'report',
    'logs',
    'settings/templates',
    'settings/manage-expiry-dates',
    'user-list',
  ],
};

export const MODULES_TO_TEXT = {
  dashboard: 'Dashboard',
  companies: 'Suppliers',
  'prequalification-status': 'Pre-qualification',
  audit: 'Qualification',
  'audit/responses': 'Qualification Responses (desktop)',
  'audit/responses-physical': 'Qualification Responses (physical)',
  'audit/reports': 'Qualifications Report & Plan',
  validation: 'Validation',
  difot: 'DIFOT score',
  'due-diligence': 'Due Dilligence',
  feedback: 'Success feedback - request feedback',
  'feedback/responses': 'Success feedback - responses',
  blocking: 'Block supplier',
  rfq: 'RFQ responses',
  eoi: 'EOI responses',
  report: 'Report',
  logs: 'Log',
  'settings/templates': 'Settings - Templates',
  'settings/manage-expiry-dates': 'Settings - Manage expiry dates',
  'user-list': 'Settings - Manage users',
};

export const LOG_TYPES = {
  TENDER: 'tender',
  TENDER_MESSAGE: 'composeMessage',
  TENDER_RESPONSE: 'tenderResponse',
  BLOCKED_COMPANY: 'blockedCompany',
  COMPANY: 'company',
  QUALIFICATION: 'qualification',
  USER: 'user',
  DESKTOP_AUDIT: 'desktop_audit',
};

export const productsMap = {
  a00000: 'A00000 - Construction',
  a01000: 'A01000 - Construction Contractors',
  a01001: "A01001 - Large EPCM's >$100M/greenfield projects",
  a01002: "A01002 - Small EPCM's (<$100M)",
  a02000: 'A02000 - Construction Services',
  a02001: 'A02001 - Architectural and Finishes Contractors',
  a02002: 'A02002 - Building Materials',
  a02003: 'A02003 - Buildings - Prefab and temporary',
  a02004: 'A02004 - Cables',
  a02005: 'A02005 - Cement',
  a02006: 'A02006 - Structural & Civil Contractors',
  a02007: 'A02007 - Construction Materials',
  a02008: 'A02008 - Construction Specialised Equipment',
  a02009: 'A02009 - Couplings and Gear Units',
  a02010: 'A02010 - Couriers',
  a02011: 'A02011 - Electrical & Instrumentation Contractors',
  a02012: 'A02012 - Electrical Equipment & Parts',
  a02013: 'A02013 - Engines and Generators',
  a02014: 'A02014 - Fans and Blowers',
  a02015: 'A02015 - Goods Handling',
  a02016: 'A02016 - Heating & Heatng Exchange Equipment',
  a02017: 'A02017 - HVAC & Building Services Equipment',
  a02018: 'A02018 - Instrumentation and Automation',
  a02019: 'A02019 - Material Handling  Equipment',
  a02020: 'A02020 - Mechanical Contractors',
  a02021: 'A02021 - Piping',
  a02022: 'A02022 - Special Process Equipment & Packages',
  a02023: 'A02023 - Steel and Structural Products',
  a02024: 'A02024 - Tanks',
  a02025: 'A02025 - Turbines',
  a02026: 'A02026 - Valves and Actuators',
  a02027: 'A02027 - Warehousing',
  b00000: 'B00000 - Energy',
  b01000: 'B01000 - Alternate Energy',
  b01001: 'B01001 - Compressed Air',
  b01002: 'B01002 - Steam',
  b01003: 'B01003 - Thermal Coal',
  b01004: 'B01004 - Domestic Gas',
  b02000: 'B02000 - Fuel',
  b02001: 'B02001 - Diesel',
  b02002: 'B02002 - Fuel oils',
  b02003: 'B02003 - Natural Gas',
  b02004: 'B02004 - Petroleum',
  b02005: 'B02005 - Propane (LPG)',
  b02006: 'B02006 - Thermal coal',
  b02007: 'B02007 - Biofuel',
  b02008: 'B02008 - Liquid natural gas',
  b02009: 'B02009 - Fuel terminal managemnt/maintenance serv',
  b03000: 'B03000 - Power',
  b03001: 'B03001 - Electricity - Domestic',
  b03002: 'B03002 - Electricity - Industrial',
  b03003: 'B03003 - Power transmission',
  c00000: 'C00000 - Fixed Plant & Equipment',
  c01000: 'C01000 - Materials Movement',
  c01001: 'C01001 - Bucket wheels',
  c01002: 'C01002 - Conveyor Belting',
  c01003: 'C01003 - Conveyor Equipment & Supplies',
  c01004: 'C01004 - Reclaimers',
  c01005: 'C01005 - Ship Loaders',
  c01006: 'C01006 - Stackers & reclaimers',
  c02000: 'C02000 - Materials Processing',
  c02001: 'C02001 - Crushers and Mills',
  c02002: 'C02002 - Crushing Consumables/Grinding Media',
  c02003: 'C02003 - Heavy Media Separation Spares',
  c02004: 'C02004 - Process Equipment',
  c02005: 'C02005 - Screens',
  c03000: 'C03000 - Rail',
  c03001: 'C03001 - Rail - fixed assets ie ballast,sleepers',
  c04000: 'C04000 - Smelting equipment',
  c04001: 'C04001 - Pot Shells and Superstructure',
  c04002: 'C04002 - Smelter Rectifiers',
  d00000: 'D00000 - Logistics',
  d01000: 'D01000 - Marine Equipment',
  d01001: 'D01001 - Barges',
  d01002: 'D01002 - Marine Vessels',
  d01003: 'D01003 - Ore Cariers',
  d01004: 'D01004 - Tugs',
  d01005: 'D01005 - Marine Parts and Spares',
  d02000: 'D02000 - Transport',
  d02001: 'D02001 - 3rd party warehousing',
  d02002: 'D02002 - Air freight',
  d02003: 'D02003 - Barge freight',
  d02004: 'D02004 - Bulk Freight',
  d02005: 'D02005 - Container - stuffing / packing',
  d02006: 'D02006 - Driver services leasing',
  d02007: 'D02007 - International freight forwarding',
  d02008: 'D02008 - Marine container',
  d02009: 'D02009 - Marine Port Services',
  d02010: 'D02010 - Parcel freight / Couriers',
  d02011: 'D02011 - Rail freight',
  d02012: 'D02012 - Renting of terminal space',
  d02013: 'D02013 - Road freight',
  d02014: 'D02014 - Road freight on LTL',
  d02015: 'D02015 - Road freight on TL',
  d02016: 'D02016 - Sea freight',
  d02017: 'D02017 - Ship surveyer',
  e00000: 'E00000 - Mining equipment',
  e01000: 'E01000 - Drilling & consumables',
  e01001: 'E01001 - Drill Bits (heavy)',
  e01002: 'E01002 - Drilling Machine Parts',
  e01003: 'E01003 - Drill Steel & Consumables',
  e01004: 'E01004 - Drilling services',
  e01005: 'E01005 - Drilling machines',
  e01006: 'E01006 - Underground Drill Parts',
  e01007: 'E01007 - Underground Drills',
  e02000: 'E02000 - Mining equipment & Parts',
  e02001: 'E02001 - Dozers',
  e02002: 'E02002 - Hydraulic Excavators',
  e02003: 'E02003 - Haul Trucks',
  e02004: 'E02004 - HME Ancillary Equipment',
  e02005: 'E02005 - HME Maintenance services',
  e02006: 'E02006 - Front End Loaders',
  e02007: 'E02007 - Shovels',
  e02008: 'E02008 - Draglines',
  e02009: 'E02009 - Cranes',
  e02010: 'E02010 - Undergroung Mining equipment incl LHD',
  e02011: 'E02011 - HME Ancillary Equipment Parts',
  e02012: 'E02012 - Haul Truck Parts',
  e02013: 'E02013 - Dragline / Rope Shovel Parts',
  e02014: 'E02014 - Industrial Engines',
  e02015: 'E02015 - Industrial Engine Parts',
  e02016: 'E02016 - Drilling machines',
  e02017: 'E02017 - Drilling machine Parts',
  e03000: 'E03000 - Light Mobile Equipment',
  e03001: 'E03001 - Light Mobile Equipment',
  e03002: 'E03002 - Light Vehicle leases & purchases',
  e03003: 'E03003 - Light vehicle maintenance',
  e03004: 'E03004 - Mobile equipment (HME / LME) hire',
  e03005: 'E03005 - LME maintenance services',
  e03006: 'E03006 - LME parts',
  e03007: 'E03007 - Off-road passenger vehicles',
  e03008: 'E03008 - On-road passenger vehicles',
  e03009: 'E03009 - Forklifts',
  e04000: 'E04000 - Mining Equipment & Parts',
  e04001: 'E04001 - HME Ancillary Equipment Parts',
  e04002: 'E04002 - Haul Truck Parts',
  e04003: 'E04003 - Dragline / Rope Shovel Parts',
  e04004: 'E04004 - Draglines / Rope Shovels',
  e04005: 'E04005 - Heavy Ropes/Dragline',
  e04006: 'E04006 - HME Hire',
  e04007: 'E04007 - Industrial Engines',
  e04008: 'E04008 - Industrial Engine Parts',
  e05000: 'E05000 - Rail',
  e05001: 'E05001 - Automatic train operations (ATO)',
  e05002: 'E05002 - Locomotive parts',
  e05003: 'E05003 - Locomotives',
  e05004: 'E05004 - Ore car parts',
  e05005: 'E05005 - Ore Car resheeting',
  e05006: 'E05006 - Ore cars',
  e05007: 'E05007 - Plant Maint Service Rail Track',
  e05008: 'E05008 - Rail Equipment & Components',
  e05009: 'E05009 - Signaling and switch gear',
  e06000: 'E06000 - Tyres & Belting',
  e06001: 'E06001 - Light Vehicle & mobile equipment tyres',
  e06002: 'E06002 - OTR tyres for HME',
  e06003: 'E06003 - Wheels & Rims',
  e06004: 'E06004 - Tyre services',
  e06005: 'E06005 - Conveyor belting',
  'e07000 - underground mining equipment': 'E07000 - Underground Mining Equipment',
  e07001: 'E07001 - Underground Mining equipment incl LHD',
  e08000: 'E08000 - Mining Technology',
  e08001: 'E08001 - Equipment technologies',
  f00000: 'F00000 - MRO (maintenance, repair, operationals) & Consumables',
  f01000: 'F01000 - General MRO',
  f01001: 'F01001 - Abrasives and grinding materials',
  f01002: 'F01002 - Baghouse filtration',
  f01003: 'F01003 - Bearings/Power Transmission',
  f01004: 'F01004 - Bed Filters',
  f01005: 'F01005 - Belting',
  f01006: 'F01006 - Ceramic products',
  f01007: 'F01007 - Clothing/Uniforms',
  f01008: 'F01008 - Compressors',
  f01009: 'F01009 - Cranes and spares',
  f01010: 'F01010 - Fasteners',
  f01011: 'F01011 - Filters/Filter Media and Combo Bags',
  f01012: 'F01012 - Furnace spares',
  f01013: 'F01013 - Gaskets / seals / packing',
  f01014: 'F01014 - Grease/Masonite (Capuchon)',
  f01015: 'F01015 - Ground Engaging Tools (GET)',
  f01016: 'F01016 - Hand tools',
  f01017: 'F01017 - Hoses and fittings',
  f01018: 'F01018 - HVAC parts',
  f01019: 'F01019 - Hydraulic Equipment & Components',
  f01020: 'F01020 - Industrial Supplies',
  f01021: 'F01021 - Industrial/Marine Coatings',
  f01022: 'F01022 - Laboratory Supplies & Maintenance',
  f01023: 'F01023 - Wire Rope / Slings',
  f01024: 'F01024 - Lubricants',
  f01025: 'F01025 - Metals (copper brass steel etc.)',
  f01026: 'F01026 - Pipes/fittings/valves',
  f01027: 'F01027 - Pneumatics',
  f01028: 'F01028 - Power transmission / gearboxes',
  f01029: 'F01029 - Process filters',
  f01030: 'F01030 - Pumps  /Valves / Fittings',
  f01031: 'F01031 - Pumps/compressors/parts',
  f01033: 'F01033 - Rubber/rubber supplies',
  f01034: 'F01034 - Safety & Fire Protection',
  f01035: 'F01035 - Safety consumables',
  f01036: 'F01036 - Sand/gravel',
  f01037: 'F01037 - Stackers / Reclaimers parts',
  f01038: 'F01038 - Steel and specialty metals',
  f01039: 'F01039 - Timber/wood products',
  f01040: 'F01040 - Transmission belts and chains',
  f01041: 'F01041 - Welding equipment and supplies',
  f01042: 'F01042 - Heavy Ropes / Dragline',
  f02000: 'F02000 - Electrical and Instrumentation',
  f02001: 'F02001 - Electrical Hardware & Equipment',
  f02002: 'F02002 - Batteries',
  f02003: 'F02003 - Electrical Consumables Supplies',
  f02004: 'F02004 - Instrumentation Equipment & Components',
  f03000: 'F03000 - Lubricants',
  f03001: 'F03001 - Greases',
  f03002: 'F03002 - Oils',
  f03003: 'F03003 - Coolants',
  f04000: 'F04000 - Office Consumables',
  f04001: 'F04001 - Office furniture',
  f04002: 'F04002 - Office machines and equipment',
  f04003: 'F04003 - Office Supplies',
  f04004: 'F04004 - Publications',
  g00000: 'G00000 - Production Consumables',
  g01000: 'G01000 - Packaging for Rio Tinto product sales',
  g01001: 'G01001 - Labels & metalized logos',
  g01002: 'G01002 - Packaging',
  g01003: 'G01003 - Steel strapping',
  g01004: 'G01004 - Paints / Marine Coatings',
  g01005: 'G01005 - Film - PE',
  g01006: 'G01006 - Film - Plain',
  g01007: 'G01007 - Film - PVC',
  g01008: 'G01008 - Fiber Glass',
  g01009: 'G01009 - Tissue Paper',
  g01010: 'G01010 - Pallets',
  g01011: 'G01011 - Bulk Bags',
  g01012: 'G01012 - Green Timber / Lumber',
  g02000: 'G02000 - Aluminium and Steel Input Materials',
  g02001: 'G02001 - Anode Bar',
  g02002: 'G02002 - Buss bar, collector straps, flexes',
  g02003: 'G02003 - Cathodes',
  g02004: 'G02004 - Collector bars and pot steel',
  g02005: 'G02005 - Copper',
  g02006: 'G02006 - Grain refiners',
  g02007: 'G02007 - Hardeners',
  g02008: 'G02008 - Magnesium',
  g02009: 'G02009 - Manganese',
  g02010: 'G02010 - Nickel',
  g02011: 'G02011 - Pure metals',
  g02012: 'G02012 - Silicon',
  g02013: 'G02013 - Steel rods',
  g02014: 'G02014 - Steel shot and steel balls',
  g03000: 'G03000 - Consumables',
  g03001: 'G03001 - Process consumables',
  g03002: 'G03002 - Cast house consumables',
  g03003: 'G03003 - Castings',
  g03004: 'G03004 - Cylinders / plates',
  g03005: 'G03005 - Dross tolling',
  g03006: 'G03006 - Felts',
  g03007: 'G03007 - Steel for extrusion dies',
  g03008: 'G03008 - Production Thermocouples',
  g03009: 'G03009 - Rolling oil & additives',
  g03010: 'G03010 - Buss bar, collector straps, flexes',
  g03011: 'G03011 - Collector bars and pot steel',
  g03012: 'G03012 - Copper',
  g03013: 'G03013 - Grain refiners',
  g03014: 'G03014 - Hardeners',
  g03015: 'G03015 - Nickel',
  g03016: 'G03016 - Pure metals',
  g03017: 'G03017 - Steel rods',
  g03018: 'G03018 - Steel shot and steel balls',
  g04000: 'G04000 - Explosives',
  g04001: 'G04001 - Ammonium nitrate & bulk explosives',
  g04002: 'G04002 - Explosives Accessories',
  g04003: 'G04003 - Packaged explosives',
  g04004: 'G04004 - Drill and Blast Services',
  g05000: 'G05000 - Process Chemicals',
  g05001: 'G05001 - Acid',
  g05002: 'G05002 - Chlorine',
  g05003: 'G05003 - Degreasing and Cleaning',
  g05004: 'G05004 - Ethanol',
  g05005: 'G05005 - Ferro silicon',
  g05006: 'G05006 - Flocculants',
  g05007: 'G05007 - Industrial Gases',
  g05008: 'G05008 - Inks',
  g05009: 'G05009 - Lime',
  g05010: 'G05010 - Metal Pre-treat/Lacquers',
  g05011: 'G05011 - Organic',
  g05012: 'G05012 - Other Process Chemicals',
  g05013: 'G05013 - Oxygen',
  g05014: 'G05014 - Resins',
  g05015: 'G05015 - Sealants',
  g05016: 'G05016 - Solvents',
  g05017: 'G05017 - Water - industrial',
  g05018: 'G05018 - Wax',
  g05020: 'G05020 - Graphite',
  g05021: 'G05021 - Graphite tubes',
  g05022: 'G05022 - Iron',
  g05023: 'G05023 - Lithium carbonate',
  g05024: 'G05024 - Magnesium oxide',
  g05025: 'G05025 - Metallurgical Coal',
  g05026: 'G05026 - Soda ash',
  g05027: 'G05027 - Bone Ash',
  g06000: 'G06000 - Raw Materials',
  g06001: 'G06001 - Alloys',
  g06002: 'G06002 - Alumina',
  g06003: 'G06003 - Aluminium Flouride',
  g06004: 'G06004 - Anthracite',
  g06005: 'G06005 - Bath / Cryolite',
  g06006: 'G06006 - Bauxite',
  g06007: 'G06007 - Bone Ash',
  g06008: 'G06008 - Coke (Petroleum) â€“ Calcined (CPC)',
  g06009: 'G06009 - Carbon',
  g06010: 'G06010 - Caustic Soda',
  g06011: 'G06011 - Coke (metallurgical)',
  g06012: 'G06012 - Coke (Petroleum) â€“ Green (GPC)',
  g06013: 'G06013 - Electrodes',
  g06014: 'G06014 - Fluorspar',
  g06015: 'G06015 - Graphite',
  g06016: 'G06016 - Graphite tubes',
  g06017: 'G06017 - Green Coke',
  g06018: 'G06018 - Green Timber / Lumber',
  g06019: 'G06019 - Hydrated lime',
  g06020: 'G06020 - Iron',
  g06021: 'G06021 - Coal Tar Pitch',
  g06022: 'G06022 - Liquid Pitch',
  g06023: 'G06023 - Lithium carbonate',
  g06024: 'G06024 - Magnesium oxide',
  g06025: 'G06025 - Metallurgical Coal',
  g06026: 'G06026 - Ramming Paste',
  g06027: 'G06027 - Refractories & Refractory Bricks',
  g06028: 'G06028 - Refractory Services',
  g06029: 'G06029 - Smelter Technology',
  g06030: 'G06030 - Soda ash',
  g06031: 'G06031 - Cathodes',
  g06032: 'G06032 - Magnesium',
  g06033: 'G06033 - Manganese',
  g06034: 'G06034 - Silicon',
  h00000: 'H00000 - Services',
  h01000: 'H01000 - Ancillary Services',
  h01001: 'H01001 - Component monitoring contractors',
  h01002: 'H01002 - Contract Labor-Outside Services',
  h01003: 'H01003 - Employee transport services',
  h01004: 'H01004 - Equipment Hire',
  h01005: 'H01005 - Fabrication',
  h01006: 'H01006 - Foundries',
  h01007: 'H01007 - Instrumentation',
  h01008: 'H01008 - Laboratory',
  h01009: 'H01009 - Machining+B147',
  h01010: 'H01010 - Marine Contractors',
  h01011: 'H01011 - Medical services',
  h01012: 'H01012 - Metal fabrication services',
  h01013: 'H01013 - Office equipment maintenance services',
  h01014: 'H01014 - Port Charges',
  h01015: 'H01015 - Printing services',
  h01016: 'H01016 - Road maintenance contractors',
  h01017: 'H01017 - Sampling / Testing Contractors',
  h01018: 'H01018 - Screen Print',
  h01019: 'H01019 - Shipping Agents',
  h01020: 'H01020 - Site Services Other',
  h01021: 'H01021 - Steepljacks',
  h01022: 'H01022 - Surveying',
  h01023: 'H01023 - Tolling',
  h01024: 'H01024 - Water treatment materials',
  h02000: 'H02000 - Bulk materials',
  h02001: 'H02001 - Pipeline Tolling Service',
  h03000: 'H03000 - Civil & Mining Services',
  h03001: 'H03001 - Civil Contractors',
  h03002: 'H03002 - Explosives Services',
  h03003: 'H03003 - Mining Contractors',
  h04000: 'H04000 - Facilities & Site Management',
  h04001: 'H04001 - Building lease',
  h04002: 'H04002 - Building maintenance, plumb/elect service',
  h04003: 'H04003 - Catering',
  h04004: 'H04004 - Fuel terminal management and maintenance services',
  h04005: 'H04005 - Grounds Maintenance services',
  h04006: 'H04006 - Janitorial services',
  h04007: 'H04007 - Laundry services',
  h04008: 'H04008 - Property leases / rentals',
  h04009: 'H04009 - Property Purchases',
  h04010: 'H04010 - Safety and Fire Protection services',
  h04011: 'H04011 - Security services',
  h04012: 'H04012 - Site Civil works',
  h04013: 'H04013 - Waste removal, disposal & recycling',
  h04014: 'H04014 - Water supply - domestic',
  h05000: 'H05000 - IT',
  h05001: 'H05001 - Hardware equipment maintenance',
  h05002: 'H05002 - Hardware Leasing',
  h05003: 'H05003 - Hardware purchase',
  h05004: 'H05004 - IT Services',
  h05005: 'H05005 - Land Telecommunications',
  h05006: 'H05006 - Mobile Telecommunications',
  h05007: 'H05007 - PC, Software and Related',
  h05008: 'H05008 - Software',
  h05009: 'H05009 - Telecommunications',
  h06000: 'H06000 - Maintenance Services',
  h06001: 'H06001 - Automotive Maintenance',
  h06002: 'H06002 - Cranage Contractors',
  h06003: 'H06003 - Crushing & Mill Contractors',
  h06004: 'H06004 - Elec trans/cabling contractors',
  h06005: 'H06005 - Furnace repair/maintenance',
  h06006: 'H06006 - Handling & Moving Equipment Maintenance',
  h06007: 'H06007 - HVAC Maintenance',
  h06008: 'H06008 - Maintenance Services',
  h06009: 'H06009 - Plant Maint Service Electrical',
  h06010: 'H06010 - Plant Maint Service Hydraulic',
  h06011: 'H06011 - Plant Maint Service Mechanical',
  h06012: 'H06012 - Plant Maint Service Water Treatment',
  h06013: 'H06013 - Plumbing Maintenance',
  h06014: 'H06014 - Temp Labor/Industrial',
  h06015: 'H06015 - Transmission / cabling contractors',
  h06016: 'H06016 - Refractory Services',
  h07000: 'H07000 - Support Services',
  h07001: 'H07001 - Underground Mining Contractors',
  h08000: 'H08000 - Professional Services',
  h08001: 'H08001 - Accounting/financial/audit/tax Service',
  h08002: 'H08002 - Advertising/Marketing Service',
  h08003: 'H08003 - Banking Services',
  h08004: 'H08004 - Business & General Consulting',
  h08005: 'H08005 - Consulting Services',
  h08006: 'H08006 - Customs Clearance & brokerage',
  h08007: 'H08007 - Engineering, technical or consulting srvc',
  h08008: 'H08008 - Environmental, Health/Safety consulting',
  h08009: 'H08009 - Health Insurance',
  h08010: 'H08010 - HR Services / Benefits',
  h08011: 'H08011 - Insurance',
  h08012: 'H08012 - IT Consulting',
  h08013: 'H08013 - Legal Services',
  h08014: 'H08014 - Market Research',
  h08015: 'H08015 - Physicians Fees',
  h08016: 'H08016 - Outsourcing Services',
  h08017: 'H08017 - Research and Development',
  h08018: 'H08018 - Risk Management Services',
  h08019: 'H08019 - Services for External Relations',
  h08020: 'H08020 - Temp Labor/Administration',
  h08021: 'H08021 - Training and Education - Fees',
  h08022: 'H08022 - Training Services',
  h09000: 'H09000 - Support Services',
  h09001: 'H09001 - Site Contractors - electrical/mechanical',
  h09002: 'H09002 - Supplementary Labour',
  h10000: 'H10000 - Travel',
  h10001: 'H10001 - Air Travel - RPT',
  h10002: 'H10002 - Air Travel - Scheduled Charter',
  h10003: 'H10003 - Car Hire / Rental',
  h10004: 'H10004 - Hotel / Accommodation',
  h10005: 'H10005 - Meals',
  h10006: 'H10006 - Taxi / Bus / Train',
  h10007: 'H10007 - Travel',
  h10008: 'H10008 - Travel Agency Services',
};
