export default function Footer() {
  return (
    <footer className="bio-footer">
      <div className="bio-footer-inner">
        <p className="bio-footer-text">
          © {new Date().getFullYear()} Wizard Trader · All rights reserved
        </p>
        <p className="bio-footer-disclaimer">
          Trading involves risk. Past performance is not indicative of future results.
        </p>
      </div>
    </footer>
  )
}
