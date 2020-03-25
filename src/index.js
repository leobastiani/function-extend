const prependFunction = function (f1, f2) {
  return function (...args) {
    const ret = f2.call(this, ...args)
    if (typeof ret === 'object' && 'then' in ret) {
      return ret.then(() => f1.call(this, ...args))
    }
    return f1.call(this, ...args)
  }
}

const appendFunction = function (f1, f2) {
  return function (...args) {
    const ret = f1.call(this, ...args)
    if (typeof ret === 'object' && 'then' in ret) {
      return ret.then(() => f2.call(this, ...args)).then(() => ret)
    }
    f2.call(this, ...args)
    return ret
  }
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
  wrapToFunction
}
