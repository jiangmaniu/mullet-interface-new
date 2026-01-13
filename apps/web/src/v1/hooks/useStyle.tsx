import { useEmotionCss } from '@ant-design/use-emotion-css'

export default function useStyle() {
  const recordListClassName = useEmotionCss(({ token }) => {
    return {
      '.ant-table-thead > tr > th': {
        fontSize: '12px !important',
        color: 'var(--color-text-weak) !important',
        backgroundColor: '#0e123a !important',
        fontWeight: '500 !important'
      },
      '.ant-empty': {
        height: '125px !important',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
      }
    }
  })
  return {
    recordListClassName
  }
}
