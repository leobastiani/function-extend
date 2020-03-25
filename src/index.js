const prependFunction = function (f1, f2) {
  return function (...args) {
    f2.call(this, ...args)
    return f1.call(this, ...args)
  }
}

const appendFunction = function (f1, f2) {
  return function (...args) {
    const ret = f1.call(this, ...args)
    f2.call(this, ...args)
    return ret
  }
}

const prependFunctionAsync = function (f1, f2) {
  return async function (...args) {
    await f2.call(this, ...args)
    return f1.call(this, ...args)
  }
}

const appendFunctionAsync = function (f1, f2) {
  return async function (...args) {
    const ret = await f1.call(this, ...args)
    await f2.call(this, ...args)
    return ret
  }
}

const appendToFunction = (object, property, fn) => {
  object[property] = appendFunction(object[property], fn)
}

const prependToFunction = (object, property, fn) => {
  object[property] = prependFunction(object[property], fn)
}

const appendToAsyncFunction = (object, property, fn) => {
  object[property] = appendFunctionAsync(object[property], fn)
}

const prependToAsyncFunction = (object, property, fn) => {
  object[property] = prependFunctionAsync(object[property], fn)
}

module.exports = {
  prependFunction,
  appendFunction,
  prependFunctionAsync,
  appendFunctionAsync,
  appendToFunction,
  prependToFunction,
  appendToAsyncFunction,
  prependToAsyncFunction
}
