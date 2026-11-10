import { useEffect, useId, useRef, useState } from 'react'
import Chip from '../../shared/ui/Chip.jsx'
import './NewLetterFilters.css'

const ALL_REGIONS = '전체'

/**
 * 새 편지 탭(5-1)의 칩 줄: "지역별 ▾"(드롭다운) + 정렬 칩.
 * 시안 없음, 임시 UI: Figma 5-1에는 칩만 있고 지역을 고르는 화면이 없어서
 * 앱의 기존 토큰(배경, 선, 둥근 정도, 폰트)으로 간단한 목록을 만들었다. 시안이 나오면 이 목록 모양을 바꾼다.
 * 바깥을 누르거나 Esc를 누르면 닫히고, 위·아래 방향키로 항목을 옮길 수 있다.
 * 목록이 칩 줄의 가로 스크롤에 잘리지 않도록 스크롤 영역(__row)과 목록을 나란히 둔다.
 * @param {string[]} regions 고를 수 있는 지역(시·도). "전체"는 이 컴포넌트가 붙인다.
 * @param {string|null} region 선택한 지역. null이면 전체
 * @param {(region: string|null) => void} onRegionChange
 * @param {Array<{id: string, label: string}>} sortOptions
 * @param {string} sort 선택한 정렬 id
 * @param {(id: string) => void} onSortChange
 */
function NewLetterFilters({ regions, region, onRegionChange, sortOptions, sort, onSortChange }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const triggerRef = useRef(null)
  const listRef = useRef(null)
  const listId = useId()

  // 열려 있는 동안만: 바깥 누르기 / Esc로 닫기
  useEffect(() => {
    if (!open) return undefined
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      triggerRef.current?.focus()
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  // 열리면 선택된 항목(없으면 "전체")으로 포커스를 옮긴다
  useEffect(() => {
    if (!open) return
    const options = listRef.current?.querySelectorAll('[role="option"]')
    const selected = listRef.current?.querySelector('[aria-selected="true"]')
    ;(selected ?? options?.[0])?.focus()
  }, [open])

  const choose = (next) => {
    setOpen(false)
    triggerRef.current?.focus()
    onRegionChange(next)
  }

  const onListKeyDown = (event) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
    event.preventDefault()
    const options = Array.from(listRef.current.querySelectorAll('[role="option"]'))
    const index = options.indexOf(document.activeElement)
    const step = event.key === 'ArrowDown' ? 1 : -1
    options[(index + step + options.length) % options.length]?.focus()
  }

  const onOptionKeyDown = (event, next) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    choose(next)
  }

  const items = [{ value: null, label: ALL_REGIONS }, ...regions.map((name) => ({ value: name, label: name }))]

  return (
    <div className="mailbox-page__chips" ref={rootRef}>
      <div className="mailbox-page__chips-row">
        <Chip
          ref={triggerRef}
          variant={region ? 'light' : 'default'}
          onClick={() => setOpen((value) => !value)}
          aria-pressed={undefined}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
        >
          {region ?? '지역별'} ▾
        </Chip>
        {sortOptions.map((option) => (
          <Chip
            key={option.id}
            variant={option.id === sort ? 'selected' : 'default'}
            onClick={() => onSortChange(option.id)}
          >
            {option.label}
          </Chip>
        ))}
      </div>

      {open && (
        <ul
          id={listId}
          ref={listRef}
          className="new-letter-filters__list"
          role="listbox"
          aria-label="지역별 보기"
          onKeyDown={onListKeyDown}
        >
          {items.map((item) => {
            const selected = item.value === region
            return (
              <li
                key={item.label}
                role="option"
                tabIndex={-1}
                aria-selected={selected}
                className={`new-letter-filters__option${selected ? ' is-selected' : ''}`}
                onClick={() => choose(item.value)}
                onKeyDown={(event) => onOptionKeyDown(event, item.value)}
              >
                {item.label}
                {selected && <span aria-hidden="true"> ✓</span>}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default NewLetterFilters
