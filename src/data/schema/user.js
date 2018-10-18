export const types = `
  type User {
    _id: String!
    username: String
    email: String
    role: String
    isSupplier: Boolean
    companyId: String

    firstName: String
    lastName: String
    jobTitle: String
    phone: Float
    permissions: [String!]

    delegatedUserId: String
    delegationStartDate: Date
    delegationEndDate: Date
  }

  type AuthPayload {
    status: String
    token: String
    refreshToken: String

    user: User
    delegatedUser: User
  }

  type RegisterViaBuyerPayload {
    user: User
    company: Company
  }
`;

export const queries = `
  users(page: Int, perPage: Int, search: String): [User]
  userDetail(_id: String): User
  usersTotalCount: Int
  currentUser: User
`;

const commonParams = `
  username: String!,
  email: String!,
  role: String!,
  firstName: String,
  lastName: String,
  jobTitle: String,
  phone: Float,
  permissions: [String!]
`;

export const mutations = `
  register(email: String!): String!

  registerViaBuyer(
    companyName: String!,
    contactPersonName: String!,
    contactPersonPhone: String!,
    contactPersonEmail: String!,
  ): RegisterViaBuyerPayload

  confirmRegistration(
    token: String!,
    password: String!,
    passwordConfirmation: String!
  ): User

  login(email: String!, password: String!, loginAs: String): AuthPayload!
  logout: String
  forgotPassword(email: String!): String!
  resetPassword(token: String!, newPassword: String!): String

  usersAdd(
    ${commonParams},
    password: String!,
    passwordConfirmation: String!,
  ): User

  usersEdit(
    _id: String!,
    ${commonParams},
    password: String,
    passwordConfirmation: String,
  ): User

  usersEditProfile(
    username: String!,
    password: String!
    email: String!,

    firstName: String,
    lastName: String,
    jobTitle: String,
    phone: Float,
  ): User

  usersChangePassword(currentPassword: String!, newPassword: String!): User
  usersRemove(_id: String!): String

  usersDelegate(
    userId: String!,
    reason: String!,
    startDate: Date!,
    endDate: Date!
  ): User
`;
