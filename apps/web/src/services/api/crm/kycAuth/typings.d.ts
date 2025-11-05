declare namespace KycAuth {
  // KYC身份认证-分页
  type ListItem = {
    /**
     * 国家-简称
     */
    country?: string
    /**
     * 审核时间
     */
    auditTime?: string
    /**
     * 审核人ID
     */
    auditUserId?: number
    /**
     * 认证图片
     */
    authImgsUrl?: string
    /**
     * 客户ID
     */
    clientId?: number
    /**
     * 创建时间
     */
    createdTime?: string
    /**
     * 名(名字)
     */
    firstName?: string
    /**
     * 主键
     */
    id?: number
    /**
     * 证件号
     */
    identificationCode?: string
    /**
     * 证件类型
     */
    identificationType?: API.IdentificationType
    /**
     * 姓(姓氏)
     */
    lastName?: string
    /**
     * 备注
     */
    remark?: string
    /**
     * 状态
     */
    status?: API.ApproveStatus
  }
  type ApproveParams = {
    /**
     * 审核ID
     */
    id: number
    /**
     * 备注
     */
    remark?: string
    /**
     * 状态
     */
    status: API.ApproveStatus
  }
  // 提交kyc认证审核
  type SubmitKycAuthParams = {
    /**
     * 认证图片，多个逗号分隔
     */
    authImgsUrl: string
    /**
     * 名(名字)
     */
    firstName: string
    /**
     * 证件号
     */
    identificationCode: string
    /**
     * 证件类型
     */
    identificationType: API.IdentificationType
    /**
     * 姓(姓氏)
     */
    lastName: string
    /**国家-简称 */
    country?: string
  }

  // KYC基础认证-提交审核
  type SubmitBaseAuthParams = {
    /**国家-简称 */
    country: string
    /**名(名字) */
    firstName: string
    /**姓(姓氏) */
    lastName: string
    /**证件号 */
    identificationCode: string
    /**证件类型 */
    identificationType: API.IdentificationType
  }
}
