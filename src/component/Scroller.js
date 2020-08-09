import React from 'react'
import PropTypes from 'prop-types'
import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer'
import List from 'react-virtualized/dist/commonjs/List'
import throttle from 'lodash/throttle'

const isSafari = /Mac/.test(navigator.platform)
const sUserAgent = navigator.userAgent
const isMobile = sUserAgent.indexOf('Android') > -1 || sUserAgent.indexOf('iPhone') > -1 || sUserAgent.indexOf('iPad') > -1 
export default class Scroller extends React.Component {
    static propTypes = {
        rowCount: PropTypes.number.isRequired,
        height: PropTypes.number,
        tabIndex: PropTypes.number,
        rowHeight: PropTypes.any,
        noRowsRenderer: PropTypes.func,
        rowRenderer: PropTypes.func
    }

    constructor(props) {
        super(props)
        this.state = {
            scrollBarTop: 0
        }
        this.offsetHeight=0
        this.isScrolling=false
        this.totalHeight=this.calcTotalHeight(props)
        this.calcScrollBarHeight(props)
    }
    UNSAFE_componentWillReceiveProps(nextProps){
        this.totalHeight=this.calcTotalHeight(nextProps)
        this.calcScrollBarHeight(nextProps)
        this.listRef.recomputeRowHeights()
        // this.listRef.forceUpdateGrid()
    }
    calcTotalHeight=(props)=>{
        const {rowCount,rowHeight}=props
        let result=0
        if(typeof rowHeight==='function'){
            for(let i=0;i<rowCount;i++){
                result +=rowHeight({index:i})
            }
            return result
        }else{
            return rowCount*rowHeight
        }
        
    }
    calcScrollBarHeight=(props)=>{
        this.scrollBarHeight = props.height * props.height / this.totalHeight
        if(this.scrollBarHeight<20){
            this.offsetHeight=20-this.scrollBarHeight
            this.scrollBarHeight=20
        }
    }
    handleListScroll = ({ clientHeight, scrollHeight, scrollTop }) => {
        const { height } = this.props

        if(!this.isScrolling){
            const scrollBarTop = (height-this.offsetHeight) * scrollTop / scrollHeight
            this.setState({
                scrollBarTop: scrollBarTop
            })
        }
    }
    onMouseDown = ({pageY:start}) => {
        const { scrollBarTop } = this.state
        const { height } = this.props
        
        const onMove = ({pageY:end})=> {
            const delta = end - start
            this.isScrolling=true
            const newScrollBarTop = Math.min(height - this.scrollBarHeight , Math.max(0, scrollBarTop + delta))
            const contentScrollTop = this.totalHeight * (newScrollBarTop) / (height-this.offsetHeight)
            
            this.listRef.scrollToPosition(contentScrollTop)
            this.setState({
                scrollBarTop: newScrollBarTop
            })
        }
        const throttledOnMove=throttle(onMove,16)
        const onUp = ()=>{
            this.isScrolling=false
            document.removeEventListener('mousemove', throttledOnMove)
            document.removeEventListener('mousemove', onUp)
        }
        document.addEventListener('mousemove', throttledOnMove)
        document.addEventListener('mouseup', onUp)
    }
    render() {
        const { scrollBarTop } = this.state
        const { className, rowCount, height, rowHeight ,tabIndex,rowRenderer,noRowsRenderer,...props} = this.props
        const show = height < this.totalHeight && !isSafari && !isMobile
        return (
            <div className={className} style={{ position: 'relative', overflow: 'hidden' }}>
                {show && <div style={{
                    position: 'absolute',
                    cursor: 'pointer',
                    transform: `translateY(${scrollBarTop}px)`,
                    right: 0,
                    width: 6,
                    marginRight: 0,
                    height: this.scrollBarHeight,
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    borderRadius: 3,
                    zIndex: 1
                }}
                    onMouseDown={this.onMouseDown}
                />}
                <AutoSizer disableHeight>
                    {({ width }) => (
                        <List
                            className='design2-alertcenter-list'
                            width={show?width+18:width}
                            ref={(r)=>{this.listRef=r}}
                            height={height}
                            rowCount={rowCount}
                            rowHeight={rowHeight}
                            rowRenderer={rowRenderer}
                            noRowsRenderer={noRowsRenderer}
                            tabIndex={tabIndex}
                            onScroll={this.handleListScroll}
                            {...props}
                        />
                    )}
                </AutoSizer>
            </div>
        )
    }
}