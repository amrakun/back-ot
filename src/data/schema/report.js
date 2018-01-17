export const types = `
  enum ReportsTendersType {
    rfq
    eoi
  }

  input DateInterval {
    startDate: Date
    endDate: Date
  }
`;

export const queries = `
  reportsSuppliersExport(
    productCode: [String],
    isPrequalified: Boolean,
  ): String

  reportsTendersExport(
    type: ReportsTendersType,
    publishDate: DateInterval,
    closeDate: DateInterval,
  ): String
`;
