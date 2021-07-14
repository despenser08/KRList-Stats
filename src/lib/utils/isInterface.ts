export default function <T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  object: any,
  property: string
): object is T {
  return property in object;
}
