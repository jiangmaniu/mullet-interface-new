/**
 * 根据数据源转化成一棵树
 * @param nodes 数组
 * @param parendId 父节点id
 * @param id 数据id
 * @returns
 */

export const toTree = <TreeNode extends Record<string, any>>(
  nodes: TreeNode[],
  parendId: keyof TreeNode,
  id: keyof TreeNode,
  // 遍历过程中，需要排序的字段
  sortBy?: keyof TreeNode
): TreeNode[] => {
  let result: TreeNode[] = []

  if (!Array.isArray(nodes)) {
    return result
  }

  // 深拷贝，否则会影响原数组
  let node: TreeNode[] = JSON.parse(JSON.stringify(nodes))

  // 根据父节点进行拼接子节点
  node.forEach((item) => delete item.children)

  // 把每一项的引用放入map对象里
  let map: Record<string, TreeNode> = {}
  node.forEach((item) => {
    map[item[id]] = item
  })

  let newNode: TreeNode[] = []
  node.forEach((dt) => {
    let parents = map[dt[parendId]]
    if (parents) {
      // 如果 map[dt.pId] 有值 则 parents 为 dt 的父级
      // 判断 parents 里有无child 如果没有则创建 如果有则直接把 dt push到children里
      if (!parents.children) {
        // @ts-ignore
        parents.children = []
      }
      // @ts-ignore
      dt.key = dt[id]
      parents.children.push(dt)

      if (sortBy) {
        // @ts-ignore
        parents.children = parents.children.sort((a, b) => b[sortBy] - a[sortBy])
      }
    } else {
      // @ts-ignore
      dt.key = dt[id]
      newNode.push(dt)
    }
  })

  if (sortBy) {
    return newNode.sort((a, b) => b[sortBy] - a[sortBy])
  }

  return newNode
}

/**
 * 拍平一颗树
 * @param {*} data
 * @param {*} key data item的key字段 如id
 * @param {*} parentId 父级Id
 * @returns
 */
export const flatTreeData = <TreeNode>(data: TreeNode[], key: keyof TreeNode, parentId?: keyof TreeNode): TreeNode[] => {
  if (!data?.length) return []
  return data.reduce((prev: TreeNode[], curr: TreeNode) => {
    if (parentId !== undefined) {
      // @ts-ignore
      curr.parentId = parentId
    }
    prev.push(curr)
    // @ts-expect-error
    if (curr.children && curr.children.length > 0) {
      // @ts-ignore
      prev.push(...flatTreeData(curr.children, key, curr[key] as string))
    }
    return prev
  }, [])
}

// 树状数据去除空children
export const removeEmptyChildren = (treeData: any) => {
  treeData.forEach((item: any) => {
    if ('children' in item && item.children?.length === 0) {
      delete item.children
    } else if ('children' in item && item.children?.length) {
      removeEmptyChildren(item.children)
    }
  })
  return treeData
}
