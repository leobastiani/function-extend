class Stop {
  constructor (value) {
    this.value = value
  }
}

const isStop = ret => ret === Stop || ret instanceof Stop
const isObject = ret =>
  (ret !== null && typeof ret === 'object') || ret instanceof String
const hasThen = ret => isObject(ret) && 'then' in ret
const copyKeys = (src, dest) =>
  Object.setPrototypeOf(Object.assign(dest, src), Object.getPrototypeOf(src))

const prependFunction = function (f1, f2) {
  return copyKeys(f1, function (...args) {
    const ret = f2.call(this, ...args)
    if (isStop(ret)) {
      return ret.value
    }
    if (hasThen(ret)) {
      return ret.then(() => f1.call(this, ...args))
    }
    return f1.call(this, ...args)
  })
}

const appendFunction = function (f1, f2) {
  return copyKeys(f1, function (...args) {
    const ret = f1.call(this, ...args)
    if (isStop(ret)) {
      return ret.value
    }
    if (hasThen(ret)) {
      return ret.then(() => f2.call(this, ...args)).then(() => ret)
    }
    f2.call(this, ...args)
    return ret
  })
}

const wrapFunction = function (f, fUp, fDown) {
  return appendFunction(prependFunction(f, fUp), fDown)
}

const appendToFunction = (object, property, fn) => {
  object[property] = appendFunction(object[property], fn)
}

const prependToFunction = (object, property, fn) => {
  object[property] = prependFunction(object[property], fn)
}

const wrapToFunction = (object, property, fUp, fDown) => {
  object[property] = wrapFunction(object[property], fUp, fDown)
}

module.exports = {
  prependFunction,
  appendFunction,
  wrapFunction,
  appendToFunction,
  prependToFunction,
  wrapToFunction,
  Stop
}
