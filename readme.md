# objectTransformator

Transforms a javascript object from one shape to another.
`objectTransformator` comes with some preset transformations.

## Installing

Using npm:

\$ npm install @workablehr/objectTransformator

## Basic usage

```javascript
import { underscoredKeys } from "@workablehr/objectTransformator";

underscoredKeys({ attrV1: "val1", attrs: { attrV2: "val2" } });
// {attr_v1: 'val1', attrs: {attr_v2: 'val2'}}
```

## Presets

### camelizeKeys

Transforms all the object keys to camel case.

- shallow, if true, it transforms only the first level of the object.
- omit, excludes specific keys from the transformation.

```javascript
import { camelizeKeys } from "@workablehr/objectTransformator";

camelizeKeys({ attr_v1: "val1", attrs: { attr_v2: "val2" } });
// { attrV1: "val1", attrs: { attrV2: "val2" } }
```

### underscoredKeys

Transforms all the object keys to underscored case.

- shallow, if true, it transforms only the first level of the object.
- omit, excludes specific keys from the transformation.

```javascript
import { underscoredKeys } from "@workablehr/objectTransformator";

underscoredKeys(
  { attrV1: "val1", attrs: { attrV2: "val2" } },
  { shallow: true }
);
// {attr_v1: 'val1', attrs: {attrV2: 'val2'}}
```

## transformator

The pure transformator function.

```javascript
import transformKeys from "@workablehr/objectTransformator";

const prefixKeys = (data, prefix, { shallow = false, omit = [] } = {}) =>
  transformKeys(data, {
    shallow,
    func: prefixKeys,
    action: (target, key, value) => ({ ...target, [prefix + key]: value }),
    omit
  });

prefixKeys({ attr1: "val1", attrs: { attr2: "val2" } }, "v1_");
// {{ v1_attr1: "val1", v1_attrs: { v1_attr2: "val2" } }}
```

### compose

Creates a chain of transformators.

```javascript
import transformKeys, {compose} from "@workablehr/objectTransformator";

const prefixAction =  (target, key, value) => ({ ...target, ['v1_' + key]: value })
const payloadTransformator = data =>
  transformKeys(data, {
    func: payloadTransformator,
    action: compose(
      camelizeKey,
      prefixAction
    )
  });

payloadTransformator({...});
```
