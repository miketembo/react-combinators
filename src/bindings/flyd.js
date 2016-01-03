import flyd from "flyd"
import filter from 'flyd/module/filter'
import switchLatest from 'flyd/module/switchlatest'

export default {

  isObservable(obs) {
    return obs && obs instanceof Function && obs.end instanceof Function // duck typing, very impl. dependent
  },

  constant(val) {
    return flyd.stream(val)
  },

  combineAsArray(arr) {
    return flyd.combine(function(/*args*/) {
      return Array.prototype.slice.call(arguments)
    }, arr)
  },

  map(obs, fn) {
    return flyd.map(fn, obs)
  },

  flatMapLatest(obs, fn) {
    return flyd.map(fn, switchLatest(obs))
  },

  take(obs, num) {
    let counter = num
    const resultObs = flyd.combine(val => {
      if(counter >= 0) {
        counter--
        return val
      }
    }, [obs])
    return resultObs
  },

  createEventBus() {
    // this abstraction layer function named eventBus but since pushToEventBus (the only user) only pushes values into
    // it, it might as well be just a stream
    return flyd.stream()
  },

  pushToEventBus(bus, value) {
    bus(value)
  },

  startWith(obs, val) {
    // maybe it's unnecessary to even create a stream; just return obs(val)?
    const result = flyd.combine(val => val, [obs])
    return result(val)
  },

  skipDuplicates(obs) {
    // would be nicer with compose but is it worth it for a single use?
    return flyd.map(({value, duplicate}) => value,
      filter(({value, duplicate}) => !duplicate,
        flyd.scan((prev, next) => ({value: next, duplicate: prev === next}), obs)))
  },

  subscribe(obs, onValue) {
    flyd.combine(onValue, [obs])
  },

  toProperty(obs) {
    // no difference between property and event stream in flyd
    // maybe it's unnecessary to even create a stream; just return obs?
    return flyd.combine(val => val, [obs])
  }

}
