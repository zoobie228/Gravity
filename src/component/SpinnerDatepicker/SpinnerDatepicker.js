import React, { Component } from "react"
import PropTypes from 'prop-types'
import Spinner from './Spinner'
import Icon, { ICONS } from "../../Icon"
import Modal from '../../Modal'
import moment from "moment"

export default class SpinnerDatepicker extends Component {
    static defaultProps = {
        readOnly: false,
        disabled: false,
        format: 'MM/DD/YYYY'
    }
    static propTypes = {
        value: PropTypes.object,
        disabled: PropTypes.bool,
        readOnly: PropTypes.bool,
        format: PropTypes.string,
        inputClassName: PropTypes.string,
        dialogClassName: PropTypes.string,
        onOpenChange: PropTypes.func,
        onValueChange: PropTypes.func,
        onChange: PropTypes.func,
        onCancel: PropTypes.func,
    }
    constructor(props) {
        super(props)
        this.state={
            show: false
        }
        this.value = this.getValue() || moment(moment(),props.format,true)
    }
    handleOpen = ()=>{
        this.setState({show:true})
        const {onOpenChange} = this.props
        onOpenChange && onOpenChange(true)
    }
    handleClose = () =>{
        this.setState({show:false})
        const {onOpenChange} = this.props
        onOpenChange && onOpenChange(false)
    }
    onValueChange = (value)=>{
        const {onValueChange} = this.props
        this.value = value
        onValueChange && onValueChange(value)
    }
    onChange = (e) =>{
        const {onChange,format} = this.props
        const tagName = e.target.tagName
        if(tagName==='SPAN'){
            onChange && onChange(this.value)
            this.handleClose()
            return
        }
        const str = e.target.value.trim()
        let value
        if(str){
            value = moment(str,format,true)
            value.initialValue = str
        }
        this.value = this.getValue(value)
        onChange && onChange(value)
        this.handleClose()
    }
    onCancel = () =>{
        this.handleClose()
    }
    getString = () => {
        const {value,format} = this.props
        
        const d = moment(value,format,true)
        if (!value) {
            return ''
        }
        if(d.isValid()){
            return d.format(format)
        }
        return value.initialValue
    }
    getValue = (val) => {
        const {value,format} = this.props
        const d = moment(val ||value,format,true)
        if(d.isValid()){
            return d
        }
        return moment(moment(),format,true)
    }
    render() {
        const {className,dialogClassName,readOnly,disabled,format} = this.props
        const inputClassName = className && className.replace(/design2-datepicker/, '')
        return (
            <div>
                <div className={`design2-spinner-input`}>
                    <input
                        readOnly={readOnly}
                        disabled={disabled}
                        className={`input ${inputClassName?inputClassName:'input-border-color'}`}
                        placeholder={format}
                        onChange={this.onChange}
                        onClick={readOnly?this.handleOpen:()=>{}}
                        value={this.getString()}
                    />
                    <div className={`design2-spinner-input-icon ${disabled?'disabled':''}`} onClick = {disabled ?()=>{}: this.handleOpen}>
                        <Icon name={ICONS.CALENDAR} size="24" color='#ffffff'/>
                    </div>
                </div>
                <Modal show={this.state.show} onHide={this.handleClose} dialogClassName={`spinner-modal ${dialogClassName?dialogClassName:''}`}>
                    <Modal.Header closeButton={false}>
                        <span className='cancel' onClick={this.onCancel}>Cancel</span>
                        <span className='done' onClick={this.onChange}>Done</span>
                    </Modal.Header>
                    <Modal.Body>
                        <Spinner value={this.getValue()} onChange={this.onValueChange} />
                    </Modal.Body>
                </Modal>
            </div>
        )

    }
}