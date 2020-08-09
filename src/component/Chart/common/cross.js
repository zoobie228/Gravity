import React from 'react'
import PropTypes from 'prop-types'
import classname from 'classnames'

export class Cross extends React.Component {
    static propTypes = {
        x: PropTypes.number,
        y: PropTypes.number,
        width: PropTypes.number,
        height: PropTypes.number,
        show: PropTypes.bool
    }

    render() {
        let {
            show = false,
            width,
            height,
            x,
            y
        } = this.props
        let className = classname({
            cross: show
        })

        return (
            <React.Fragment>
                <line
                    key={0}
                    className={`${className} v`}
                    x1={x}
                    y1={0}
                    x2={x}
                    y2={height}
                />
                <line
                    key={1}
                    className={`${className} h`}
                    x1={0}
                    y1={y}
                    x2={width}
                    y2={y}
                />
            </React.Fragment>
        )
    }
}