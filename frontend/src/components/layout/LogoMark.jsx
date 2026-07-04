export default function LogoMark() {
  return (
    <span className="relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-primary-soft">
      <span className="absolute left-2 top-1.5 h-5 w-2 -skew-y-12 rounded-[2px] bg-primary" />
      <span className="absolute right-2 top-1.5 h-5 w-2 skew-y-12 rounded-[2px] bg-primary/85" />
    </span>
  );
}
