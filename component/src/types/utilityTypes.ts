// sets properties that are in K but not in T to optional never
type AssignNever<T, K> = K & {[B in Exclude<keyof T, keyof K>]?: never};

// This type accepts a union of interfaces that contain varying combinations of the CompleteInterface and returns
// a union of interfaces that contain their originally missing properties set to optional never. The reason why
// we have Interfaces extends object is because if we just used AssignNever in InterfacesUnion, TypeScript would
// attempt to intersect all of the passed interfaces, hence this preserves the unions
type BuildUniqueInterfaces<CompleteInterface, Interfaces> = Interfaces extends object
  ? AssignNever<CompleteInterface, Interfaces>
  : never;

type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

export type InterfacesUnion<Interfaces> = BuildUniqueInterfaces<UnionToIntersection<Interfaces>, Interfaces>;

export type OverrideTypes<T, U> = {[P in keyof T]: U};

export type PropsRequired<T, K extends keyof T> = T & {[P in K]-?: T[P]};
