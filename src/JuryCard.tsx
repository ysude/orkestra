import type { ReactNode } from 'react'

export function JuryCard({ title, id, icon, children }: { title: string; id?: string; icon?: ReactNode; children: ReactNode }) {
  return <article className="jury-card" id={id}>
    <h3>{icon && <span className="jury-card-icon" aria-hidden="true">{icon}</span>}{title}</h3>
    {children}
  </article>
}
