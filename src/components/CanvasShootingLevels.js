import React, { Component } from 'react';
import { autorun } from "mobx"

function drawArc(ctx, topLeft, topRight, percent) {
    ctx.translate(topLeft, topRight)
    ctx.beginPath();
    ctx.strokeStyle = '#444';
    ctx.lineWidth = '2';
    ctx.arc(0, 0, 4, 0, Math.PI * 2 * 1)
    ctx.stroke();
    ctx.setLineDash([])
    ctx.rotate((-1 / 2) * Math.PI)
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2 * percent)
    ctx.strokeStyle = 'yellow';
    ctx.lineWidth = '2';
    ctx.stroke();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
}

class CanvasShootingLevels extends Component {
    componentDidMount() {
        this.componentDidUpdate()
    }

    componentDidUpdate() {
        if (this.disposer) this.disposer();
        this.disposer = autorun(() => {
            const ctx = this.refs.canvas.getContext('2d');
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            this.props.units.forEach(unit => {
                const { x, y, shootingLevel, unitType: { shootingLevelXOffset } } = unit
                if (!shootingLevel || shootingLevel === 0) return
                drawArc(ctx, x + shootingLevelXOffset, y - 30, shootingLevel / 100)
                ctx.setTransform(1, 0, 0, 1, 0, 0);
            })
        })
    }

    render() {
        const { width, height } = this.props
        return (
            <canvas ref="canvas" className="shootingLevelCanvas" width={width} height={height} ></canvas>
        );
    }
}

export default CanvasShootingLevels