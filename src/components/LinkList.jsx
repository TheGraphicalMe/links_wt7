import { links, categories } from '../data/siteData'
import LinkButton from './LinkButton'

export default function LinkList() {
  let globalIndex = 0

  return (
    <section className="link-list">
      {categories.map((cat) => {
        const catLinks = links.filter((l) => l.category === cat.key)
        if (catLinks.length === 0) return null

        return (
          <div key={cat.key} className="link-group">
            {cat.label && (
              <div className="link-group-label">
                <span className="link-group-line" />
                <span className="link-group-text">{cat.label}</span>
                <span className="link-group-line" />
              </div>
            )}
            {catLinks.map((link) => {
              const idx = globalIndex++
              return <LinkButton key={link.id} link={link} index={idx} />
            })}
          </div>
        )
      })}
    </section>
  )
}
