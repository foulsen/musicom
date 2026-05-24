import { Interval } from "../intervals/interval";
import { Degree } from "./degree";

export class ScalePattern {
  constructor(
    public readonly name: string,
    public readonly intervals: Interval[],
    public readonly degrees: Degree[],
  ) {}
}
