interface WindowProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export default function Window({ title, children, className = "" }: WindowProps) {
  return (
    <section className={`card ${className}`}>
      <header className="mb-3">
        <h2 className="text-lg font-semibold">{title}</h2>
      </header>
      <div className="text-sm space-y-2">{children}</div>
    </section>
  );
}
