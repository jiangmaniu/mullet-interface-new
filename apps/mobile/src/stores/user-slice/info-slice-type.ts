export type ClientInfo = Omit<User.ClientInfo, 'accountList' | 'userInfo'>

export type UserInfo = User.ClientUserInfo
