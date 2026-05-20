import { Interval } from "../intervals/interval";

export class ScalePattern {
  constructor(
    public readonly name: string,
    public readonly intervals: Interval[],
  ) {}
}
