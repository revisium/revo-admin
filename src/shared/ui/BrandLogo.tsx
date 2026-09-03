import { system } from './theme/theme'

// The revo brand mark (custom, not Lucide): a rounded ink tile with a stylized
// white "r" and a knocked-out dot. Colors resolve from theme tokens to stay token-driven.
const brand = system.token('colors.action.primary.bg')
const brandOn = system.token('colors.action.primary.fg')

export const BrandLogo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="6" fill={brand} />
    <path
      d="M8 17V8.2C8 7.5 8.5 7 9.2 7h3.4c2 0 3.4 1.3 3.4 3.1 0 1.4-.8 2.5-2.1 2.9L16.4 17"
      stroke={brandOn}
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="10.1" r="1.05" fill={brand} />
  </svg>
)
