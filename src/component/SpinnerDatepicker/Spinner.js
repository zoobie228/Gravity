import React, { Component } from "react"
import PropTypes from 'prop-types'
import Scroller3dContainer from './Scroller3dContainer'
import Scroller3d from './Scroller3d'
import moment from "moment"

const years = []
for(let i=1900; i<=2099; i++){
    years.push(i)
}
const months = ["January","February","March","April","May","June","July","August","September","October","November","December"]

export default class Spinner extends Component {
    static propTypes = {
        children: PropTypes.func,
    }
    constructor(props){
        super(props)

        this.state={
            month: this.getMonth(props),
            day: this.getDay(props),
            year: this.getYear(props),
            days: this.getDays(props)
        }
    }
    UNSAFE_componentWillReceiveProps(nextProps){
        if(!nextProps.children){
            this.setState({
                month: this.getMonth(nextProps),
                day: this.getDay(nextProps),
                year: this.getYear(nextProps),
                days: this.getDays(nextProps)
            })
        }
    }
    getMonth = (props)=>{
        const value = props.value
        return value && months[value.month()]
    }
    getDay = (props)=>{
        const value = props.value
        return value && value.date()
    }
    getYear = (props)=>{
        const value = props.value
        return value && value.year()
    }
    getDays=(props)=>{
        const value = props.value || moment()
        const finalDay = value.daysInMonth()
        const days=[]
        for(let i=1;;i++){
            if(i>finalDay) break;
            days.push(i)
        }
        return days
    }
    onSelect = (value) =>{
        const {month,day,year} = this.state
        const {onChange} = this.props

        let selected = {month,day,year,...value}
        const _selected = moment().year(selected.year).month(selected.month)
        const lastDay = _selected.daysInMonth()
        let selectedValue
        if(lastDay<=selected.day){
            selectedValue = _selected.date(lastDay)
            selected = {...selected,day:lastDay}
        }else{
            selectedValue = _selected.date(selected.day)
        }
        const newDays = this.getDays({value:selectedValue})
        this.setState({...selected,days:newDays})
        onChange && onChange(selectedValue)
    }
    render(){
        const {days,month,day,year} = this.state
        const {children,visibleSize,height} = this.props
        const _height = height || 38
        const wheelSize = ((visibleSize || 7)+2)*2
        return(
            <Scroller3dContainer height={_height}>
                {
                    children?
                    children({days,months,years,month,day,year,onSelect:this.onSelect}):(
                        <React.Fragment>
                            <Scroller3d value={month} onSelect={(v)=>this.onSelect({month:v})} data={months} style={{width:130,textAlign:'right'}} wheelSize={wheelSize} height={_height} />
                            <Scroller3d value={day} onSelect={(v)=>this.onSelect({day:v})} data={days} wheelSize={wheelSize} height={_height} />
                            <Scroller3d value={year} onSelect={(v)=>this.onSelect({year:v})} data={years} wheelSize={wheelSize} height={_height} />
                        </React.Fragment>
                    )
                }
            </Scroller3dContainer>
        )
    }
}