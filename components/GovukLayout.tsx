import Link from 'next/link'
import type { ReactNode } from 'react'

export function GovukLayout({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <>
      <a href="#main-content" className="govuk-skip-link">Skip to main content</a>

      <header className="govuk-header" role="banner">
        <div className="govuk-header__container govuk-width-container">
          <div className="govuk-header__logo">
            <Link href="/" className="govuk-header__link govuk-header__link--homepage">
              <span className="govuk-header__logotype">
                <span className="govuk-header__logotype-text">Family Tree Viewer</span>
              </span>
            </Link>
          </div>
          {title && (
            <div className="govuk-header__content">
              <span className="govuk-header__link govuk-header__service-name">{title}</span>
            </div>
          )}
        </div>
      </header>

      <div className="govuk-width-container">
        <div className="govuk-phase-banner">
          <p className="govuk-phase-banner__content">
            <strong className="govuk-tag govuk-phase-banner__content__tag">Beta</strong>
            <span className="govuk-phase-banner__text">
              This is a new service. Upload a <strong>.ged</strong> file to explore your family tree.
            </span>
          </p>
        </div>

        <main id="main-content" className="govuk-main-wrapper">
          {children}
        </main>
      </div>

      <footer className="govuk-footer">
        <div className="govuk-width-container">
          <div className="govuk-footer__meta">
            <div className="govuk-footer__meta-item govuk-footer__meta-item--grow">
              <span className="govuk-footer__licence-description">
                Family Tree Viewer — GEDCOM files are processed locally in your browser. No data is uploaded.
              </span>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
