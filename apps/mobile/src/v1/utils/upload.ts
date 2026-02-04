import { fileUpload } from '@/v1/services/common'
import { PermissionsAndroid, Platform } from 'react-native'
import { launchImageLibrary } from 'react-native-image-picker'
import { message } from './message'
import { t } from '@lingui/core/macro'
import { storagePermission } from './download'

// 选择照片
const onSelectLibrary = async (onBefore?: () => void) => {
  const result = await launchImageLibrary({
    mediaType: 'photo',
    includeExtra: true
  })

  if (result.errorCode) {
    if (result.errorCode === 'permission') {
      message.info(t`ninyiguanbiquanxian`)
    }
    return
  }

  return onUploadImage(result, onBefore)
}

const requestGalleryPermission = async (onBefore?: () => void) => {
  try {
    const granted = await PermissionsAndroid.request(storagePermission)

    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      return onSelectLibrary(onBefore)
    } else {
      message.info(t`ninyiguanbiquanxian`)
    }
  } catch (err) {
    console.warn(err)
    message.info(JSON.stringify(err))
  }
}

// 上传单个图片
const onUploadImage = async (result: any, onBefore?: () => void) => {
  const assets = result.assets
  if (assets && assets.length > 0) {
    const asset = assets[0]

    return new Promise(async (resolve, reject) => {
      let source
      if (Platform.OS === 'android') {
        source = asset.uri
      } else {
        source = asset.uri?.replace('file://', '')
      }

      // 检查必要的属性是否存在
      if (!source || !asset.type) {
        reject(new Error('Missing required asset properties'))
        return
      }

      const formData = new FormData()
      formData.append('file', {
        uri: source,
        type: asset.type || 'image/jpeg', // 提供默认值
        name: asset.fileName || `image_${Date.now()}.jpg` // 提供默认文件名
      } as any)

      try {
        // showLoading({
        //   text: t`uploading`
        // })
        await onBefore?.()
        fileUpload(formData)
          .then((res) => {
            console.log('====then====', res)
            if (res.success && res?.data) {
              resolve(res.data)
            }
            // reject(new Error(res.msg || 'Upload failed'))
          })
          .catch((err) => {
            console.log('err', err)
            message.info(err?.Message || t`Upload Failed`)
            // reject(err)
          })
          .finally(() => {
            // hideLoading()
            // bottomSheetModalRef.current?.sheet?.dismiss()
          })
      } catch (error) {
        console.log('====onUploadImage====', error)
        message.info(JSON.stringify(error) || t`Upload Failed`)
        reject(error)
      }
    })
  }
}

// 选择照片库上传
export const handleClickSelectLibrary = async (onBefore?: () => void) => {
  if (Platform.OS === 'android') {
    return await requestGalleryPermission(onBefore)
  } else {
    return await onSelectLibrary(onBefore)
  }
}
