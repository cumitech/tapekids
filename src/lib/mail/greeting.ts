export function mailGreeting(firstName?: string) {
  const name = firstName?.trim();
  return name ? `Shalom ${name},` : "Shalom,";
}
