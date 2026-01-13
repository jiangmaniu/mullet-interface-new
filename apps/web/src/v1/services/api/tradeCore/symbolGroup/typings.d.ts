declare namespace SymbolGroup {
  type SubmitSymbolGroupParams = {
    /**
     * 组名称
     */
    groupName: string
    /**
     * 主键
     */
    id?: string | undefined
    /**
     * 父级ID
     */
    parentId?: number | string
    /**
     * 备注
     */
    remark?: string
  }
  // 交易品种组-树形结构
  type SymbolGroupTreeItem = {
    children?: SymbolGroupTreeItem[]
    /**
     * 组名称
     */
    title: string
    hasChildren?: boolean
    id?: number
    parentId?: number | string
    parentName?: string
    /**
     * 备注
     */
    remark?: string
  }
}
