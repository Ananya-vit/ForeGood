export function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto max-w-6xl px-6 ${className}`}>{children}</div>
}

export function Section({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={`py-16 md:py-24 ${className}`}>
      <Container>{children}</Container>
    </section>
  )
}

export function GradientText({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`bg-gradient-to-r from-black to-gray-500 bg-clip-text text-transparent ${className}`}>{children}</span>
}
