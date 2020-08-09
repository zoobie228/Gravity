import React, { Component } from "react"

export default class SpinnerContainer extends Component {
    static defaultProps = {
        height: 38
    }
    render(){
        const {height,children} = this.props
        return(
            <div className='spinner'>
                <div className='divider' style={{height,marginTop:-height/2}} />
                {
                    children
                }
            </div>
        )
    }
}