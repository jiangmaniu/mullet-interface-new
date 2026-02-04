declare namespace Common {
  type UploadResult = {
    /** 完整链接 */
    link: string
    /** 域名前缀 http://192.168.5.60:19000/trade */
    domain: string
    /** 图片名称 upload/20240612/5785069a2f9b25aed760b3c5c49d4cbc.png */
    name: string
    /** 原始名称 WX20240612-154705@2x.png */
    originalName: string
    attachId: null
  }
  /** 国家区号列表 */
  type AreaCodeItem = {
    /** 国家id */
    id: string
    abbr: string
    /** 英文名称 */
    nameEn: string
    /** 中文名称 */
    nameCn: string
    /** 繁体名称 */
    nameTw: string
    /** 手机区号 */
    areaCode: string
    sort: any
    remark: string
  }
  // 版本信息
  type VersionItem = {
    /**
     * AB面控制开关（false: 关, true: 开）
     */
    abControl?: boolean
    /**
     * 屏蔽地区（省市编号）
     */
    blockedRegions?: string
    /**
     * 渠道号
     */
    channelNumber?: string
    /**
     * 创建用户
     */
    createdUser?: string
    /**
     * 创建时间
     */
    createTime?: string
    /**
     * 设备类型 (ios, android)
     */
    device?: 'ios' | 'android'
    /**
     * 下载地址
     */
    downloadUrl?: any
    /**
     * 唯一标识
     */
    id?: number
    /**
     * 应用名称
     */
    name?: string
    /**
     * 平台
     */
    platform?: string
    /**
     * 备注
     */
    remark?: string
    /**
     * 更新状态（1: 强制更新, 2: 更新提示, 3: 不提示更新）
     */
    status?: 'mandatory_update' | 'update_prompt' | 'no_update_prompt'
    /**
     * 更新内容
     */
    updateContent?: string
    /**
     * 更新用户
     */
    updatedUser?: string
    /**
     * 更新时间
     */
    updateTime?: string
    /**
     * 版本号
     */
    versionNumber?: string
  } & {
    /** 是否强制更新 */
    isForceUpdate?: boolean
    /** 是否最终更新版本 */
    isUpdateVersion?: boolean
    /** 是否显示更新内容 */
    showUpdateContent?: boolean
  }

  // 定位信息
  type LocationInfo = {
    /** 区域代码 440400 */
    area_code: any
    /** 城市名称 珠海 */
    city: any
    /** 城市区号 0756 */
    city_code: any
    /** 所属洲 亚洲 */
    continent: any
    /** 国家名称 中国 */
    country: any
    /** 国家代码 CN */
    country_code: any
    /** 区县 */
    district: any
    /** 海拔高度 0 */
    elevation: any
    /** IP地址 27.42.96.25 */
    ip: any
    /** 网络服务商 联通 */
    isp: any
    /** 纬度 22.255899 */
    latitude: any
    /** 经度 113.552724 */
    longitude: any
    /** 省份 广东 */
    province: any
    /** 街道 */
    street: any
    /** 时区 Asia/Shanghai */
    time_zone: any
    /** 气象站 */
    weather_station: any
    /** 邮政编码 */
    zip_code: any
    /** 更新时间 */
    updateTime: number
  }
}
