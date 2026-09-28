export function RequiredMark({ required }: { required?: boolean }) {
  if (!required) {
    return null;
  }
  return (
    <span className="ml-0.5 text-destructive" aria-hidden="true">
      *
    </span>
  );
}
