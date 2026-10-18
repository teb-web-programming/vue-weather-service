import {setWorldConstructor} from '@cucumber/cucumber'

class WeatherComparisonWorld {
    constructor() {
        this.context = undefined
        this.page = undefined
    }
}

setWorldConstructor(WeatherComparisonWorld)
