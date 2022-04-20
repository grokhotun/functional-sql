type Callback<T = any> = (value: T) => any;
type Sorter = <T = any>(value1: T, value2: T) => number;
type Grouper<T = any> = (value: T) => string;

const groupBy = <T>(list: T[], groupers: Grouper<T>[]): any => {
  if (!groupers.length) return list;

  const keyGetter = groupers.shift();
  const keys = {};

  const result = list.reduce<Record<string, any>>((grouped, item) => {
    // @ts-ignore
    const key = keyGetter(item);

    // @ts-ignore
    keys[key] = typeof key;

    if (grouped[key]) {
      grouped[key].push(item);
    } else {
      grouped[key] = [item];
    }

    return grouped;
  }, {});

  return Object.entries(result).map(([groupName, values]) => {
    // @ts-ignore
    const key = keys[groupName] === 'number' ? Number(groupName) : groupName;

    return [key, groupBy(values, groupers.slice())];
  });
};

class Sql<T> {
  private selector: Callback<T> | null = null;

  private whereFuncs: Callback[] = [];
  private groupByFuncs: Grouper[] = [];

  private data: any[] = [];
  private orderByFunc: Sorter | null = null;

  constructor() {
    this.select = this.select.bind(this);
    this.from = this.from.bind(this);
    this.where = this.where.bind(this);
    this.orderBy = this.orderBy.bind(this);
    this.groupBy = this.groupBy.bind(this);
    this.having = this.having.bind(this);
    this.execute = this.execute.bind(this);
  }

  select(selector?: Callback<T>) {
    if (selector) {
      this.selector = selector;
    }
    return this;
  }

  from(data1: T[] = [], data2: T[] = []) {
    this.data = [...data1, ...data2];
    return this;
  }

  where(picker1?: Callback, picker2?: Callback) {
    if (picker1) {
      this.whereFuncs.push(picker1);
    }
    return this;
  }

  orderBy(cb?: Sorter) {
    if (cb) {
      this.orderByFunc = cb;
    }
    return this;
  }

  groupBy(...args: Grouper[]) {
    this.groupByFuncs = args;

    return this;
  }

  having(cb?: Callback) {
    return this;
  }

  execute() {
    let mappedData = [...this.data];

    if (this.whereFuncs.length) {
      mappedData = mappedData.filter((v) =>
        this.whereFuncs.some((cb) => cb(v))
      );
    }

    if (this.groupByFuncs.length) {
      mappedData = groupBy(mappedData, this.groupByFuncs);
    }

    if (this.selector) {
      mappedData = mappedData.map(this.selector);
    }

    if (this.orderByFunc) {
      mappedData = mappedData.sort(this.orderByFunc);
    }

    return mappedData;
  }
}

export function query() {
  return new Sql();
}
