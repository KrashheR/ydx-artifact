import type { PropsWithChildren } from "react";

export function Panel({ children, className = "" }: PropsWithChildren<{ className?: string }>) {
  return (
    <section className={`rounded-[2rem] border border-graphite/15 bg-ivory/85 p-5 shadow-2xl shadow-graphite/15 ${className}`}>
      {children}
    </section>
  );
}
