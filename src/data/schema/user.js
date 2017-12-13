export const types = `
  input UserDetails {
    avatar: String
    fullName: String
  }

  type UserDetailsType {
    avatar: String
    fullName: String
  }

  type User {
    _id: String!
    username: String
    email: String
    role: String
    details: UserDetailsType
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
  role: String!
  details: UserDetails,
  password: String!,
  passwordConfirmation: String!
`;

export const mutations = `
  login(email: String!, password: String!): AuthPayload!
  forgotPassword(email: String!): String!
  resetPassword(token: String!, newPassword: String!): String
  usersAdd(${commonParams}): User
  usersEdit(_id: String!, ${commonParams}): User

  usersEditProfile(
    username: String!,
    email: String!,
    details: UserDetails,
    password: String!
  ): User

  usersChangePassword(currentPassword: String!, newPassword: String!): User
  usersRemove(_id: String!): String
`;
