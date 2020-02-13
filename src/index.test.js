import transformator, {
  camelizeKey,
  camelizeKeys,
  underscoredKey,
  underscoredKeys,
  compose
} from "./index";

describe("ObjectTransformator", () => {
  const toStringKey = (target, key, value) => ({
    ...target,
    [key]: typeof value === "number" ? value + "" : value
  });

  describe("transformator", () => {
    const toStringKeys = (data, { shallow = false, omit = [] } = {}) =>
      transformator(data, {
        shallow,
        func: toStringKeys,
        action: toStringKey,
        omit
      });

    const toStringPayload = { a: 1, b: "2", c: [{ d: 4, e: "5" }] };

    it("returns empty for no args", () => {
      expect(transformator(toStringPayload)).toEqual({});
    });

    it("should transform a flat object", () => {
      expect(toStringKeys(toStringPayload, { shallow: true })).toEqual({
        a: "1",
        b: "2",
        c: [{ d: 4, e: "5" }]
      });
    });

    it("should transform an object", () => {
      expect(toStringKeys(toStringPayload)).toEqual({
        a: "1",
        b: "2",
        c: [{ d: "4", e: "5" }]
      });
    });

    it("should omit a field with shallow", () => {
      expect(
        toStringKeys(toStringPayload, { shallow: true, omit: ["c"] })
      ).toEqual({
        a: "1",
        b: "2",
        c: [{ d: 4, e: "5" }]
      });
    });

    it("should omit a field", () => {
      expect(
        toStringKeys(toStringPayload, { shallow: false, omit: ["c"] })
      ).toEqual({
        a: "1",
        b: "2",
        c: [{ d: "4", e: "5" }]
      });
    });
  });

  describe("composition", () => {
    describe("underscored", () => {
      const cutoffMyAfoo = target => {
        if ("my_afoo" in target) {
          const { my_afoo, ...rest } = target;
          return rest;
        }
        return target;
      };

      const underscoredTransformator = (
        data,
        { shallow = false, omit = [] } = {}
      ) =>
        transformator(data, {
          shallow,
          func: underscoredTransformator,
          action: compose(
            underscoredKey,
            cutoffMyAfoo
          ),
          omit
        });

      const transformatorPayload = {
        my0Foo: 0,
        myAfoo: 1,
        b: "2",
        myCfoo: [{ d: 4, meEfoo: "5" }]
      };

      it("should transform a flat object", () => {
        expect(
          underscoredTransformator(transformatorPayload, { shallow: true })
        ).toEqual({
          my_0_foo: 0,
          b: "2",
          my_cfoo: [{ d: 4, meEfoo: "5" }]
        });
      });

      it("should transform an object", () => {
        expect(underscoredTransformator(transformatorPayload)).toEqual({
          my_0_foo: 0,
          b: "2",
          my_cfoo: [{ d: 4, me_efoo: "5" }]
        });
      });
      it("should omit a field with shallow", () => {
        expect(
          underscoredTransformator(transformatorPayload, {
            shallow: true,
            omit: ["myCfoo"]
          })
        ).toEqual({
          my_0_foo: 0,
          b: "2",
          myCfoo: [{ d: 4, meEfoo: "5" }]
        });
      });

      it("should omit a field", () => {
        expect(
          underscoredTransformator(transformatorPayload, {
            shallow: false,
            omit: ["myCfoo"]
          })
        ).toEqual({
          my_0_foo: 0,
          b: "2",
          myCfoo: [{ d: 4, me_efoo: "5" }]
        });
      });
    });

    describe("camelize", () => {
      const cutoffMyAfoo = target => {
        if ("myAfoo" in target) {
          const { myAfoo, ...rest } = target;
          return rest;
        }
        return target;
      };

      const camelizeTransformator = (
        data,
        { shallow = false, omit = [] } = {}
      ) =>
        transformator(data, {
          shallow,
          func: camelizeTransformator,
          action: compose(
            camelizeKey,
            cutoffMyAfoo
          ),
          omit
        });

      const transformatorPayload = {
        my_0_foo: 0,
        my_afoo: 1,
        b: "2",
        my_cfoo: [{ d: 4, me_efoo: "5" }]
      };

      it("should transform a flat object", () => {
        expect(
          camelizeTransformator(transformatorPayload, { shallow: true })
        ).toEqual({
          my0Foo: 0,
          b: "2",
          myCfoo: [{ d: 4, me_efoo: "5" }]
        });
      });

      it("should transform an object", () => {
        expect(camelizeTransformator(transformatorPayload)).toEqual({
          my0Foo: 0,
          b: "2",
          myCfoo: [{ d: 4, meEfoo: "5" }]
        });
      });
      it("should omit a field with shallow", () => {
        expect(
          camelizeTransformator(transformatorPayload, {
            shallow: true,
            omit: ["my_cfoo"]
          })
        ).toEqual({
          my0Foo: 0,
          b: "2",
          my_cfoo: [{ d: 4, me_efoo: "5" }]
        });
      });

      it("should omit a field", () => {
        expect(
          camelizeTransformator(transformatorPayload, {
            shallow: false,
            omit: ["my_cfoo"]
          })
        ).toEqual({
          my0Foo: 0,
          b: "2",
          my_cfoo: [{ d: 4, meEfoo: "5" }]
        });
      });
    });
  });

  describe("camelizeKeys", () => {
    it("should yield the same value", () => {
      expect(camelizeKeys(null)).toEqual(null);
      expect(camelizeKeys(1)).toEqual(1);
      expect(camelizeKeys("foo")).toEqual("foo");
      expect(camelizeKeys()).toEqual(undefined);
      const foo = () => {};
      expect(foo).toEqual(foo);
    });

    it("should shallow tranform a flat object", () => {
      const obj = camelizeKeys(
        {
          john_nick: true,
          trelo_hi: {
            hello_man: [],
            popoverNow: {}
          },
          iAmFine: false
        },
        { shallow: true }
      );
      expect(obj).toEqual({
        johnNick: true,
        treloHi: {
          hello_man: [],
          popoverNow: {}
        },
        iAmFine: false
      });
    });

    it("should shallow tranform an array", () => {
      const obj = camelizeKeys(
        [
          3,
          "foo",
          {
            bar_foo: true,
            popoverNow: {
              hello_man: 1
            }
          }
        ],
        { shallow: true }
      );
      expect(obj).toEqual([
        3,
        "foo",
        {
          barFoo: true,
          popoverNow: {
            hello_man: 1
          }
        }
      ]);
    });

    it("should deep tranform an object", () => {
      const obj = camelizeKeys({
        john_nick: true,
        trelo_hi: {
          hello_man: [
            {
              bar_foo: false
            }
          ],
          popoverNow: {}
        },
        iAmFine: false
      });
      expect(obj).toEqual({
        johnNick: true,
        treloHi: {
          helloMan: [
            {
              barFoo: false
            }
          ],
          popoverNow: {}
        },
        iAmFine: false
      });
    });

    it("should deep tranform an array", () => {
      const obj = camelizeKeys([
        3,
        "foo",
        {
          bar_foo: true,
          popoverNow: {
            hello_man: [
              [[{ my_bar: 1 }, { your_bar: { bar_your: "bar_your" } }]],
              { lara_vel: ["laraVel"] }
            ]
          }
        }
      ]);
      expect(obj).toEqual([
        3,
        "foo",
        {
          barFoo: true,
          popoverNow: {
            helloMan: [
              [[{ myBar: 1 }, { yourBar: { barYour: "bar_your" } }]],
              { laraVel: ["laraVel"] }
            ]
          }
        }
      ]);
    });
  });

  describe("underscoredKeys", () => {
    it("should yield the same value", () => {
      expect(underscoredKeys(null)).toEqual(null);
      expect(underscoredKeys(1)).toEqual(1);
      expect(underscoredKeys("foo")).toEqual("foo");
      expect(underscoredKeys()).toEqual(undefined);
      const foo = () => {};
      expect(foo).toEqual(foo);
    });

    it("should shallow tranform a flat object", () => {
      const obj = underscoredKeys(
        {
          johnNick: true,
          treloHi: {
            hello_man: [],
            popoverNow: {}
          },
          i_am_fine: false
        },
        { shallow: true }
      );
      expect(obj).toEqual({
        john_nick: true,
        trelo_hi: {
          hello_man: [],
          popoverNow: {}
        },
        i_am_fine: false
      });
    });

    it("should shallow tranform an array", () => {
      const obj = underscoredKeys(
        [
          3,
          "foo",
          {
            barFoo: true,
            popoverNow: {
              helloMan: 1
            }
          }
        ],
        { shallow: true }
      );
      expect(obj).toEqual([
        3,
        "foo",
        {
          bar_foo: true,
          popover_now: {
            helloMan: 1
          }
        }
      ]);
    });

    it("should deep tranform an object", () => {
      const obj = underscoredKeys({
        johnNick: true,
        treloHi: {
          helloMan: [
            {
              barFoo: false
            }
          ],
          popoverNow: {}
        },
        i_am_fine: false
      });
      expect(obj).toEqual({
        john_nick: true,
        trelo_hi: {
          hello_man: [
            {
              bar_foo: false
            }
          ],
          popover_now: {}
        },
        i_am_fine: false
      });
    });

    it("should deep tranform an array", () => {
      const obj = underscoredKeys([
        3,
        "foo",
        {
          barFoo: true,
          popoverNow: {
            helloMan: [
              [[{ myBar: 1 }, { yourBar: { barYour: "barYour" } }]],
              { laraVel: ["laraVel"] }
            ]
          }
        }
      ]);
      expect(obj).toEqual([
        3,
        "foo",
        {
          bar_foo: true,
          popover_now: {
            hello_man: [
              [[{ my_bar: 1 }, { your_bar: { bar_your: "barYour" } }]],
              { lara_vel: ["laraVel"] }
            ]
          }
        }
      ]);
    });
  });
});
