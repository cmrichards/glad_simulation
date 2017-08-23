// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import Bullet from "../lib/Bullet"
import { metersToPixel } from "../lib/TickUtils"
import { gameParams } from "../lib/gameInfo"

@observer
class BulletView extends Component {
    props: {
        bullet: Bullet
    }
    render() {
        const { currentCoordinate: { x, y } } = this.props.bullet
        return (
            <div 
            className="bullet" 
            style={{ transform: "translate(" + Math.round(x) + "px, " + Math.round(y) + "px)" }}>
            </div>
        )
    }
}

export default BulletView
