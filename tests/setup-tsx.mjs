// tsx asks the operating system for a username when it creates its temporary
// directory. Some locked-down Windows runners deny that lookup. Supplying the
// POSIX-style identity hook makes the path deterministic without weakening the
// application or changing production behaviour.
if (process.platform === "win32" && typeof process.geteuid !== "function") {
  process.geteuid = () => 0
}
