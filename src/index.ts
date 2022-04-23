type Selector<T = any, R = T> = (v: T) => R;
type Picker<T = any> = (v: T) => boolean;
type Sorter<T = any> = (v1: T, v2: T) => number;
type Grouper<T = any> = (value: T) => string;

const groupBy = <T>(list: T[], groupers: Grouper<T>[]): any => {
  if (!groupers.length) return list;

  const copied = [...groupers];
  const keyPicker = copied.shift();
  const keysTypes: Record<string, string> = {};

  return Object.entries(
    list.reduce<Record<string, any>>((grouped, item) => {
      const key = keyPicker!(item);

      keysTypes[key] = typeof key;

      if (grouped[key]) {
        grouped[key].push(item);
      } else {
        grouped[key] = [item];
      }

      return grouped;
    }, {})
  ).map(([groupName, values]) => {
    const key =
      keysTypes[groupName] === 'number' ? Number(groupName) : groupName;

    return [key, groupBy(values, copied)];
  });
};

const join = <T = any, K = any>(v1: T[], v2: K[]) => {
  const result = [];

  for (const a of v1) {
    for (const b of v2) {
      result.push([a, b]);
    }
  }

  return result;
};

class Sql {
  private data: any[] = [];
  private selector: Selector | null = null;
  private orderer: Sorter | null = null;
  private haver: Picker[] = [];
  private joiners1: Picker[] = [];
  private joiners2: Picker[] = [];
  private groupByFuncs: Grouper[] = [];

  constructor() {
    this.select = this.select.bind(this);
    this.from = this.from.bind(this);
    this.where = this.where.bind(this);
    this.orderBy = this.orderBy.bind(this);
    this.groupBy = this.groupBy.bind(this);
    this.having = this.having.bind(this);
    this.execute = this.execute.bind(this);
  }

  select(selector?: Selector) {
    if (selector) {
      this.selector = selector;
    }
    return this;
  }

  from(...data: any[]) {
    this.data = data.reduce(join);
    return this;
  }

  where(...where: Picker[]) {
    if (!this.joiners1.length) {
      this.joiners1 = where;
    } else if (!this.joiners2.length) {
      this.joiners2 = where;
    } else {
      this.joiners2 = [...this.joiners2, ...where];
    }
    return this;
  }

  orderBy(cb?: Sorter) {
    if (cb) {
      this.orderer = cb;
    }

    return this;
  }

  groupBy(...args: Grouper[]) {
    this.groupByFuncs = args;

    return this;
  }

  having(cb?: Picker) {
    if (cb) {
      this.haver.push(cb);
    }
    return this;
  }

  execute() {
    let mappedData = [...this.data];

    if (this.joiners1.length) {
      mappedData = mappedData.filter((v) => this.joiners1.some((cb) => cb(v)));
    }

    if (this.joiners2 && this.joiners2.length) {
      mappedData = mappedData.filter((row) => {
        return this.joiners2.every((fn) => fn(row));
      });
    }

    if (this.groupByFuncs.length) {
      mappedData = groupBy(mappedData, [...this.groupByFuncs]);
    }

    if (this.haver.length) {
      mappedData = mappedData.filter((v) => {
        return this.haver.every((fn) => fn(v));
      });
    }

    if (this.selector) {
      mappedData = mappedData.map(this.selector);
    }

    if (this.orderer) {
      mappedData = mappedData.sort(this.orderer);
    }

    return mappedData;
  }
}

export function query() {
  return new Sql();
}
