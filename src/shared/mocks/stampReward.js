// 우표 획득(5-12)과 보상 해금(5-13) 목 데이터(mock). 문서 레포 API 확정 전이며 화면 확인용이다.
//
// 문서 레포 `api/`에는 우표·보상 API가 없다. `spec/stamp.md`(STAMP-05, 획득 모달)를 참고해 모양을 정했다.
//   - 우표나 보상을 준 응답에 새로 받은 항목을 함께 담아 프론트가 모달을 띄우게 한다(가정, spec/stamp.md).
//   - 수집 보상 4개: 3개 고향이 표정 스티커 / 5개 편지지 「밤하늘」 / 10개 「우표 수집가」 우표 + 글씨체 「엄마의 손편지」 / 15개 한정 편지지 「금박 엽서」
// 필드 이름은 문서 레포 컨벤션(`api/common.md`: snake_case)을 따랐다. 아래는 모두 mock 전용이며 API가 정해지면 바뀔 수 있다.
// 마이 우표첩(7-8)의 보상 mock(shared/mocks/stampCollection.js)과 같은 기준(3, 5, 10, 15개)이지만 서로 가져다 쓰지 않고 따로 두었다.

// 새로 받은 우표(5-12). 시안은 「첫 왕복」이고 "모은 우표 6개 · 보상까지 4개"이다.
//   stamp            { code, name } 새로 받은 우표. code는 shared/mocks/stamps.js의 id와 같다
//   reason           받은 계기 문구 ("하늘빛님과 편지를 주고받아")
//   total_count      우표를 모은 개수(업적 + 꾸미기 보유 수, spec/stamp.md의 "우표 수")
//   unlocked_reward_threshold  이번에 보상이 열렸으면 그 보상의 기준 개수, 아니면 null. 있으면 "확인" 뒤에 5-13이 이어진다
export const MOCK_STAMP_GAIN = {
  stamp: { code: 'first-roundtrip', name: '첫 왕복' },
  reason: '하늘빛님과 편지를 주고받아',
  total_count: 6,
  unlocked_reward_threshold: null,
}

// 수집 보상(5-13). 시안 5-13은 3개 보상(고향이 표정 스티커)만 있다. 나머지 모양은 시안이 없다.
//   threshold    필요한 우표 개수
//   kind         미리보기 그림 종류 ('sticker' | 'paper' | 'collector' | 'postcard')
//   name         보상 이름
//   detail       이름 뒤에 붙는 설명. 시안은 "고향이 표정 스티커 5종"이다. 표정이 5종인지 6종인지는 요청(1110_be2fe_spec-open-questions #10)에서 확인 중이다
//   usage        해금 뒤 어디서 쓰는지. 시안은 스티커만 "편지 서명 단계에서 스티커를 붙일 수 있어요"이고, 나머지 문구는 mock에서 정했다
//   try_label    아래 보조 버튼 이름. 시안은 스티커만 "스티커 써보기"이고 나머지 문구는 mock에서 정했다
export const MOCK_COLLECT_REWARDS = [
  {
    threshold: 3,
    kind: 'sticker',
    name: '고향이 표정 스티커',
    detail: '5종',
    usage: '편지 서명 단계에서 스티커를 붙일 수 있어요',
    try_label: '스티커 써보기',
  },
  {
    threshold: 5,
    kind: 'paper',
    name: '편지지 「밤하늘」',
    detail: '',
    usage: '편지를 쓸 때 편지지로 고를 수 있어요',
    try_label: '편지지 써보기',
  },
  {
    threshold: 10,
    kind: 'collector',
    name: '「우표 수집가」 우표 + 글씨체',
    detail: '',
    usage: '글씨체 「엄마의 손편지」로 편지를 쓸 수 있어요',
    try_label: '글씨체 써보기',
  },
  {
    threshold: 15,
    kind: 'postcard',
    name: '한정 편지지 「금박 엽서」',
    detail: '',
    usage: '편지를 쓸 때 편지지로 고를 수 있어요',
    try_label: '편지지 써보기',
  },
]
