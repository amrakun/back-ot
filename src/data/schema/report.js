export const types = `
  enum ReportsTendersType {
    rfq
    trfq
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
    state: String,
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
