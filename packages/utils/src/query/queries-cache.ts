type Cast<X, Y> = X extends Y ? X : Y;

// Use readonly tuples to preserve literal types from `as const`
interface Fn {
  (...args: any[]): readonly unknown[];
}

export type QueriesKeyConfig = {
  [k: string]: QueriesKeyConfig | Fn | undefined;
};

type CacheKeyHelperType<T extends QueriesKeyConfig, P extends readonly string[] = readonly []> = {
  [k in keyof T]: T[k] extends (...args: any[]) => readonly unknown[]
  ? {
    toKey: () => [...P, k & string];
    toKeyWithArgs: (...args: Parameters<T[k]>) => [...P, k & string, ...Cast<ReturnType<T[k]>, readonly unknown[]>];
  }
  : T[k] extends QueriesKeyConfig
  ? { toKey: () => [...P, k & string] } & CacheKeyHelperType<Cast<T[k], QueriesKeyConfig>, Cast<[...P, k & string], readonly string[]>>
  : { toKey: () => [...P, k & string] };
};

// Overloads to help inference when no prefix is provided (defaults to [] as const)
export function buildQueriesCacheKey<T extends QueriesKeyConfig>(keyConfig: T): CacheKeyHelperType<T, readonly []>;
export function buildQueriesCacheKey<T extends QueriesKeyConfig, P extends readonly string[]>(keyConfig: T, prefix: P): CacheKeyHelperType<T, P>;

export function buildQueriesCacheKey<T extends QueriesKeyConfig, P extends readonly string[]>(keyConfig: T, prefix: P = [] as const as unknown as P): CacheKeyHelperType<T, P> {
  const keyFn = <K extends string>(name: K) => ([...prefix, name] as [...P, K]);
  const toolObj = {} as QueriesKeyConfig;
  for (const k of Object.keys(keyConfig)) {
    const v = (keyConfig as Record<string, unknown>)[k];
    if (typeof v === 'function') {
      toolObj[k] = {
        toKeyWithArgs: (...args: unknown[]) => ([...keyFn(k as string), ...((v as Fn)(...args))] as const),
        toKey: () => keyFn(k as string),
      } as unknown as QueriesKeyConfig[keyof QueriesKeyConfig];
    } else if (v instanceof Object) {
      toolObj[k] = { toKey: () => keyFn(k as string), ...buildQueriesCacheKey(v as QueriesKeyConfig, keyFn(k as string)) } as unknown as QueriesKeyConfig[keyof QueriesKeyConfig];
    } else {
      toolObj[k] = {
        toKey: () => keyFn(k as string),
      } as unknown as QueriesKeyConfig[keyof QueriesKeyConfig];
    }
  }
  return toolObj as unknown as CacheKeyHelperType<T, P>;
}

// test
const noticeKeyConfig = {
  notices: {
    list: {
      all: (kidId: number, filter: { keyword: string; isFavorite: boolean }) => [kidId, filter] as const,
      favorite: (kidId: number, filter: { keyword: string; isFavorite: boolean }) => [kidId, filter] as const,
    },
    detail: undefined,
  },
};

// declare function BuildModuleCacheKeyFnType<T extends KeyConfig>(config: T): CacheKeyHelperType<T>;
// const t = BuildModuleCacheKeyFnType(noticeKeyConfig);
// const t = buildQueriesCacheKey(noticeKeyConfig);
// const t1 = t.notices.toKey();
// const t2 = t.notices.list.toKey();
// const t3 = t.notices.list.all.toKeyWithArgs(1, { keyword: '', isFavorite: false });
// const t4 = t.notices.list.favorite.toKey();
// const t5 = t.notices.list.favorite.toKeyWithArgs(1, { keyword: '', isFavorite: false });
// const t6 = t.notices.detail.toKey();
