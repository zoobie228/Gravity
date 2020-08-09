import React, { Component } from "react"
import throttle from 'lodash/throttle'

export default class Scroller3d extends Component {
    static defaultProps = {
        height: 38,
        wheelSize: 18,
        infinite: true
    }
    constructor(props) {
        super(props)
        const { value, infinite, wheelSize, height } = props
        this.rotateAngle = 360 / wheelSize
        this.size = Math.round(wheelSize / 2)
        this.firstItemRotateAngle = 0
        const wheel = infinite ? this.generateInfiniteWheel(0) : this.generateWheel()
        const index = wheel.findIndex((d)=>d.value==value)
        const scrollAngle = this.rotateAngle * index
        this.state = {
            wheel,
            scrollAngle
        }

        this.transformTransitionEnd = true
        this.h = Math.ceil(height / 2 / Math.tan(this.rotateAngle / 2 / 180 * Math.PI))
        const r = this.h / Math.cos(this.rotateAngle / 2 / 180 * Math.PI)
        this.x = Math.ceil(r * Math.cos(this.rotateAngle / 180 * Math.PI))
    }
    UNSAFE_componentWillReceiveProps(nextProps){
        nextProps.infinite && this.resetWheel(0,nextProps)
    }
    getValue(index, array=[]) {
        let i = index % array.length
        return array[i >= 0 ? i : i + array.length]
    }
    getIndex(value, array=[]) {
        return array.findIndex((d) => {
            return d == value
        })
    }
    generateInfiniteWheel = (index,props) => {
        const { value, data } = props ||this.props
        const currentIndex = this.getIndex(value, data) + index

        let firstIndex = currentIndex - this.size + 1
        let lastIndex = currentIndex + this.size

        const firstAngle = this.firstItemRotateAngle - index * this.rotateAngle

        let wheel = []
        for (let i = firstIndex; i <= lastIndex; i++) {
            let value = this.getValue(i, data)
            wheel.push({ value, index: i, angle: -(i - firstIndex) * this.rotateAngle + (firstAngle || 0) })
        }
        return wheel
    }
    generateWheel = (props) => {
        const { data } = props ||this.props
        let wheel = []
        for (let i = 0; i < data.length; i++) {
            let value = data[i]
            wheel.push({ value, index: i, angle: -i * this.rotateAngle })
        }
        return wheel
    }
    resetWheel = (index,props) => {
        const newWheel = this.generateInfiniteWheel(index,props)
        this.setState({ wheel: newWheel })
    }
    onSelect = (index) => {
        const { value, data, onSelect } = this.props
        const currentIndex = this.getIndex(value, data)
        const selectedIndex = currentIndex + index
        const selectedValue = this.getValue(selectedIndex, data)

        index && onSelect && onSelect(selectedValue)
    }
    onTouchStart = ({changedTouches:touchStart}) => {
        const { scrollAngle, wheel } = this.state
        const { height, infinite } = this.props

        if(this.transformTransitionEnd){
            const getDiff = (touchEnd) => {
                const pos = touchEnd[0].clientY - touchStart[0].clientY
                return -pos / height
            }
            let moving = true
            const onMove = ({changedTouches}) => {
                if (moving) {
                    let _scrollAngle = scrollAngle + getDiff(changedTouches) * this.rotateAngle
                    if(!infinite){
                        _scrollAngle = Math.min( (wheel.length-1)*this.rotateAngle+this.rotateAngle/4, Math.max(-this.rotateAngle/4, _scrollAngle))
                    }else{
                        const batchIndex = Math.round(getDiff(changedTouches))
                        this.resetWheel(batchIndex)
                    }
                    this.setState({
                        scrollAngle: _scrollAngle
                    })
                }
    
            }
            const throttledOnMove = throttle(onMove, 16)
            const onEnd = ({changedTouches}) => {
                moving = false
                let batchIndex = Math.round(getDiff(changedTouches))
                let _scrollAngle = scrollAngle + batchIndex * this.rotateAngle
    
                if(!infinite){
                    _scrollAngle = Math.min( (wheel.length-1)*this.rotateAngle, Math.max(0, _scrollAngle))
                    batchIndex = Math.min( Math.round((_scrollAngle-scrollAngle)/this.rotateAngle), Math.max(0, batchIndex))
                }
                this.setState({
                    scrollAngle: _scrollAngle
                })
                this.firstItemRotateAngle -= batchIndex * this.rotateAngle
                
                this.batchIndex = batchIndex
                batchIndex===0 || (this.transformTransitionEnd = false)
                this.touchEnd = true
                document.removeEventListener('touchmove', throttledOnMove)
                document.removeEventListener('touchend', onEnd)
            }
            document.addEventListener('touchmove', throttledOnMove)
            document.addEventListener('touchend', onEnd)
        }
    }
    onTransitionEnd = ({propertyName}) => {
        // transition end != touch end
        if(propertyName==='transform' && this.touchEnd===true){
            this.transformTransitionEnd = true
            this.touchEnd = false
            this.onSelect(this.batchIndex)
        }
    }
    render() {
        const { wheel, scrollAngle } = this.state
        const { value, height, style } = this.props
        
        return (
            <div className='scrollerContainer' style={{...style,height:2*this.x}}>
                <div className='scrollerMask' onTouchStart={this.onTouchStart} style={{transform:`translateZ(${this.h}px)`}} />
                <div className='scroller3d' onTransitionEnd={this.onTransitionEnd} style={{height, marginTop: -height / 2, transform: `rotateX(${scrollAngle}deg)` }}>
                    {
                        wheel && wheel.map((d) => {
                            let selected = value == d.value
                            return (
                                <div key={d.index} className={`option ${selected ? 'selected' : ''}`} style={{ 'height': height, lineHeight: `${height}px`,fontSize:Math.round(0.6*height), 'transform': `rotateX(${d.angle}deg) translateZ(${this.h}px)` }}>{d.value}</div>
                            )
                        })
                    }
                </div>
            </div>
        )
    }
}