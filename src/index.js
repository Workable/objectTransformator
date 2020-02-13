import camelCase from "lodash/camelCase";
import snakeCase from "lodash/snakeCase";
import identity from "lodash/identity";

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

export const underscoredKeys = (data, { shallow = false, omit = [] } = {}) =>
  transformator(data, {
    shallow,
    func: underscoredKeys,
    action: underscoredKey,
    omit
  });

export const compose = (...transformators) => {
  return (target, key, value, data) =>
    transformators.reduce((all, func) => func(all, key, value, data), target);
};

export { camelCase, snakeCase };
export default transformator;
