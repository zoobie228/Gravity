import React, { Component } from "react"
import PropTypes from 'prop-types'
import Scroller3dContainer from './Scroller3dContainer'
import Scroller3d from './Scroller3d'
import Icon, { ICONS } from "../../Icon"
import Modal from '../../Modal'
import moment from "moment"


const hours12 = [1,2,3,4,5,6,7,8,9,10,11,12]
const hours24 = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23]
const minutes = []
const seconds = []
for(let i=0;i<60;i++){
    minutes.push(pad(i,2))
    seconds.push(pad(i,2))
}

export default class SpinnerTimepicker extends Component {
    static defaultProps = {
        readOnly: false,
        disabled: false,
        use24Hours: true,
        showSecond: true
    }
    static propTypes = {
        value: PropTypes.object,
        disabled: PropTypes.bool,
        readOnly: PropTypes.bool,
        use24Hours: PropTypes.bool,
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
            show: false,
            value: this.getValue()
        }
    }
    componentDidMount(){
        this.ampm = this.getAmpm()
    }
    UNSAFE_componentWillReceiveProps(nextProps){
        const value = this.getValue(nextProps)
        this.setState({value})
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
    onValueChange = (data)=>{
        const {onValueChange,use24Hours} = this.props
        const format = this.getFormat()
        const value = moment().hour(data.hour).minute(data.minute).second(data.second)
        let _value = moment(value,format,true)
        if(!use24Hours){
            data.ampm && (this.ampm = data.ampm)
            const formated = value.format('hh:mm:ss')+' '+this.ampm
            _value = moment(formated,format,true)
        }
        
        onValueChange && onValueChange(_value)
        this.setState({value:_value})
    }
    onChange = (e) =>{
        const {value} = this.state
        const {onChange} = this.props
        const format = this.getFormat()
        const tagName = e.target.tagName
        if(tagName==='SPAN'){
            onChange && onChange(value)
            this.handleClose()
            return
        }
        const str = e.target.value
        let val
        if(str){
            val = moment(str,format,true)
            val.initialValue = str
        }
        this.ampm = this.getAmpm()
        onChange && onChange(val)
        this.handleClose()
    }
    onCancel = () =>{
        const value = this.getValue()
        this.ampm = this.getAmpm()
        this.setState({value})
        this.handleClose()
    }
    getString = () => {
        const {value} = this.props
        const format = this.getFormat()
        const d = moment(value,format,true)
        if (!value) {
            return ''
        }
        if(d.isValid()){
            if(value.initialValue) return value.initialValue
            return d.format(format)
        }
        return value.initialValue
    }
    getValue = (props) => {
        const {value} = props || this.props
        const format = this.getFormat(props)
        const d = moment(value,format,true)
        if(d.isValid()){
            return d
        }
        return moment(moment(),format,true)
    }
    getFormat = (props) => {
        const {format,use24Hours,showSecond} = props ||this.props

        if (format) return format
        if(use24Hours) return `HH:mm${showSecond?':ss':''}`
        return `hh:mm${showSecond?':ss':''} A`
    }
    getPlaceholder = (props) => {
        const {format,use24Hours,showSecond} = props ||this.props

        if (format) return format
        return `hh:mm${showSecond?':ss':''}${use24Hours?'':' AM/PM'}`
    }
    getAmpm = () =>{
        const str = this.inputRef.value
        const isAm = /a|A/.test(str)
        const isPm = /p|P/.test(str)
        const currentAmpm = moment().hour()>12?'PM':'AM'
        return isAm && 'AM' || isPm && 'PM' || currentAmpm
    }
    render() {
        const {value} = this.state
        const {className,dialogClassName,readOnly,disabled,use24Hours,showSecond} = this.props
        const inputClassName = className && className.replace(/design2-timepicker/, '')

        let hour = value.hour()
        const minute = pad(value.minute(),2)
        const second = pad(value.second(),2)
        use24Hours || (hour = getValue(hour-1,hours12))
        return (
            <div>
                <div className={`design2-spinner-input`}>
                    <input
                        ref={(r)=>this.inputRef=r}
                        readOnly={readOnly}
                        disabled={disabled}
                        className={`input ${inputClassName?inputClassName:'input-border-color'}`}
                        placeholder={this.getPlaceholder()}
                        onChange={this.onChange}
                        onClick={readOnly?this.handleOpen:()=>{}}
                        value={this.getString()}
                    />
                    <div className={`design2-spinner-input-icon ${disabled?'disabled':''}`} onClick = {disabled ?()=>{}: this.handleOpen}>
                        <Icon name={ICONS.CLOCK} size="24" color='#ffffff'/>
                    </div>
                </div>
                <Modal show={this.state.show} onHide={this.handleClose} dialogClassName={`spinner-modal ${dialogClassName?dialogClassName:''}`}>
                    <Modal.Header closeButton={false}>
                        <span className='cancel' onClick={this.onCancel}>Cancel</span>
                        <span className='done' onClick={this.onChange}>Done</span>
                    </Modal.Header>
                    <Modal.Body>
                        <Scroller3dContainer>
                            <Scroller3d value={hour} onSelect={(v)=>this.onValueChange({hour:v,minute,second})} data={use24Hours?hours24:hours12} />
                            <Scroller3d value={minute} onSelect={(v)=>this.onValueChange({minute:v,hour,second})} data={minutes} />
                            {showSecond &&<Scroller3d value={second} onSelect={(v)=>this.onValueChange({second:v,hour,minute})} data={seconds} />}
                            {use24Hours || <Scroller3d infinite={false} value={this.ampm} onSelect={(v)=>this.onValueChange({second,hour,minute,ampm:v})} data={['AM','PM']} />}         
                        </Scroller3dContainer>
                    </Modal.Body>
                </Modal>
            </div>
        )

    }
}
function pad(num, n) {
    var len = num.toString().length
    while(len < n) {
        num = "0" + num
        len++
    }
    return num
}
function getValue(index, array=[]) {
    let i = index % array.length
    return array[i >= 0 ? i : i + array.length]
}
    