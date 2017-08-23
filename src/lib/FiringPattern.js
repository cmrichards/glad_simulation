// @flow
import _ from "lodash"
import Unit from "./Unit"
import Board from "./Board"

export const createFiringPattern = function createFiringPattern(unit: Unit, targetUnit: Unit, board: Board, millisecondsPerTick: number,
    takeShot: (Unit, Unit) => void) {

    let currentTick: number = -1 
    const unitType = unit.unitType;

    // Total time taken to shoot all bullets in a single targetting cycle
    const totalTime: number = unitType.targettingTime + ((unitType.bursts - 1) * unitType.reload)

    // Convert the times given in the unit definitions to numbers of ticks
    // TODO: Ensure that all times given in unit definitions are divisble by the millisecond per tick
    const reloadTimeTicks: number = unitType.reload / millisecondsPerTick
    const totalTicks: number = totalTime / millisecondsPerTick
    const targettingTicks: number = (unitType.targettingTime / millisecondsPerTick)

    return () => {
        // Do nothing if the target is dead
        if (!targetUnit || !board.unitIsAlive(targetUnit)) {
            return () => { unit.shootingLevel = 0 }
        }

        currentTick += 1
        if (currentTick > totalTicks) { currentTick %= totalTicks }

        return () => {
            if (currentTick < targettingTicks) {
                // Unit is targetting. Increase shooting circle
                unit.shootingLevel = _.round(currentTick / targettingTicks * 100)
            } else {
                // Unit has finished reloading and is ready to fire or reload for next burst
                if (
                    ((currentTick - targettingTicks) === 0) || // first shot after targetting
                    (currentTick - targettingTicks) % reloadTimeTicks === 0             // shots after reloading
                ) {
                    // Create each bullet in the burst
                    for (var index = 0; index < unitType.bulletsPerBurst; index++) {
                        takeShot(unit, targetUnit)
                    }
                }
                // Decrease the shooting circle back to 0 
                unit.shootingLevel = 100 - (((currentTick - targettingTicks) / (totalTicks - targettingTicks)) * 100)
            }
        }
    }
}
