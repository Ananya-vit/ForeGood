export function Button({ href, children, variant = "primary" }: { href: string; children: React.ReactNode; variant?: "primary" | "outline" }) {
  const base = "inline-block rounded-full px-8 py-3 text-sm font-medium transition-all duration-200"
  const styles = {
    primary: `${base} bg-black text-white hover:bg-gray-800 hover:scale-[1.02]`,
    outline: `${base} border border-gray-300 text-gray-700 hover:border-black hover:text-black`,
  }
  return <a href={href} className={styles[variant]}>{children}</a>
}
