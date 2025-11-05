declare namespace Manager {
  // 经理用户-分页
  type ListItem = {
    /**
     * 账号
     */
    account?: string
    /**
     * 头像
     */
    avatar?: string
    /**
     * 生日
     */
    birthday?: string
    /**
     * 客户组
     */
    clientGroup?: string
    /**
     * 用户编号
     */
    code?: string
    /**
     * 创建部门
     */
    createDept?: number
    /**
     * 创建时间
     */
    createTime?: string
    /**
     * 创建人
     */
    createUser?: number
    /**
     * 部门id
     */
    deptId?: string
    /**
     * 邮箱
     */
    email?: string
    /**
     * 主键
     */
    id?: number
    /**
     * IP白名单
     */
    ipWhitelist?: string
    /**
     * 是否已删除
     */
    isDeleted?: number
    /**
     * 昵称
     */
    name?: string
    /**
     * 手机
     */
    phone?: string
    /**
     * 岗位id
     */
    postId?: string
    /**
     * 真名
     */
    realName?: string
    /**
     * 最近访问
     */
    recentlyVisited?: string
    /**
     * 备注
     */
    remark?: string
    /**
     * 角色id
     */
    roleId?: string
    /**
     * 性别
     */
    sex?: number
    /**
     * 业务状态
     */
    status?: number
    /**
     * 租户ID
     */
    tenantId?: string
    /**
     * 更新时间
     */
    updateTime?: string
    /**
     * 更新人
     */
    updateUser?: number
    /**
     * 用户平台
     */
    userType?: number
  }
  // 经理用户-新增
  type AddOrEditParams = {
    id?: number
    /**
     * 账号
     */
    account: string
    /**
     * 头像
     */
    avatar?: string
    /**
     * 生日
     */
    birthday?: string
    /**
     * 客户组
     */
    clientGroup?: string
    /**
     * 邮箱
     */
    email?: string
    /**
     * 主健ID
     */
    id?: number
    /**
     * IP白名单
     */
    ipWhitelist?: string
    /**
     * 昵称
     */
    name?: string
    /**
     * 密码【加密】
     */
    password?: string
    /**
     * 手机
     */
    phone?: string
    /**
     * 真名
     */
    realName?: string
    /**
     * 备注
     */
    remark?: string
    /**
     * 角色id
     */
    roleId: string
    /**
     * 性别
     */
    sex?: number
  }
}
