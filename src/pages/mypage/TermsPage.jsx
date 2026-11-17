import { useNavigate } from 'react-router-dom'
import Header from '../../shared/ui/Header.jsx'
import StampTabs from '../../components/mypage/StampTabs.jsx'
import { MYPAGE_PATHS } from '../../components/mypage/mypagePaths.js'
import { PRIVACY, TERMS } from '../../components/mypage/termsContent.js'
import './TermsPage.css'

const TAB_OPTIONS = [
  { id: 'terms', label: '이용약관' },
  { id: 'privacy', label: '개인정보 처리방침' },
]
const TAB_PATHS = { terms: MYPAGE_PATHS.terms, privacy: MYPAGE_PATHS.privacy }

/**
 * 조항 하나. lines의 각 줄이 한 문단이다.
 * @param {{title: string, lines: string[]}} props
 */
function Clause({ title, lines }) {
  return (
    <section className="terms-page__clause">
      <h3 className="terms-page__clause-title">{title}</h3>
      <div className="terms-page__clause-body">
        {lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </section>
  )
}

/**
 * 7-1-2 약관 · 이용약관, 7-1-2-1 약관 · 개인정보 처리방침. 설정(7-1-1)의 "이용약관 · 개인정보 처리방침"에서 들어온다.
 * 위쪽 탭으로 두 화면을 오가며, 탭은 주소를 바꾼다(/mypage/terms ↔ /mypage/terms/privacy). 탭 이동은 기록을 쌓지 않아서 뒤로가기는 한 번에 설정으로 간다.
 * 본문은 시안의 글을 그대로 쓴 정적 텍스트이다(termsContent.js). 서버와 연동하지 않는다.
 * @param {{kind: 'terms' | 'privacy'}} props kind: 어느 탭을 보여 줄지
 */
function TermsPage({ kind }) {
  const navigate = useNavigate()

  return (
    <main className="terms-page">
      <Header title="약관 · 정책" />

      <div className="terms-page__body">
        <StampTabs
          options={TAB_OPTIONS}
          value={kind}
          ariaLabel="약관 종류"
          onChange={(id) => navigate(TAB_PATHS[id], { replace: true })}
        />

        {kind === 'terms' ? (
          <article className="terms-page__card">
            <header className="terms-page__head">
              <h2 className="terms-page__title">{TERMS.title}</h2>
              <p className="terms-page__note">{TERMS.note}</p>
            </header>
            {TERMS.sections.map((section) => (
              <Clause key={section.title} {...section} />
            ))}
          </article>
        ) : (
          <article className="terms-page__card">
            <header className="terms-page__head">
              <h2 className="terms-page__title">{PRIVACY.title}</h2>
              <p className="terms-page__intro">{PRIVACY.note}</p>
            </header>
            <section className="terms-page__collect">
              <h3 className="terms-page__clause-title">{PRIVACY.collectTitle}</h3>
              {PRIVACY.collected.map((item) => (
                <div key={item.name} className="terms-page__item">
                  <p className="terms-page__item-name">{item.name}</p>
                  <p>목적 · {item.purpose}</p>
                  <p className="terms-page__item-period">보유 기간 · {item.period}</p>
                </div>
              ))}
            </section>
            {PRIVACY.sections.map((section) => (
              <Clause key={section.title} {...section} />
            ))}
          </article>
        )}
      </div>
    </main>
  )
}

export default TermsPage
