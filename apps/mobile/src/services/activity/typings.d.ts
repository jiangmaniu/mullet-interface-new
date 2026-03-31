declare namespace Activity {
  // 我的活动列表
  type ListItem = {
    /**
     * 活动名称
     */
    activityName?: string
    /**
     * 活动订单号
     */
    activityOrderNo?: string
    /**
     * 结束时间
     */
    endTime?: string
    /**
     * 可享赠金
     */
    remainingRewardAmount?: number
    /**
     * 报名时间
     */
    signupTime?: string
    /**
     * 活动状态
     */
    status?: boolean
    /**
     * 已释放金额
     */
    totalClaimedAmount?: number
    /**
     * 累计充值金额
     */
    totalRechargeAmount?: number
  }
}
