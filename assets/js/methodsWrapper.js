/**
 * @author https://stackoverflow.com/users/7844487/dmitry-kovganov
 * @see https://stackoverflow.com/questions/50767241/observe-localstorage-changes-in-js#answer-69824016
 * @param {Object} object
 * @param {Array<string>} methods
 * @param {Function} callbackBefore
 * @param {Function} callbackAfter
 */

function methodsWrapper(
  object = {},
  methods = [],
  callbackBefore = function () {},
  callbackAfter = function () {},
) {
  for (const method of methods) {
    /** @var {Function} original */
    const original = object[method].bind(object);
    /** @var {newMethod} original */
    const newMethod = function (...args) {
      callbackBefore(method, ...args);
      const result = original.apply(null, args);
      callbackAfter(method, ...args);

      return result;
    };
    object[method] = newMethod.bind(object);
  }
}
