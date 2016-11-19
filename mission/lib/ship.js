class Ship {
    constuctor() {
        var this.navigation = new Navigation(100, completeMission);
        var this.lifeSupport = new LifeSupport();
    }

    completeMission() {
        // WIN
    }
}

class System {
    constructor(powerType) {
        var this.active = true;
        var this.powerType = powerType;
        var this.power = new PowerCore(powerType);
    }

    fail() {
        this.active = false;
    }

    repair() {
        this.active = true;
    }

    swapPowerCore() {
        var this.power = new PowerCore(powerType);
    }
}

class Navigation extends System {
    constructor(distance, callback) {
        super(PowerType.NAV);
        var this.calibrated = true;
        var this.speed = 2;
        var this.efficiency = 0.5;
        var this.targetDistance = distance;
        var this.winCallback = callback;
    }

    misalign() {
        this.calibrated = false;
    }

    calibrate() {
        if (this.power.energy < 3) {
            return false;
        }
        this.calibrated = true;
        this.power.energy -= 3;
        return true;
    }

    travel() {
        var energyCost = (1-efficiency) * speed;
        if (this.power.energy < energyCost) {
            return false;
        }
        this.power.energy -= energyCost;
        this.targetDistance -= calibrated ? speed : speed * 0.5;
        if (targetDistance <= 0) {
            this.winCallback();
        }
        return true;
    }
}

class LifeSupport extends System {
    constructor(PowerType.LIFE) {
        super();
        var this.water = 5;
        var this.soylent = 5;
        var this.waste = 0;
        var this.fertilizer = 0;
    }

    grow() {
        if (this.power.energy <= 0 || this.fertilizer <= 0) {
            return false;
        }
        this.power.energy -= 1;
        this.fertilizer -= 1;
        this.soylent += 1;
        return true;
    }

    filter() {
        if (this.power.energy <= 0 || this.waste <= 0) {
            return false;
        }
        this.waste -= 1;
        this.fertilizer += 1;
        this.power.energy -= 1;
        return true;
    }

    distill() {
        if (this.power.energy < 4 || this.waste < 4) {
            return false;
        }
        this.waste -= 4;
        this.water += 4;
        this.power.energy -= 4;
        return true;
    }
}

class PowerCore {
    constructor(powerType) {
        var this.volatilityFactor = 0.1;
        var this.energy = 10;
        var this.type = powerType;
    }

    getVolatility() {
        return this.volatilityFactor * (100-this.energy);
    }
}

var PowerType = {
    NAV: 'Nav',
    LIFE: 'Life',
}
