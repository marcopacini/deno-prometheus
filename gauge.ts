import { Collector } from "./collector.ts";
import { Dec, Inc, Labels, Metric, Set, Value } from "./metric.ts";
import { Registry } from "./registry.ts";

export class Gauge extends Metric implements Inc, Dec, Value {
  private collector: Collector;
  private _value?: number;

  static with(
    config: {
      name: string;
      help: string;
      labels?: string[];
      registry?: Registry[];
    },
  ): Gauge {
    const collector = new Collector(
      config.name,
      config.help,
      "gauge",
      config.registry,
    );
    const labels = config.labels || [];
    return new Gauge(collector, labels);
  }

  private constructor(
    collector: Collector,
    labels: string[] = [],
  ) {
    super(labels, new Array(labels.length).fill(undefined));
    this.collector = collector;
    this._value = undefined;
    this.collector.getOrSetMetric(this);
  }

  get description(): string {
    let labels = this.getLabelsAsString();
    return `${this.collector.name}${labels}`;
  }

  expose(): string | undefined {
    if (this._value !== undefined) {
      return `${this.description} ${this._value}`;
    }
    return undefined;
  }

  labels(labels: Labels): Inc & Dec & Set & Value {
    let child = new Gauge(this.collector, this.labelNames);
    for (let key of Object.keys(labels)) {
      const index = child.labelNames.indexOf(key);
      if (index === -1) {
        throw new Error(`label with name ${key} not defined`);
      }
      child.labelValues[index] = labels[key];
    }
    child = child.collector.getOrSetMetric(child) as Gauge;

    return {
      inc: (n: number = 1) => {
        child.inc(n);
      },
      dec: (n: number = 1) => {
        child.dec(n);
      },
      set: (n: number) => {
        child.set(n);
      },
      value: () => {
        return child._value;
      },
    };
  }

  inc(n: number = 1) {
    if (this._value === undefined) {
      this._value = 0;
    }
    this._value += n;
  }

  dec(n: number = 1) {
    if (this._value === undefined) {
      this._value = 0;
    }
    this._value -= n;
  }

  set(n: number) {
    this._value = n;
  }

  value(): number | undefined {
    return this._value;
  }
}
