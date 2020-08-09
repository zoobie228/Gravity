import React, {forwardRef, useImperativeHandle} from 'react'
import Form, { useForm as useRcForm, List } from 'rc-field-form'
import { FormContext} from './FormContext'
import Field from './Field'
import classNames from 'classnames'



const getPrefixCls = (suffixCls,customizePrefixCls) => {
    const prefixCls = 'cdt4'
    if (customizePrefixCls) return customizePrefixCls
    return suffixCls? `${prefixCls}-${suffixCls}` : prefixCls
}
const useForm = (form) => [form || {...useRcForm()[0]}]
const StandardForm = forwardRef((props,ref) => {
    const {
        form,
        layout = 'horizontal',
        prefixCls : customizePrefixCls,
        className = '',
        children,
        ...rest
    } = props
    
    const [wrapForm] = useForm(form)
    useImperativeHandle(ref, () => wrapForm)

    const prefixCls = getPrefixCls('standardForm',customizePrefixCls)
    const formClassName = classNames(
        prefixCls,
        {
            [`${prefixCls}-${layout}`]: true,
        },
        className
    )
    return (
        <FormContext.Provider
            value={{
                layout,
                getPrefixCls
            }}
        >
            <Form className={formClassName} form={wrapForm} {...rest}>
                {children}
            </Form>
        </FormContext.Provider>
    )
})

export {useForm,Field}
export default StandardForm