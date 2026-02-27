import * as Slot from '@rn-primitives/slot'
import * as React from 'react'
import { View, Text } from 'react-native'
import { Controller, FormProvider, useFormContext, useFormState } from 'react-hook-form'
import type { ControllerProps, FieldPath, FieldValues } from 'react-hook-form'

import { cn } from '@/lib/utils'

const Form = FormProvider

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue)

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState } = useFormContext()
  const formState = useFormState({ name: fieldContext.name })
  const fieldState = getFieldState(fieldContext.name, formState)

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>')
  }

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

type FormItemContextValue = {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue)

function FormItem({ className, ...props }: React.ComponentProps<typeof View>) {
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <View className={cn('flex flex-col gap-medium', className)} {...props} />
    </FormItemContext.Provider>
  )
}

function FormLabel({ className, ...props }: React.ComponentProps<typeof Text>) {
  const { error } = useFormField()

  return (
    <Text
      className={cn(
        'text-paragraph-p2 text-content-1 font-medium',
        error && 'text-status-danger',
        className,
      )}
      {...props}
    />
  )
}

function FormControl({ ...props }: React.ComponentProps<typeof Slot.View>) {
  const { error, formItemId } = useFormField()

  return (
    <Slot.View
      nativeID={formItemId}
      accessibilityState={{ disabled: false, ...(error ? { invalid: true } : {}) } as any}
      {...props}
    />
  )
}

function FormDescription({ className, ...props }: React.ComponentProps<typeof Text>) {
  const { formDescriptionId } = useFormField()

  return (
    <Text
      nativeID={formDescriptionId}
      className={cn('text-paragraph-p3 text-content-4', className)}
      {...props}
    />
  )
}

function FormMessage({ className, children, ...props }: React.ComponentProps<typeof Text>) {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message ?? '') : children

  if (!body) {
    return null
  }

  return (
    <Text
      nativeID={formMessageId}
      className={cn('text-paragraph-p3 text-status-danger', className)}
      {...props}
    >
      {body}
    </Text>
  )
}

export { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, useFormField }
