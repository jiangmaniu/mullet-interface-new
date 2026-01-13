import { deleteEmptyProperty } from '@/v1/utils/helpers'

import { IPlatformConfig } from '.'

// 编译时变量，参与打包到代码中，需要做SEO时需要用到的变量

// 针对平台做seo打包配置，暂时不需要
const seoConf =
  process.env.PLATFORM_SEO === '1' || process.env.NODE_ENV === 'development'
    ? {
        // 按需把public/platform/config.json配置同步过来，需要在.env-conf 中配置
        name: process.env.name,
        desc: process.env.desc,
      }
    : {}

// 开发环境配置，本地接口调试使用
const devConf = {
  ...seoConf,
  ws: process.env.WS_URL, // websocket地址
  imgDomain: process.env.IMG_DOMAIN, // 图片地址
  BASE_URL: process.env.BASE_URL, // 接口地址
  CLIENT_ID: process.env.CLIENT_ID, // 客户端ID-pc
  CLIENT_SECRET: process.env.CLIENT_SECRET, // 客户端密钥-pc
  CLIENT_ID_H5: process.env.CLIENT_ID_H5, // 客户端ID-h5
  CLIENT_SECRET_H5: process.env.CLIENT_SECRET_H5, // 客户端密钥-h5
}

const conf = process.env.NODE_ENV === 'production' ? seoConf : devConf

let ENV = deleteEmptyProperty({
  ...conf,
}) as IPlatformConfig

export default ENV
