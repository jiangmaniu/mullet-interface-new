import { CameraRoll } from '@react-native-camera-roll/camera-roll'
import { Platform } from 'react-native'
import RNFS from 'react-native-fs'
import { PERMISSIONS, request } from 'react-native-permissions' // ios 需要额外配置

import { t } from '@lingui/core/macro'
import { message } from './message'
import { IS_ANDROID_13_OR_ABOVE } from '@/v1/constants/device'

// 下载图片, 返回图片路径
function downloadImage(
  url: string, // 网络连接
  filename: string = ((Math.random() * 10000000) | 0) + '.png', // 保持的图片
  dir: string = RNFS.CachesDirectoryPath // 目录
) {
  const destPath = `${dir}/${filename}`
  const ret = RNFS.downloadFile({
    fromUrl: url,
    toFile: destPath,
    background: false,
    cacheable: false,
    connectionTimeout: 60 * 1000,
    readTimeout: 120 * 1000
  })
  return ret.promise
    .then(() => {
      return destPath
    })
    .catch(() => {
      return ''
    })
}

function downloadBase64Image(
  data: string, // base64数据
  filename = `${(Math.random() * 10000000) | 0}`, // 文件名
  dir: string = RNFS.CachesDirectoryPath // 目录
) {
  const imgtypes = [
    { type: '.png', head: 'data:image/png;base64,' },
    { type: '.jpg', head: 'data:image/jpeg;base64,' },
    { type: '.jpg', head: 'data:image/jpg;base64,' }
  ]
  const index = imgtypes.findIndex((item) => data.indexOf(item.head) === 0)
  const currentImgType = index === -1 ? imgtypes[0] : imgtypes[index] // 当前图片类型
  const destPath = `${dir}/${filename}${currentImgType.type}` // 外部文件，共享目录的绝对路径（仅限android）
  const imageDatas = data.split(',')
  const imageData = imageDatas.length > 1 ? imageDatas[1] : imageDatas[0]
  return RNFS.writeFile(destPath, imageData, 'base64')
    .then(() => {
      return destPath
    })
    .catch(() => {
      return ''
    })
}

export const storagePermission = IS_ANDROID_13_OR_ABOVE ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE

// 获取文件权限
function checkPhotoPermission() {
  return request(
    Platform.select({
      android: storagePermission,
      default: PERMISSIONS.IOS.PHOTO_LIBRARY
    })
  )
}

// 保存图片
function cameraRollSave(img: string) {
  return new Promise(async (resolve, reject) => {
    if (Platform.OS === 'ios') {
      CameraRoll.saveAsset(img, { type: 'photo' })
        .then((path) => {
          return resolve(path)
        })
        .catch((e) => {
          console.log('e', e)
          return reject(t`baocuntupianshibai`)
        })
    } else {
      const imgRes = img.startsWith('http') ? await downloadImage(img) : await downloadBase64Image(img)
      if (imgRes) {
        CameraRoll.saveAsset(imgRes)
          .then((path) => resolve(path))
          .catch(() => reject(t`baocuntupianshibai`))
      } else {
        reject(t`baocuntupianshibai`)
      }
    }
  })
}

// img 为本地路径
export async function saveImage(img: string) {
  return new Promise(async (resolve, reject) => {
    try {
      const authorized = await checkPhotoPermission()
      if (authorized !== 'granted') {
        return reject(t`ninyiguanbiquanxian`)
      }
      CameraRoll.save(img)
        .then((path) => resolve(path))
        .catch((error) => {
          console.error('Error saving image:', error)
          reject(t`baocuntupianshibai`)
        })
    } catch (err) {
      reject(t`baocuntupianshibai`)
    }
  })
}

function getUrlBase64(url: string) {
  return new Promise<any>((resolve, reject) => {
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          const base64data = reader.result
          resolve(base64data)
        }
        reader.readAsDataURL(blob)
      })
      .catch((error) => console.log(error))
  })
}

// 保存网络图片
export async function saveWebImage(img: string) {
  let url = img
  return new Promise(async (resolve, reject) => {
    const authorized = await checkPhotoPermission()
    console.log('authorized', authorized)
    if (authorized !== 'granted') {
      const msg = t`ninyiguanbiquanxian`
      message.info(msg)
      return reject(msg)
    }

    if (Platform.OS === 'ios') {
      // 网络图片转成base64，否则ios保存失败
      const base = await getUrlBase64(url)
      url = await downloadBase64Image(base)
    }

    cameraRollSave(url)
      .then((path) => {
        message.info(t`baocuntupianchenggong`)
        return resolve(path)
      })
      .catch((e) => {
        const msg = t`baocuntupianshibai`
        message.info(msg)
        return reject(msg)
      })
  })
}

// 删除文件
export async function unlinkImage(path: string) {
  return RNFS.unlink(path)
    .then(() => {
      return true
    })
    .catch(() => {
      return false
    })
}
