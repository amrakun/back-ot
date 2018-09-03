export const types = `
  enum ReportsTendersType {
    rfq
    srfq
    eoi
  }

  input DateInterval {
    startDate: Date!
    endDate: Date!
  }
`;

export const queries = `
  reportsSuppliersExport(
    productCodes: [String],
    isPrequalified: Boolean,
    tierType: String,
  ): String

  reportsTendersExport(
    type: ReportsTendersType,
    publishDate: DateInterval,
    closeDate: DateInterval,
  ): String

  reportsAuditExport(
    type: String,
    publishDate: DateInterval,
    closeDate: DateInterval,
  ): String

  reportsShareholder(name: String): String
`;
