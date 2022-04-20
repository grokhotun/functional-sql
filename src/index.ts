type Callback<T = any> = (value: T) => any;
type Sorter = (value1: any, value2: any) => number;
type Grouper<T = any> = (value: T) => string;

class Sql<T> {
  private selector: Callback<T> | null = null;

  private whereFuncs: Callback[] = [];
  private groupByFuncs: Grouper[] = [];

  private data: T[] = [];
  private mappedData: any = [];

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
  }
  from(data1: T[] = [], data2: T[] = []) {
    this.data = [...data1, ...data2];
  }
  where(picker1?: Callback, picker2?: Callback) {
    if (picker1) {
      this.whereFuncs.push(picker1);
    }
  }
  orderBy(cb?: Sorter) {}
  groupBy(...args: Grouper[]) {
    this.groupByFuncs = args;
  }
  having(cb?: Callback) {}
  execute() {
    return this.data;
  }
}

export function query() {
  const sql = new Sql();

  return {
    select(selector?: Callback) {
      sql.select(selector);
      return this;
    },
    from(data1?: any, data2?: any) {
      sql.from(data1, data2);
      return this;
    },
    where(picker1?: Callback, picker2?: Callback) {
      sql.where(picker1, picker2);
      return this;
    },
    orderBy(selector?: Sorter) {
      sql.orderBy(selector);
      return this;
    },
    groupBy(...args: Grouper[]) {
      sql.groupBy(...args);
      return this;
    },
    having(selector?: Callback) {
      sql.having(selector);
      return this;
    },
    execute() {
      return sql.execute();
    },
  };
}
