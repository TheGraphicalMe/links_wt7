import { ArrowUpRight } from 'lucide-react'
import { FaInstagram, FaYoutube, FaTelegramPlane, FaWhatsapp } from 'react-icons/fa'

const iconMap = {
  instagram: <FaInstagram size={18} />,
  youtube: <FaYoutube size={18} />,
  telegram: <FaTelegramPlane size={18} />,
  whatsapp: <FaWhatsapp size={18} />,
}

export default function LinkButton({ link, index }) {
  const isFeatured = link.category === 'featured'

  return (
    <a
      href={link.url}
      className={`link-btn ${isFeatured ? 'link-btn-featured' : ''} ${link.glow ? 'link-btn-glow' : ''}`}
      style={{ animationDelay: `${index * 0.06}s` }}
      id={`link-${link.id}`}
    >
      {link.icon && (
        <span className={`link-btn-icon ${link.icon.startsWith && link.icon.startsWith('http') ? 'is-image' : ''} ${iconMap[link.icon] ? `icon-${link.icon}` : ''}`}>
          {link.icon === 'wt7-logo' ? (
            <div style={{
              width: '100%', 
              height: '100%', 
              background: 'radial-gradient(circle at center, #c24ff3 0%, #7b1fa2 100%)', 
              borderRadius: 'inherit',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontFamily: 'Arial, sans-serif',
              fontWeight: 900,
              fontStyle: 'italic',
              fontSize: '15px',
              letterSpacing: '-0.5px'
            }}>WT7</div>
          ) : link.icon.startsWith && link.icon.startsWith('http') ? (
            <img 
              src={link.icon} 
              alt={`${link.title} logo`} 
              style={{ width: '32px', height: '32px', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} 
            />
          ) : (
            iconMap[link.icon] || link.icon
          )}
        </span>
      )}
      <div className="link-btn-content">
        <span className="link-btn-title">{link.title}</span>
        {link.subtitle && (
          <span className="link-btn-subtitle">{link.subtitle}</span>
        )}
      </div>
      <ArrowUpRight size={16} className="link-btn-arrow" />
    </a>
  )
}
