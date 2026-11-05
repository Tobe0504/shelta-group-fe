import Link from "next/link";

export function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5 text-xl font-semibold tracking-tight"
    >
      SheltaMart
    </Link>
  );
}
