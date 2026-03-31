declare namespace BankCard {
  // 银行卡-分页
  type ListItem = {
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
     * 银行卡号
     */
    bankCardCode?: string
    /**
     * 银行卡类型
     */
    bankCardType?: API.BankCardType
    /**
     * 银行名称
     */
    bankName?: string
    /**
     * 客户ID
     */
    clientId?: number
    /**
     * 开户行
     */
    createBank?: string
    /**
     * 创建时间
     */
    createdTime?: string
    /**
     * 持卡人
     */
    holder?: string
    /**
     * 主键
     */
    id?: number
    /**
     * 备注
     */
    remark?: string
    /**
     * 状态
     */
    status?: API.ApproveStatus
  }
  // 银行卡-审核
  type UpdateParams = {
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
}
