declare namespace CustomerGroup {
  // 分页
  type ListItem = {
    /**
     * 识别码
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
     * 组名称
     */
    groupName?: string
    /**
     * 主键id
     */
    id?: number
    /**
     * 是否已删除
     */
    isDeleted?: number
    /**
     * 是否KYC认证
     */
    isKyc?: boolean
    /**
     * 支付方式
     */
    payWay?: string
    /**
     * 注册方式
     */
    registerWay?: API.RegisterWay
    /**
     * 备注
     */
    remark?: string
    /**
     * 状态
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
  }
  // 修改或新增
  type AddOrUpdateParams = {
    /**
     * 识别码
     */
    code: string
    /**
     * 组名称
     */
    groupName: string
    /**
     * 主健ID
     */
    id?: number
    /**
     * 是否KYC认证
     */
    isKyc: boolean
    /**
     * 支付方式
     */
    payWay: string
    /**
     * 注册方式
     */
    registerWay: API.RegisterWay
    /**
     * 备注
     */
    remark?: string
    accountGroupId?: string
  }
}
