declare namespace Holiday {
  // 假期日历-新增或修改
  type SubmitHolidayParams = {
    /**
     * 描述
     */
    describeInfo?: string
    /**
     * 结束时间
     */
    endTime: string
    /**
     * 主键
     */
    id?: number
    /**
     * 每年重复
     */
    repeatYear: boolean
    /**
     * 开始时间
     */
    startTime: string
    /**
     * 状态
     */
    status: API.Status
    /**
     * 交易品种
     */
    symbols: string
  }
  // 分页
  type HolidayPageListItem = {
    /**
     * 描述
     */
    describeInfo?: string
    /**
     * 结束时间
     */
    endTime: string
    /**
     * 主键
     */
    id?: number
    /**
     * 每年重复
     */
    repeatYear: boolean
    /**
     * 开始时间
     */
    startTime: string
    /**
     * 状态
     */
    status: API.Status
    /**
     * 交易品种
     */
    symbols: string
  }
}
