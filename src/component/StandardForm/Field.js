import {useContext} from 'react'
import { Field as RcField } from 'rc-field-form'
import { FormContext} from './FormContext'
import classNames from 'classnames'

const Field = (props) => {
    const {
        className,
        label,
        name,
        labelStyle,
        wrapperStyle,
        prefixCls : customizePrefixCls,
        children,
        rules,
        ...rest
    } = props

    const {
        layout,
        getPrefixCls
    } = useContext(FormContext)

    const prefixCls = getPrefixCls('standardForm',customizePrefixCls)
    const formFieldWrapperClassName = classNames(
        {
            [`${prefixCls}-field-wrapper`]: true,
            [`${prefixCls}-field-wrapper-${layout}`]: true,
        },
        className
    )

    return (
            <div className={formFieldWrapperClassName} >
                <RcField {...rest} name={name} rules={rules}>
                    {(control,meta,context)=>{
                        let childNode = null
                        if(React.isValidElement(children)){
                            const childProps = {...children.props,...control,id:name}
                            childNode = React.cloneElement(children,childProps)
                        }else if(typeof children === 'function'){
                            childNode = children(context)
                        }
                        const fieldInputClassName = classNames(
                            {
                                [`${prefixCls}-field-input`]: true,
                                [`${prefixCls}-field-input-error`]: meta.errors.length>0
                            }
                        )
                        const isRequired = rules && rules.some(rule => {
                            if(rule && typeof rule === 'object' && rule.required) {
                                return true
                            }
                            if(typeof rule === 'function'){
                                const ruleEntity = rule(context)
                                return ruleEntity && ruleEntity.required
                            }
                            return false
                        })
                        const fieldLabelClassName = classNames(
                            {
                                [`${prefixCls}-field-label`]: true,
                                [`${prefixCls}-field-label-required`]: isRequired
                            }
                        )
                        return (
                            <>
                                {label && (
                                    <div className={fieldLabelClassName} style={labelStyle}>
                                        <label htmlFor={name}>{label}</label>
                                    </div>
                                )}
                                <div className={fieldInputClassName} style={wrapperStyle}>
                                    {childNode}
                                    <div className={`${prefixCls}-field-error`}>{meta.errors}</div>
                                </div>
                            </>
                        )
                         
                    }}
                </RcField>
            </div>
    )
}

export default Field