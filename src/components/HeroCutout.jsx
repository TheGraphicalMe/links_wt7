import { profileData, socialIcons } from '../data/siteData'
import heroCutout from '../assets/IMG_20260813_170247.jpg.jpeg'
import { FaInstagram, FaYoutube, FaTelegramPlane, FaWhatsapp } from 'react-icons/fa'

const iconMap = {
  instagram: FaInstagram,
  youtube: FaYoutube,
  telegram: FaTelegramPlane,
  whatsapp: FaWhatsapp,
}

export default function HeroCutout() {
  return (
    <section className="hero-cutout">
      {/* Profile Image */}
      <div className="hero-image-wrap">
        <div className="hero-image-glow" />
        <div className="hero-image-ring" />
        <img
          src={heroCutout}
          alt={profileData.name}
          className="hero-image"
        />
      </div>

      {/* Profile info */}
      <div className="hero-info">
        <div className="hero-name-row">
          <h1 className="hero-name">{profileData.name}</h1>
          {profileData.verified && (
            <span className="hero-verified" title="Verified">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="12" fill="var(--cyan)" />
                <path d="M9 12.5L11 14.5L15.5 10" stroke="#0B0D17" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          )}
        </div>
        <p className="hero-tagline">{profileData.tagline}</p>
        <p className="hero-subtitle">{profileData.subtitle}</p>

        {/* Social icons row */}
        <div className="hero-social-row">
          {socialIcons.map((s) => {
            const isImage = s.icon && s.icon.startsWith && s.icon.startsWith('http')
            const Icon = !isImage ? iconMap[s.icon] : null

            return (
              <a
                key={s.name}
                href={s.url}
                className={`hero-social-icon ${isImage ? 'is-image' : `icon-${s.icon}`}`}
                aria-label={s.name}
                title={s.name}
              >
                {isImage ? (
                  <img src={s.icon} alt={s.name} style={{ width: '65%', height: '65%', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
                ) : (
                  <Icon style={{ width: s.icon === 'instagram' ? '55%' : '45%', height: s.icon === 'instagram' ? '55%' : '45%' }} />
                )}
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}
