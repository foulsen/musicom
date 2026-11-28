import { describe, expect, it } from "vitest";

import { customSetForWeakItem } from "./custom-set";

const VALID = ["1", "2", "3", "4", "5", "6", "7", "12"];
const POOL = ["4", "5", "7", "12"];

describe("customSetForWeakItem", () => {
  it("puts the item and its confusion first and tops up from the pool to the minimum", () => {
    expect(customSetForWeakItem({ itemId: "3", confusionId: "4", poolIds: POOL, validIds: VALID })).toEqual([
      "3",
      "4",
      "5",
      "7",
    ]);
  });

  it("includes the other weak items before topping up", () => {
    expect(
      customSetForWeakItem({ itemId: "3", confusionId: "4", otherWeakIds: ["9", "2"], poolIds: POOL, validIds: [...VALID, "9"] }),
    ).toEqual(["3", "4", "9", "2"]);
  });

  it("does not trim priority items beyond the minimum, but adds no pool filler then", () => {
    expect(
      customSetForWeakItem({ itemId: "1", confusionId: "2", otherWeakIds: ["3", "4", "5"], poolIds: POOL, validIds: VALID }),
    ).toEqual(["1", "2", "3", "4", "5"]);
  });

  it("deduplicates and drops ids that do not exist for the kind", () => {
    expect(
      customSetForWeakItem({ itemId: "3", confusionId: "99", otherWeakIds: ["3"], poolIds: ["4", "4", "5", "7"], validIds: VALID }),
    ).toEqual(["3", "4", "5", "7"]);
  });

  it("works without a confusion", () => {
    expect(customSetForWeakItem({ itemId: "7", poolIds: POOL, validIds: VALID })).toEqual(["7", "4", "5", "12"]);
  });
});
