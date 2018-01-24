export const types = `
  enum ReportsTendersType {
    rfq
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
  ): String

  reportsTendersExport(
    type: ReportsTendersType,
    publishDate: DateInterval,
    closeDate: DateInterval,
  ): String

  reportsAuditExport(
    type: ReportsTendersType,
    publishDate: DateInterval,
    closeDate: DateInterval,
  ): String
`;
