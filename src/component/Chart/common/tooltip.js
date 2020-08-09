import React from 'react'
import ReactDOM from 'react-dom'
import StandardTooltip from '../../StandardTooltip'
import AutoTooltip from '../../AutoTooltip'


class ToolTip extends React.Component {
    static propTypes = StandardTooltip.propTypes
    static defaultProps = StandardTooltip.defaultProps // to inherit role prop, important

    constructor(props) {
        super(props);
        this.node = document.createElement('div')
    }
    
    componentDidMount() {
        document.body.appendChild(this.node)
    }
    
    componentWillUnmount() {
        document.body.removeChild(this.node)
    }

    render() {
        let { className, ...props } = this.props // eslint-disable-line
        return (
            ReactDOM.createPortal(
                <React.Fragment>
                    {<StandardTooltip {...props} className={`${className || ''} ssd-chart-tooltip`}/>}
                </React.Fragment>, this.node
            )
        )
    }
}

export { ToolTip, AutoTooltip }