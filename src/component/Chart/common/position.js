import React from 'react'
import PropTypes from 'prop-types'
import isFunction from 'lodash/isFunction'

export class Position extends React.Component {
    static defaultProps = {
        widthPercentage: 1,
        heightPercentage: 1,
        groundComponent: <g role="presentation" />
    }

    static propTypes = {
        children: PropTypes.element,
        x: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
        y: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
        width: PropTypes.number,
        height: PropTypes.number,
        widthPercentage: PropTypes.number,
        heightPercentage: PropTypes.number,
        groundComponent: PropTypes.element
    }

    render() {
        const { children, groundComponent, width, widthPercentage, height, heightPercentage, x, y, ...restProps } = this.props

        const _x = isFunction(x) ? x(width, height) : x
        const _y = isFunction(y) ? y(width, height) : y

        const props = {
            transform: `translate(${_x},${_y})`
        }

        const childrenProps = {
            width: width * widthPercentage,
            height: height * heightPercentage,
            ...restProps
        }

        const newChildren = React.Children.map(children, component => {
            return (
                React.cloneElement(component, childrenProps)
            )
        })

        return React.cloneElement(groundComponent, props, newChildren)
    }
}

