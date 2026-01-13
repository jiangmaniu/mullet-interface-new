declare namespace Message {
  type MessageItem = {
    /**
     * 内容
     */
    content?: string
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
     * 创建人姓名
     */
    createUserName?: string
    /**
     * 消息等级
     */
    grade?: MessageGrade
    /**
     * 主键id
     */
    id?: string
    /**
     * 是否已删除
     */
    isDeleted?: number
    /**
     * 是否已读
     */
    isRead?: IsRead
    /**
     * 消息发送记录id
     */
    messageLogId?: number
    /**
     * 已读时间
     */
    readTime?: string
    /**
     * 接收群
     */
    receiveGroup?: number
    /**
     * 接收人id
     */
    receiveUser?: number
    /**
     * 业务状态
     */
    status?: number
    /**
     * 标题
     */
    title?: string
    /**
     * 类型
     */
    type?: MessageType
    /**
     * 更新时间
     */
    updateTime?: string
    /**
     * 更新人
     */
    updateUser?: number
  }
  /**
   * 消息等级
   */
  type MessageGrade = 'WARN' | 'ORDINARY' | 'SIGNIFICANT' | 'URGENT'
  /**
   * 是否已读
   */
  type IsRead = 'READ' | 'UNREAD'
  /**
   * 类型
   */
  type MessageType = 'SINGLE' | 'GROUP' | 'APPROVAL' | 'ROLE' | 'ORDER'
}
