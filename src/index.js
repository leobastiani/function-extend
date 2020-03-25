const prependFunction = function (f1, f2) {
  return function (...args) {
    const ret = f2.call(this, ...args)
    if (ret instanceof Promise) {
      return ret.then(() => f1.call(this, ...args))
    }
    return f1.call(this, ...args)
  }
}

const appendFunction = function (f1, f2) {
  return function (...args) {
    const ret = f1.call(this, ...args)
    if (ret instanceof Promise) {
      return ret.then(() => f2.call(this, ...args)).then(() => ret)
    }
    f2.call(this, ...args)
    return ret
  }
}

const appendToFunction = (object, property, fn) => {
  object[property] = appendFunction(object[property], fn)
}

const prependToFunction = (object, property, fn) => {
  object[property] = prependFunction(object[property], fn)
}

module.exports = {
  prependFunction,
  appendFunction,
  appendToFunction,
  prependToFunction
}
