import { useIntl } from '@umijs/max'
import { notification } from 'antd'

type NoticeProps = {
  title?: string
  content: JSX.Element | string
}

// 消息通知
export default function useNotice() {
  const intl = useIntl()

  const showNotice = (props: NoticeProps) => {
    const { title, content } = props
    notification.info({
      message: <span className="text-primary font-medium">{title || intl.formatMessage({ id: 'mt.wenxintishi' })}</span>,
      description: <span className="text-secondary">{content}</span>,
      placement: 'bottomRight',
      style: {
        background: 'var(--dropdown-bg)'
      },
      showProgress: true
    })
  }

  return {
    showNotice
  }
}
