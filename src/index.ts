type Callback<T = any> = (value: T) => any;
type Sorter = (value1: any, value2: any) => number;
type Grouper<T = any> = (value: T) => string;

const groupBy = <T>(list: T[], groupers: Grouper<T>[]): any => {
  if (!groupers.length) return list;

  const copied = [...groupers];
  const keyGetter = copied.shift();
  const keysTypes: Record<string, string> = {};

  return Object.entries(
    list.reduce<Record<string, any>>((grouped, item) => {
      const key = keyGetter!(item);

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

class Sql<T> {
  private data: any[] = [];

  private selector: Callback<T> | null = null;
  private orderByFunc: Sorter | null = null;
  private havingFunc: Callback[] = [];
  private whereFuncs: Callback[] = [];
  private secondWhereFuncs: Callback[] = [];
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

  select(selector?: Callback<T>) {
    if (selector) {
      this.selector = selector;
    }
    return this;
  }

  from(data1?: T[], data2?: T[]) {
    if (data1) {
      this.data = data1;
    }

    if (data1 && data2) {
      this.data = data1.reduce<any>((joined, currentValue) => {
        data2.forEach((v) => {
          joined.push([currentValue, v]);
        });

        return joined;
      }, []);
    }

    return this;
  }

  where(...fns: Callback[]) {
    if (!this.whereFuncs.length) {
      this.whereFuncs = fns;
    } else if (!this.secondWhereFuncs.length) {
      this.secondWhereFuncs = fns;
    } else {
      this.secondWhereFuncs = this.secondWhereFuncs.concat(fns);
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
    if (cb) {
      this.havingFunc.push(cb);
    }
    return this;
  }

  execute() {
    let mappedData = [...this.data];

    if (this.whereFuncs.length) {
      mappedData = mappedData.filter((v) =>
        this.whereFuncs.some((cb) => cb(v))
      );
    }

    if (this.secondWhereFuncs && this.secondWhereFuncs.length) {
      mappedData = mappedData.filter((row) => {
        return this.secondWhereFuncs.every((fn) => fn(row));
      });
    }

    if (this.groupByFuncs.length) {
      mappedData = groupBy(mappedData, [...this.groupByFuncs]);
    }

    if (this.havingFunc.length) {
      mappedData = mappedData.filter((v) => {
        return this.havingFunc.every((fn) => fn(v));
      });
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
