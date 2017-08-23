import React, { Component } from 'react';
import { autorun } from "mobx"
import Victor from "../lib/Victor"
import { teams } from "../lib/gameInfo"

function rect(props) {
    const { ctx, x, y, width, height } = props;
    ctx.fillRect(x, y, width, height);
}

function bullet(ctx, x, y, angle, colour) {
    ctx.fillStyle = colour //makeGradient(ctx, colour)
    ctx.translate(x, y)
    ctx.rotate(angle);
    rect({ ctx, x: -1, y: -3, width: 2, height: 6 });
    ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function dashedLine(ctx, x, y, targetX, targetY, lineWidth, strokeColour) {
    ctx.strokeStyle = strokeColour
    ctx.beginPath()
    ctx.setLineDash([2, 5])
    ctx.moveTo(x, y)
    ctx.lineTo(targetX, targetY)
    ctx.lineWidth = lineWidth
    ctx.stroke()
}

class CanvasBullets extends Component {
    componentDidMount() {
        this.componentDidUpdate()
    }

    componentDidUpdate() {
        // clear existing autorun
        if (this.disposer) this.disposer();
        // update bullet positions when mobx values are updated
        this.disposer = autorun(() => {
            const ctx = this.refs.canvas.getContext('2d');
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

            // Draw lines
            this.props.units.forEach(unit => {
                const { targetCoordinates, x, y, team: { colour } } = unit
                if (targetCoordinates) {
                    let offset = unit.team === teams.red ? 3 : -3
                    dashedLine(ctx, x + offset, y + offset, targetCoordinates.x + offset, targetCoordinates.y + offset, unit.showDistanceRings ? 10 : 1, colour)
                }
            })

            // Draw bullets
            this.props.bullets.forEach(b => {
                const { sourceCoordinate: { x: sourceX, y: sourceY }, currentCoordinate: { x, y } } = b
                let angle = (new Victor(x - sourceX, sourceY - y)).verticalAngle()
                bullet(ctx, x, y, angle, b.sourceUnit.team.bulletColour)
            })
        })
    }

    render() {
        const { width, height } = this.props
        return (
            <canvas ref="canvas" className="bulletCanvas" width={width} height={height} />
        );
    }
}

export default CanvasBullets