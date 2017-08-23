// @flow
import React, { Component } from 'react';
import Game from "../lib/Game"
import { gameParams } from "../lib/gameInfo"

class GameControls extends Component {

    props: {
        game: Game,
        reset: (a:number) => void
    }

    jumpBack = () => {
        const {reset, game} = this.props
        let tickNumber = Math.max(0, game.tickCount - (3 * (1000/gameParams.millisecondsPerFrame.normal)))
        reset({ jumpToTickNumber: tickNumber })
    }

    render() {
        const { game, reset } = this.props
        return (
            <div className="controls">
                <button onClick={this.jumpBack}>-3s</button>
                <button onClick={game.pause}><i className="fa fa-pause"/></button>
                <button onClick={game.slowMotion}><i className="fa fa-step-forward"/></button>
                <button onClick={game.play}><i className="fa fa-play"/></button>
                <button onClick={game.fastMotion}><i className="fa fa-forward"/></button>
                <button onClick={reset}><i className="fa fa-refresh"/></button>
                <button onClick={game.tick}>+</button>
            </div>
        )
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextProps.game !== this.props.game
    }
}

export default GameControls
