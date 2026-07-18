/** Minimal classnames joiner so we don't need an extra dependency. */
export default function clsx(...args: Array<string | false | null | undefined>): string {
  return args.filter(Boolean).join(' ');
}
