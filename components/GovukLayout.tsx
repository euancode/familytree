import Link from 'next/link'
import type { ReactNode } from 'react'

export function GovukLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <a href="#main-content" className="govuk-skip-link" data-module="govuk-skip-link">
        Skip to main content
      </a>

      {/* Header */}
      <header className="govuk-header" data-module="govuk-header">
        <div className="govuk-header__container govuk-width-container">
          <div className="govuk-header__logo">
            <Link href="/" className="govuk-header__link govuk-header__link--homepage">
              <span className="govuk-header__logotype">
                <span className="govuk-header__logotype-text">Family Tree Viewer</span>
              </span>
            </Link>
          </div>
        </div>
      </header>


<div className="govuk-width-container">
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
