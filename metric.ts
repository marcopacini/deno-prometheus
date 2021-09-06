export type Labels = { [key: string]: string };
export abstract class Metric {
  protected labelNames: string[];
  protected labelValues: string[];

  constructor(
    labelNames: string[] = [],
    labelValues: string[] = [],
  ) {
    if (labelNames.length !== labelValues.length) {
      throw new Error("invalid number of arguments");
    }
    for (let label of labelNames) {
      if (!isValidLabelName(label)) {
        throw new Error(`invalid label name: ${label}`);
      }
    }
    this.labelNames = labelNames;
    this.labelValues = labelValues;
  }

  getLabelsAsString(labels: Labels = {}): string {
    let labelsAsString = "";
    for (let i = 0; i < this.labelNames.length; i++) {
      if (this.labelValues[i]) {
        labelsAsString += `${this.labelNames[i]}="${this.labelValues[i]}",`;
      }
    }
    for (let labelName of Object.keys(labels)) {
      labelsAsString += `${labelName}="${labels[labelName]}",`;
    }
    if (labelsAsString !== "") {
      labelsAsString = `{${labelsAsString.slice(0, -1)}}`;
    }
    return labelsAsString;
  }

  abstract get description(): string;
  abstract expose(): string | undefined;
}

export function isValidLabelName(label: string) {
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(label);
}
export interface Inc {
  inc(): void;
  inc(n: number): void;
}

export interface Dec {
  dec(): void;
  dec(n: number): void;
}

export interface Set {
  set(n: number): void;
}

export interface Observe {
  observe(n: number): void;
}

export interface Value {
  value(): number | undefined;
}
