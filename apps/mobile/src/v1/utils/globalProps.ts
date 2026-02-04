import type { TextInputProps, TextProps } from 'react-native'
import { Text, TextInput } from 'react-native'

// 初始化input方法

export const setCustomTextInput = (customProps: TextInputProps) => {
  // @ts-ignore
  const TextInputRender = TextInput.render
  // @ts-ignore
  const initialDefaultProps = TextInput.defaultProps
  // @ts-ignore
  TextInput.defaultProps = {
    ...initialDefaultProps,
    ...customProps
  }
  // @ts-ignore
  TextInput.render = function render(props) {
    const oldProps = props

    props = { ...props, style: [customProps.style, props.style] }
    try {
      return TextInputRender.apply(this, arguments)
    } finally {
      props = oldProps
    }
  }
}

export const setCustomText = (customProps: TextProps) => {
  // @ts-ignore
  const TextRender = Text.render
  // @ts-ignore
  const initialDefaultProps = Text.defaultProps
  // @ts-ignore
  Text.defaultProps = {
    ...initialDefaultProps,
    ...customProps
  }
  // @ts-ignore
  Text.render = function render(props) {
    const oldProps = props

    props = { ...props, style: [customProps.style, props.style] }
    try {
      return TextRender.apply(this, arguments)
    } finally {
      props = oldProps
    }
  }
}
