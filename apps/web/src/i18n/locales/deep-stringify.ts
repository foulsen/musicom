export type DeepStringify<T> = T extends string ? string : { [K in keyof T]: DeepStringify<T[K]> };
