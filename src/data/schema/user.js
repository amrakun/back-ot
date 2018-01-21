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
  }

  type AuthPayload {
    token: String!
    refreshToken: String!
  }
`;

export const queries = `
  users(page: Int, perPage: Int): [User]
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
  phone: Float
`;

export const mutations = `
  register(email: String!): String!

  confirmRegistration(
    token: String!,
    password: String!,
    passwordConfirmation: String!
  ): User

  login(email: String!, password: String!): AuthPayload!
  forgotPassword(email: String!): String!
  resetPassword(token: String!, newPassword: String!): String

  usersAdd(
    ${commonParams},
    password: String!,
    passwordConfirmation: String!
  ): User

  usersEdit(
    _id: String!,
    ${commonParams},
    password: String,
    passwordConfirmation: String
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
`;
