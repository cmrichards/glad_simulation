// @flow
import { observable } from 'mobx'

export default class FrameRateRecorder {

    @observable fps=0

    constructor() {
        this.filterStrength = 30;
        this.lastLoop = new Date();
        this.thisLoop = new Date();
    }

    start(factor: number = 1):void {
        this.speedUpFactor = factor
        this.startTime = new Date().getTime()
        this.frameTime = 0
        this.lastLoop = new Date() 
    }

    recordFrame() { 
        var thisFrameTime = (this.thisLoop=new Date()) - this.lastLoop;
        this.frameTime += (thisFrameTime - this.frameTime) / this.filterStrength;
        this.lastLoop = this.thisLoop;
        this.fps = Math.round(1000/this.frameTime)
    }

}