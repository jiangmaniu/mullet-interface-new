import { action, makeAutoObservable, observable, runInAction } from 'mobx'
import { Alert, Linking, Platform } from 'react-native'
// import { getVersion } from 'react-native-device-info'
import semver from 'semver'
import RNFetchBlob from 'rn-fetch-blob'
// import Toast from '@/components/Base/Modal/Toast'
import { t } from '@lingui/core/macro'
import { message } from '@/v1/utils/message'
import { request } from 'react-native-permissions'
import { storagePermission } from '@/v1/utils/download'
import { getAppVersion } from '@/v1/services/common'
import { Config } from '../platform/config'
import { CHANNEL_CONFIG } from '@/v1/constants'
// const currentVersion = getVersion()

const currentVersion = Config.VERSION

class VersionStore {
  constructor() {
    makeAutoObservable(this)
  }

  @observable currentVersion: string = currentVersion // app当前版本号
  @observable versionInfo: Common.VersionItem = {} // app最新版本信息
  @observable showUpdateModal = false // 是否显示更新弹窗
  @observable updateLoading = false

  // 版本更新
  @action async getAppVersion() {
    if (this.showUpdateModal) return
    const res = await getAppVersion({
      device: Platform.OS as Common.VersionItem['device'],
      versionNumber: currentVersion,
      channelNumber: CHANNEL_CONFIG.CHANNEL_ID,
      type: 'APP'
    }).catch((e) => e)
    console.log('=====获取版本信息====', res)
    if (res?.success && res.data) {
      runInAction(() => {
        const versionInfo = res.data as Common.VersionItem
        // 服务端版本和本地版本对比
        let hasNewVersion = !!versionInfo.versionNumber && semver.gt(versionInfo.versionNumber, currentVersion)
        const showUpdateModal = versionInfo.status === 'update_prompt' || versionInfo.status === 'mandatory_update'
        this.versionInfo = {
          ...versionInfo,
          isForceUpdate: versionInfo.status === 'mandatory_update',
          isUpdateVersion: hasNewVersion, // 控制是否最终更新版本
          showUpdateContent: versionInfo.status !== 'no_update_prompt' // 是否展示更新的内容
        }
        // 提示更新弹窗
        if (showUpdateModal) {
          this.onShowUpdateModal()
        }
      })
    }
  }

  // 显示更新弹窗
  @action onShowUpdateModal() {
    if (this.versionInfo.isUpdateVersion) {
      this.showUpdateModal = !this.showUpdateModal
    } else {
      // Toast.info(i18n.t('mt.Latest version already installed'))
    }
  }

  // 跳转到appstore下载页面去更新
  @action async onDownLoadAppUpdate() {
    const versionInfo = this.versionInfo
    if (versionInfo?.isUpdateVersion) {
      // 非强制更新点击后 关闭更新弹窗
      if (!versionInfo?.isForceUpdate) {
        this.showUpdateModal = false
      }
      const downloadUrl = versionInfo.downloadUrl
      if (!downloadUrl) {
        message.info('downloadUrl is empty')
        return
      }
      // 如果downloadUrl不是.apk结尾，则直接打开下载页面
      // if (Platform.OS === 'ios') {
      Linking.openURL(downloadUrl).catch((err) => err)
      // } else {
      //   if (!downloadUrl.endsWith('.apk')) {
      //     Linking.openURL(downloadUrl).catch((err) => err)
      //     return
      //   }
      //   // 安卓下载apk更新
      //   this.checkPermission()
      // }
    }
  }

  checkPermission = async () => {
    const granted = await request(storagePermission)

    console.log('checkPermission res', granted)

    if (granted === 'granted') {
      this.onDownLoadAndroidApk()
    } else {
      message.info('获取权限失败')
    }
  }

  // 下载安卓apk包
  @action
  onDownLoadAndroidApk = () => {
    let dirs = RNFetchBlob.fs.dirs
    let android = RNFetchBlob.android

    message.info(t`Downloading update`)

    this.updateLoading = true

    const downloadDir = dirs.DownloadDir
    const versionName = `${Config.NAMESPACE}-v${this.versionInfo.versionNumber}.apk`

    RNFetchBlob.config({
      // 文件下载的同时缓存起来，提高操作效率
      fileCache: true,
      appendExt: 'apk',
      timeout: 180000,
      addAndroidDownloads: {
        // 调起原生下载管理
        useDownloadManager: true,
        // 你想要设置的下载的安装包保存的名字
        title: versionName,
        // title: `stellux-v1.1.0.apk`,
        // 下载时候顶部通知栏的描述
        description: t`banbengengxin`,
        // 下载的文件格式
        mime: 'application/vnd.android.package-archive',
        // 下载完成之后扫描下载的文件
        mediaScannable: true,
        // 通知栏显示下载情况
        notification: true,
        path: `${downloadDir}/${versionName}`
        // path: `${dirs.DownloadDir}/stellux-v1.1.0.apk`
      }
    })
      .fetch('GET', this.versionInfo.downloadUrl)
      // .fetch('GET', 'https://client.stellux.io/apk/stellux-v1.1.0.apk')
      .progress((received, total) => {
        console.log('download progress', received, total)
        // @TODO 下载进度问题
        if ((received / total) * 100 >= 100) {
          runInAction(() => {
            this.updateLoading = false
          })
        }
      })
      .then((res) => {
        if (res.respInfo.timeout) {
          Linking.openURL(this.versionInfo.downloadUrl)
          return
        }
        // 自动触发安装
        // Alert.alert('应用准备就绪', '请点击安装', [
        //   {
        //     text: '确定',
        //     onPress: () => {
        //       // android.actionViewIntent(res.path(), 'application/vnd.android.package-archive')
        //     }
        //   }
        // ])
        Alert.alert(t`tishi`, t`yingyongyizhuibeihaolijianzhuang2`, [
          {
            text: t`wozhidaole`,
            onPress: () => {}
          }
        ])
      })
      .catch((err) => {
        console.warn('下载失败')
        runInAction(() => {
          this.updateLoading = false
        })
      })
  }
}

const versionStore = new VersionStore()

export default versionStore
