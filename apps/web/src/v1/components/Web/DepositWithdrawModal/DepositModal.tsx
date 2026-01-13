import { Trans } from '@lingui/react/macro'
import { observer } from 'mobx-react'
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { Form, Tooltip } from 'antd'

import Button from '@/components/Base/Button'
import InputNumber from '@/components/Base/InputNumber'
import JumpingLoader from '@/components/Base/JumpingLoader'
import Modal from '@/components/Base/Modal'
import ExplorerLink from '@/components/Wallet/ExplorerLink'
import SwapDialog from '@/components/Web/SwapDialog'
import TransferCryptoDialog from '@/components/Web/TransferCryptoDialog'
import { useStores } from '@/context/mobxProvider'
import usePrivyInfo from '@/hooks/web3/usePrivyInfo'
import useSPLTokenBalance from '@/hooks/web3/useSPLTokenBalance'
// import { useSPLTransferPDA } from '@/hooks/web3/useSPLTransferOfKit'
import useSPLTransfer from '@/hooks/web3/useSPLTransfer'
import { InfoCircleOutlined } from '@ant-design/icons'
import { t } from '@lingui/core/macro'

// 入金弹窗
export default observer(
  forwardRef((props, ref) => {
    const [open, setOpen] = useState(false)
    // const { onTransfer, transferSuccess, error, setError } = useSPLTransferPDA()
    const { onTransfer, transferSuccess, error, setError } = useSPLTransfer()
    const [showLoadingModal, setShowLoadingModal] = useState(false)
    const [form] = Form.useForm()
    const [accountItem, setAccountItem] = useState({} as User.AccountItem)
    const { trade } = useStores()
    const { activeSolanaWallet, address } = usePrivyInfo()
    const { balance: walletBalance, getTokenBalance } = useSPLTokenBalance()

    // 检查是否是嵌入式钱包
    const isEmbeddedWallet = !activeSolanaWallet || !(activeSolanaWallet as any).standardWallet
    const hasExternalWallet = !!activeSolanaWallet && !!(activeSolanaWallet as any).standardWallet

    // 跨链桥接对话框状态
    const [showTransferDialog, setShowTransferDialog] = useState(false)
    const [showSwapDialog, setShowSwapDialog] = useState(false)

    const close = () => {
      setOpen(false)
      setError(false)
      form.resetFields()
    }

    const show = (item?: User.AccountItem) => {
      setOpen(true)
      getTokenBalance()
      const rawItem = item || trade.currentAccountInfo
      if (rawItem) {
        setAccountItem(rawItem)
      }
    }

    // 对外暴露接口
    useImperativeHandle(ref, () => {
      return {
        show,
        close,
      }
    })

    useEffect(() => {
      console.log('transferSuccess', transferSuccess)
      // 关闭动画等待弹窗
      if (transferSuccess) {
        setShowLoadingModal(false)
      }
    }, [transferSuccess])

    const handleSubmit = async (values: any) => {
      console.log('values', values)

      // 调起钱包签名 往固定地址转账
      await onTransfer({
        amount: Number(values?.amount),
        toAddress: accountItem.pdaTokenAddress,
        onBeforeTransfer: () => {
          setTimeout(() => {
            setShowLoadingModal(true)
            close()
          }, 100)
        },
      })
    }

    useEffect(() => {
      if (error) {
        setShowLoadingModal(false)
      }
    }, [error])

    return (
      <>
        <Modal title={<Trans>入金</Trans>} open={open} onClose={close} footer={null} width={580} centered>
          {/* 外部钱包入金：通过钱包授权 */}
          {hasExternalWallet && (
            <Form onFinish={handleSubmit} layout="vertical" form={form}>
              <div className="mt-10 flex flex-col gap-y-6">
                <Form.Item
                  name="amount"
                  required
                  label={<Trans>金额</Trans>}
                  rules={[
                    {
                      required: true,
                      validator: (_, value) => {
                        if (!Number(value)) {
                          return Promise.reject(new Error(t`请输入入金金额`))
                        }
                        if (!Number(walletBalance)) {
                          return Promise.reject(new Error(t`余额不足`))
                        }
                        if (Number(value) > walletBalance) {
                          return Promise.reject(new Error(t`钱包余额不足`))
                        }
                        return Promise.resolve()
                      },
                    },
                  ]}
                >
                  <InputNumber
                    showAddMinus={false}
                    showFloatTips={false}
                    addonAfter={
                      <>
                        {!!walletBalance && (
                          <span
                            onClick={() => form.setFieldValue('amount', walletBalance)}
                            className="hover:text-brand text-primary cursor-pointer text-xs"
                          >
                            {intl.formatMessage({ id: 'mt.zuidazhi' })} {walletBalance} USDC
                          </span>
                        )}
                      </>
                    }
                    placeholder={intl.formatMessage({ id: 'mt.jine' })}
                  />
                </Form.Item>

                {/* 外部钱包入金 */}
                {/* 转出地址 */}
                <Form.Item label={intl.formatMessage({ id: 'mt.zhuanchudizhi' })}>
                  <div className="mt-1 flex items-center rounded-md bg-gray-50 p-2 dark:bg-[#21262A]">
                    {activeSolanaWallet?.meta?.icon && (
                      <img src={activeSolanaWallet?.meta?.icon} alt="" className="mr-1 h-4 w-4" />
                    )}
                    <ExplorerLink path={`address/${address}`} copyable address={address} isFormatAddress={false} />
                  </div>
                </Form.Item>
                <div className="flex items-center justify-center">
                  <img src="/img/transfer-arrow-down.png" width="29" height="29" />
                </div>

                {/* 转入地址 */}
                <Form.Item
                  label={
                    <span className="cursor-pointer">
                      <span className="mr-1">
                        <Trans>转入地址</Trans>
                      </span>
                      <Tooltip title={<Trans>PDA地址提示</Trans>}>
                        <InfoCircleOutlined style={{ fontSize: 14 }} />
                      </Tooltip>
                    </span>
                  }
                >
                  <div className="mt-1 rounded-md bg-gray-50 p-2 dark:bg-[#21262A]">
                    {/* @TODO 暂时用pda的地址 后期可能先转入privy钱包 再转pda */}
                    <ExplorerLink
                      path={`address/${accountItem.pdaTokenAddress}`}
                      copyable
                      address={accountItem.pdaTokenAddress}
                      isFormatAddress={false}
                    />
                  </div>
                </Form.Item>

                <Button type="primary" block className="mt-8" htmlType="submit">
                  <Trans>确定</Trans>
                </Button>
              </div>
            </Form>
          )}

          {/* privy内嵌钱包：展示地址给用户 */}
          {isEmbeddedWallet && (
            <div className="mt-10">
              <div className="flex flex-col gap-y-1">
                <div className="text-primary">
                  <span className="mr-1 font-medium">
                    <Trans>转入地址</Trans>(PDA)
                  </span>
                </div>
                <div className="mt-1 rounded-md bg-gray-50 p-2 dark:bg-[#21262A]">
                  {/* 暂时展示pda地址，后期改为privy地址，然后监听privy地址 转到pda地址 @TODO */}
                  <ExplorerLink path={`address/${address}`} copyable address={address} isFormatAddress={false} />
                </div>
                {/* 提示 */}
                <div className="text-weak mt-2 flex items-center text-xs">
                  <InfoCircleOutlined style={{ fontSize: 14 }} />
                  <span className="ml-1">
                    <Trans>转入地址提示</Trans>
                  </span>
                </div>
              </div>

              {/* 跨链桥接按钮 */}
              <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
                <div className="mb-2 flex items-center text-sm text-blue-600 dark:text-blue-400">
                  <InfoCircleOutlined className="mr-2" />
                  <span>支持从 TRON / Ethereum 跨链充值</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="default"
                    block
                    onClick={() => {
                      setShowTransferDialog(true)
                      close()
                    }}
                  >
                    跨链转账
                  </Button>
                  <Button
                    type="default"
                    block
                    onClick={() => {
                      setShowSwapDialog(true)
                      close()
                    }}
                  >
                    资产兑换
                  </Button>
                </div>
              </div>

              <Button type="primary" block className="mt-8" onClick={close}>
                <Trans>确定</Trans>
              </Button>
            </div>
          )}
        </Modal>

        {/* 跨链充值对话框 */}
        <TransferCryptoDialog
          open={showTransferDialog}
          onClose={() => setShowTransferDialog(false)}
          onDepositDetected={(amount, token, chain) => {
            console.log('[Deposit] Bridge completed:', { amount, token, chain })
            // 刷新余额
            getTokenBalance()
          }}
        />

        {/* 资产兑换对话框 */}
        <SwapDialog
          open={showSwapDialog}
          onClose={() => setShowSwapDialog(false)}
          onSwapComplete={(txHash) => {
            console.log('[Deposit] Swap completed:', txHash)
            // 刷新余额
            getTokenBalance()
          }}
        />

        {/* 登录入金弹窗动画 */}
        <Modal open={showLoadingModal} onClose={() => setShowLoadingModal(false)} footer={null} width={580} centered>
          <div className="flex h-[200px] flex-col items-center justify-center">
            <JumpingLoader />
            <div className="mt-8 flex flex-col items-center">
              <div className="pb-1">
                <Trans>签名交易</Trans>
              </div>
              <div>
                <Trans>签名交易提示</Trans>
              </div>
            </div>
          </div>
        </Modal>
      </>
    )
  }),
)
