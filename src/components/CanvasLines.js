import React, { Component } from 'react';
import { autorun } from "mobx"
import { teams } from "../lib/gameInfo"

function dashedLine(ctx, x, y, targetX, targetY, lineWidth, strokeColour) {
    ctx.strokeStyle = strokeColour
    ctx.beginPath()
    ctx.setLineDash([2, 5])
    ctx.moveTo(x, y)
    ctx.lineTo(targetX, targetY)
    ctx.lineWidth = lineWidth
    ctx.stroke()
}

class CanvasLines extends Component {
    componentDidMount() {
        this.componentDidUpdate()
    }

    componentDidUpdate() {
        const { units, height, width } = this.props
        // clear existing autorun
        if (this.disposer) this.disposer();
        // update bullet positions when mobx values are updated
        this.disposer = autorun(() => {
            const ctx = this.refs.canvas.getContext('2d');
            ctx.fillStyle = "white"
            ctx.clearRect(0, 0, width, height);
            units.forEach(unit => {
                const { targetCoordinates, x, y, team: { colour } } = unit
                if (targetCoordinates) {
                    let offset = unit.team === teams.red ? 3 : -3
                    dashedLine(ctx, x+offset, y+offset, targetCoordinates.x+offset, targetCoordinates.y+offset, unit.showDistanceRings ? 10 : 1, colour)
                }
            })
        })
    }

    render() {
        const { width, height } = this.props
        return (
            <canvas 
                ref="canvas" 
                className="linesCanvas" 
                width={width} 
                height={height} 
                style={{ position: "absolute", top: 0, left: 0}}>
            </canvas>
        );
    }
}

export default CanvasLines