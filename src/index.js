import camelCase from "lodash/camelCase";
import snakeCase from "lodash/snakeCase";
import identity from "lodash/identity";

/**
 * @description The pure transformator function.
 * @param options.func The function that applies nested objects.
 * @param options.action The function that applies on the attribute transformation.
 * @param options.shallow if true, it transforms only the first level of the object.
 * @param options.omit Excludes specific keys from the transformation.
 * @example
 * underscoredKeys({ attr_v1: "val1", attrs: { attr_v2: "val2" } });
 *
 * // { attrV1: "val1", attrs: { attrV2: "val2" } }
 */

const transformator = (
  data,
  { func = identity, action = identity, shallow = false, omit = [] } = {}
) => {
  if (Array.isArray(data)) {
    return data.map(v => func(v, { shallow }));
  }

  if (typeof data === "object" && data) {
    return Object.keys(data).reduce((d, key) => {
      const value = shallow ? data[key] : func(data[key]);
      if (omit.includes(key)) {
        return { ...d, [key]: value };
      }

      return action(d, key, value, data);
    }, {});
  }

  return data;
};

export const camelizeKey = (target, key, value) => ({
  ...target,
  [camelCase(key)]: value
});

/**
 * @description Transforms all the object keys to camelCase.
 * @example
 * underscoredKeys({ attr_v1: "val1", attrs: { attr_v2: "val2" } });
 *
 * // { attrV1: "val1", attrs: { attrV2: "val2" } }
 */

export const camelizeKeys = (data, { shallow = false, omit = [] } = {}) =>
  transformator(data, {
    shallow,
    func: camelizeKeys,
    action: camelizeKey,
    omit
  });

export const underscoredKey = (target, key, value) => ({
  ...target,
  [snakeCase(key)]: value
});

/**
 * @description Transforms all the object keys to underscored case.
 * @example
 * underscoredKeys(
 *   { attrV1: "val1", attrs: { attrV2: "val2" } },
 *   { shallow: true }
 * );
 *
 * // {attr_v1: 'val1', attrs: {attrV2: 'val2'}}
 */

export const underscoredKeys = (data, { shallow = false, omit = [] } = {}) =>
  transformator(data, {
    shallow,
    func: underscoredKeys,
    action: underscoredKey,
    omit
  });

/**
 * @description Creates a chain of transformators.
 * @example
 * const prefixAction =  (target, key, value) => ({ ...target, ['v1_' + key]: value })
 *
 * const payloadTransformator = data =>
 *   transformKeys(data, {
 *     func: payloadTransformator,
 *     action: compose(
 *       camelizeKey,
 *       prefixAction
 *     )
 *   });
 */

export const compose = (...transformators) => {
  return (target, key, value, data) =>
    transformators.reduce((all, func) => func(all, key, value, data), target);
};

export { camelCase, snakeCase };
export default transformator;
