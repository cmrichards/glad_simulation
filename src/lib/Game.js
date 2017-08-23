// @flow
import { observable, action, computed } from 'mobx'
import _ from "lodash"

import FrameRateRecorder from "./FrameRateRecorder"
import Victor from './Victor' // Vector processing
import Bullet from "./Bullet"
import Board from "./Board"
import Unit from "./Unit"
import { createFiringPattern } from "./FiringPattern"
import { actionTypes, directions, gameParams } from "./gameInfo"
import { pixelsToMeter, metersPerSecondToPixelsPerTick, metersToPixel, pixelsPerTick, millisecondsToTick } from "./TickUtils"

class Game {
    board: Board
    tickCount: number
    frameRateRecorder: FrameRateRecorder

    @observable tickCount: number;
    @observable board: Board;
    @observable fps: number = 0;

    @computed get timeElapsedInSeconds(): number {
        return this.tickCount < 0
            ? 0
            : Math.floor(this.tickCount * gameParams.millisecondsPerFrame.normal / 1000)
    }

    // @computed get timeElapsedInMilliseconds(): number {
    //     return this.tickCount < 0 ? 0 : this.tickCount * gameParams.millisecondsPerFrame.normal
    // }

    constructor(config: Object, startAtTick: ?number) {
        this.board = new Board()
        this.tickCount = -1

        this.frameRateRecorder = new FrameRateRecorder()
        this.board.addUnitsToBoard(config)
        if(startAtTick && startAtTick > 0) {
            this.jumpForwardToTick(startAtTick)
        }
    }

    // Creates a config that can be stored in Firebase for the current map.
    // Uses Time=0seconds or current time on board
    generateMapConfig({ name, atCurrentTime = false }) {
        let units = this.board.units.map(unit => {
            return {
                ai: unit.ai.id,
                team: unit.team.id, 
                type: unit.unitType.id,
                shield: atCurrentTime ? unit.shield : unit.initialShield,
                hp: atCurrentTime ? unit.hp : unit.initialHp,
                x: pixelsToMeter(atCurrentTime ? unit.x : unit.initialX),
                y: pixelsToMeter(atCurrentTime ? unit.y : unit.initialY),
            }
        })

        let minX = _.minBy(units, unit => unit.x).x
        let minY = _.minBy(units, unit => unit.y).y

        return {
            name,
            units: units.map(unit => {
                return {
                    ...unit, x: unit.x - minX, y: unit.y - minY
                }
            })
        }
    }

    // Remove all bullets and reset all units back to original positions 
    @action
    resetBoard() {
        this.pause() 
        this.tickCount = -1
        this.board.bullets.clear()
        this.board.deadUnits.forEach(deadUnit => {
            this.board.units.push(deadUnit)
        })
        this.board.deadUnits = []
        this.board.units.forEach(unit => {
            unit.shootingLevel = 0
            unit.hitCounter = 0
            unit.lastDamageTick = 0
            unit.dead = false
            unit.x = unit.initialX
            unit.y = unit.initialY
            unit.hp = unit.initialHp
            unit.shield = unit.initialShield
            unit.currentAction = { actionType: actionTypes.idle }
            unit.performAction = () => { return () => { } }
        })
    }

    pause =      () => { if(this.stopMain) window.cancelAnimationFrame(this.stopMain) }
    play =       () => { this.changeSpeed(1) }
    fastMotion = () => { this.changeSpeed(10) }
    slowMotion = () => { this.changeSpeed(0.25) }
    changeSpeed(factor: number) {
        this.pause()
        this.start(factor)
    }

    @action 
    jumpForwardToTick(tickNumber: number): void {
        while (this.tickCount < tickNumber) 
            this.tick()
    }

    // Run [ticksToRun] number of ticks per rendered frame
    @action 
    executeTicks(ticksToRun: number) {
        this.frameRateRecorder.recordFrame()
        for (var i = 0; i < ticksToRun; i++) {
            this.tick()
        }
        this.board.setDistanceToSelectedUnit()
    }

    tick= () => {
        this.tickCount += 1;

        // Todo: bullets shouldn't take damage from units before the units AI
        // is executed in this tick. Simply move to the end of the tick next to
        // shield regeneration?
        this.board.bullets.forEach(bullet => this.moveBullet(bullet))

        // 1. Generate modifier function for every unit, then
        // 2. Execute the modifier function
        // Modifier functions cannot reference unit data from previous ticks.
        // This ensures that modifications are only calculated based on data from previous tick

        // Run the unit's AI and set the unit.nextAction property for each unit
        this.board.units.forEach(unit => this.fetchNextAction(unit))

        // Set the currentAction to the nextAction set in the previous step.
        // This must be done only after all the AIs steps have been fetched
        // , because the AIs use the currentAction to see what other units are doing
        let modifierFunctions = this.board.units
            .map(unit => {
                if(unit.nextAction) unit.currentAction = unit.nextAction
                return unit.performAction()
            })

        modifierFunctions.forEach(f => f())

        this.regenerateShield()
    }

    start(speedUpFactor: number = 1): void {
        (() => {
            // clean up
            this.frameRateRecorder.start(speedUpFactor)
            const main = (tFrame) => {
                this.stopMain = window.requestAnimationFrame(main);
                var nextTick = this.lastTick + this.tickLength
                var numTicks = 0;
                if (tFrame > nextTick) {
                    var timeSinceTick = tFrame - this.lastTick;
                    numTicks = Math.floor(timeSinceTick / this.tickLength);
                }

                this.executeTicks(numTicks * speedUpFactor)
                this.lastTick = this.lastTick + (numTicks * this.tickLength)
                this.lastRender = tFrame;
            }
            this.lastTick = performance.now();
            this.lastRender = this.lastTick; 
            this.tickLength = gameParams.millisecondsPerFrame.normal; 
            main(performance.now()); // Start the cycle
        })();
    }

