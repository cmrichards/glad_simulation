// @flow
import React, { Component } from 'react'
import { observer } from 'mobx-react'

@observer
export default class Fps extends Component {
    render() {
        const { fps } = this.props.game.frameRateRecorder
        return (
            <div className="fps">FPS: {fps}</div>
        )
    }
}