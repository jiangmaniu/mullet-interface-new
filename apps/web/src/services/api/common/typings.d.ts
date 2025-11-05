declare namespace Common {
  type UploadResult = {
    /**完整链接 */
    link: string
    /**域名前缀 http://192.168.5.60:19000/trade */
    domain: string
    /**图片名称 upload/20240612/5785069a2f9b25aed760b3c5c49d4cbc.png */
    name: string
    /**原始名称 WX20240612-154705@2x.png */
    originalName: string
    attachId: null
  }
  /**国家区号列表 */
  type AreaCodeItem = {
    /**国家id */
    id: string
    abbr: string
    /**英文名称 */
    nameEn: string
    /**中文名称 */
    nameCn: string
    /**繁体名称 */
    nameTw: string
    /**手机区号 */
    areaCode: string
    sort: any
    remark: string
  }
}