    regenerateShield() {
        const ticksToRegenerateShield = millisecondsToTick(gameParams.shieldRechargeMilliseconds)
        this.board.units
            .forEach(u => { 
                if ((u.lastDamageTick === 0 || u.lastDamageTick) &&
                    u.shield < u.unitType.shield &&
                    u.lastDamageTick < (this.tickCount - ticksToRegenerateShield)) 
                {
                    u.shield += Math.min(u.unitType.shield / ticksToRegenerateShield, u.unitType.shield - u.shield)
                }
            })
    }

    fetchNextAction(unit: Unit) {
        if (this.tickCount % millisecondsToTick(250) === 0) {
            // Find next action from the unit's AI
            const newAction = unit.ai.findNextAction(unit, this.board)

            switch (newAction.actionType) {
                case actionTypes.idle: 
                    unit.nextAction = newAction
                    unit.performAction = () => { return () => { unit.shootingLevel = 0} }
                    break;

                case actionTypes.move:
                    unit.nextAction = newAction
                    unit.performAction = this.moveUnit(unit)
                    break;
                case actionTypes.attack:
                    // If the unit is already attacking the unit then do not initiate a new attack
                    if (unit.currentAction.actionType === actionTypes.attack &&
                        newAction.target_unit === unit.currentAction.target_unit) {
                        return
                    }
                    unit.nextAction = newAction
                    unit.performAction = createFiringPattern(
                        unit,
                        newAction.target_unit,
                        this.board,
                        gameParams.millisecondsPerFrame.normal,
                        this.createBullet
                    )
                    break;
            }
        }
    }

    moveUnit(unit: Unit) {
        return () => {
            // Kill units when they thit the wall
            if (unit.x < 20 || unit.y < 20 || unit.x > this.board.width - 20 || unit.y > this.board.height - 20) {
                return () => this.board.killUnit(unit)
            }

            const { x: sourceX, y: sourceY, currentAction: { direction, target_unit } } = unit;

            // Do nothing if the target unit is dead
            if (!target_unit || (!target_unit.averageCoordinate && !this.board.unitIsAlive(target_unit))) 
                { return () => { } }

            const { x: targetX, y: targetY } = target_unit
            const diff = new Victor(targetX - sourceX, targetY - sourceY).normalize();
            const diffX = (diff.x * pixelsPerTick(unit.unitType.travelSpeed))
            const diffY = (diff.y * pixelsPerTick(unit.unitType.travelSpeed))

            return () => {
                if (direction === directions.towards) {
                    unit.x += diffX
                    unit.y += diffY
                } else if (direction === directions.away) {
                    unit.x -= diffX
                    unit.y -= diffY
                }
                // TODO: rotate the unit to face the target
                // unit.rotation = _.round(angle);
                unit.shootingLevel = 0
            }
        }
    }

    createBullet = (sourceUnit: Unit, targetUnit: Unit) => {
        this.board.bullets.push(new Bullet({ sourceUnit, targetUnit, tickCreated: this.tickCount }))
    }

    moveBullet(bullet: Bullet) {
        const { currentCoordinate: { x, y } } = bullet;
        bullet.currentCoordinate.x += bullet.velocity.x
        bullet.currentCoordinate.y += bullet.velocity.y

        // Bullet has left the board
        if (x < 0 || x > this.board.width || y < 0 || y > this.board.height) {
            this.board.removeBullet(bullet);
            return
        }
        if (bullet.willHit) {
            if (!this.board.unitIsAlive(bullet.targetUnit)) {
                bullet.willHit = false;
                return;
            }
            const sourcePosition = bullet.originalTargetCoordinate
            const ticksSinceShot = this.tickCount - bullet.tickCreated;
            const bulletVelocityInPixelsPerTick = metersPerSecondToPixelsPerTick(gameParams.bulletVelocity)
            const distanceTravelled = ticksSinceShot * bulletVelocityInPixelsPerTick
            const unitPosition = Victor.fromObject(bullet.targetUnit)
            const distanceToUnit = sourcePosition.distance(unitPosition)
            if (distanceTravelled >= distanceToUnit) {
                // bullet has just reached the unit
                if (distanceToUnit > metersToPixel(gameParams.largeCircleRadius)) {
                    bullet.willHit = false;
                } else {
                    this.bulletHasReachedTarget(bullet)
                }
            }
        }
    }

    // The bullet has reached its in-range target
    bulletHasReachedTarget(bullet: Bullet) {
        // When the target's hit counter >= 100 the bullet hits
        bullet.targetUnit.hitCounter += bullet.accuracy
        if (bullet.targetUnit.hitCounter >= 100) {
            bullet.targetUnit.hitCounter %= 100
            bullet.targetUnit.damage(bullet.sourceUnit.unitType.damagePerBullet)
            bullet.targetUnit.lastDamageTick = this.tickCount
            if (bullet.targetUnit.hp <= 0) {
                this.board.killUnit(bullet.targetUnit)
            }
            this.board.removeBullet(bullet);
        } else {
            // Bullet has missed. No more hit tests for this bullet.
            bullet.willHit = false;
        }
    }

}

export default Game
