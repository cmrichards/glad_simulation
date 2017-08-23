// @flow 

export default class Victor {

    x: number
    y: number

    static s = 1;

    static fromObject(obj) {
        return new Victor(obj.x || 0, obj.y || 0);
    }

    rotate(angle) {
        var nx = (this.x * Math.cos(angle)) - (this.y * Math.sin(angle));
        var ny = (this.x * Math.sin(angle)) + (this.y * Math.cos(angle));
        this.x = nx;
        this.y = ny;
        return this;
    }

    verticalAngle() {
        return Math.atan2(this.x, this.y);
    }

    normalize() {
        var length = this.length();

        if (length === 0) {
            this.x = 1;
            this.y = 0;
        } else {
            this.divide(new Victor(length, length));
        }
        return this;
    };

    length() {
        return Math.sqrt(this.lengthSq());
    }

    lengthSq() {
        return this.x * this.x + this.y * this.y;
    }

    divide(vector) {
        this.x /= vector.x;
        this.y /= vector.y;
        return this;
    }

    distance(vec) {
        return Math.sqrt(this.distanceSq(vec));
    }

    distanceSq(vec) {
        var dx = this.distanceX(vec),
            dy = this.distanceY(vec);

        return dx * dx + dy * dy;
    }

    distanceX(vec) {
        return this.x - vec.x;
    }

    distanceY(vec) {
        return this.y - vec.y;
    }

    constructor(x: number ,y: number) {
        this.x = x || 0
        this.y = y || 0
    }
}
