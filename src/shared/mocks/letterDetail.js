// 받은 편지 상세(5-8, 5-9) 목 데이터(mock). 문서 레포 API 확정 전이며 화면 확인용이다.
//
// 문서 레포 `api/`에는 편지 API가 없다. `spec/mail.md`(MAIL-05 읽음, MAIL-06 편지 상세)의 항목 이름을 참고해 이 모양을 정했다.
//   편지 상세: 편지지, 글씨체, 본문, 서명 이미지, 스티커, 우표, 보낸 사람 닉네임, 출발·도착 지역, 걸린 시간, 첫 편지 여부
// 필드 이름은 문서 레포 컨벤션(`api/common.md`: snake_case)을 따랐다. 아래는 모두 mock 전용이며 API가 정해지면 바뀔 수 있다.
//
// 모양:
//   id                편지 id
//   sender_nickname   보낸 사람 닉네임 ("From. "은 화면에서 붙인다)
//   sender_region     보낸 사람 지역 (출발). 답장할 때 편지를 받을 지역이 된다
//   receiver_region   받는 사람(나) 지역 (도착)
//   travel_minutes    배송에 걸린 시간(분)
//   is_first_letter   첫 편지 여부 (5-9의 "첫 편지" 배지)
//   is_read           읽음 여부. false면 5-8(새 편지 도착), true면 5-9(편지 열람)로 가정했다
//   stamp             { code, name } 우표. code는 shared/mocks/stamps.js의 id와 같다
//   body              본문 (여러 줄은 줄바꿈 문자로 나눈다)
//   signature_text    ※ mock 전용. 명세의 서명은 이미지(PNG)인데 실제 서명 이미지가 없어서 손글씨 문구로 대신 보여 준다
// 편지지(paper)·글씨체(font)·스티커는 화면에서 아직 쓰지 않는다. 편지지는 한 가지(기본)로만 그린다.

// 5-8 "To. 다인". 내 닉네임은 마이 mock(MOCK_ME)과 같은 값이다.
export const MOCK_MY_NICKNAME = '다인'

export const MOCK_LETTER_DETAILS = {
  101: {
    id: 101,
    sender_nickname: '하늘빛',
    sender_region: '충남 천안',
    receiver_region: '서울 성북',
    travel_minutes: 360,
    is_first_letter: true,
    is_read: false,
    stamp: { code: 'penpal-friend', name: '펜팔 친구' },
    body: '일기 잘 읽었어요! 정문 붕어빵 트럭은\n제가 고등학생 때도 있었어요. 아직도\n팥이 꽉 차 있는지 궁금하네요.\n서울은 춥죠? 감기 조심하고,\n성북 동네 이야기도 더 들려줘요!',
    signature_text: '다음엔 슈크림 맛도 먹어봐요!',
  },
  102: {
    id: 102,
    sender_nickname: '갈매기',
    sender_region: '부산 수영',
    receiver_region: '서울 성북',
    travel_minutes: 720,
    is_first_letter: true,
    is_read: false,
    stamp: { code: 'penpal-friend', name: '펜팔 친구' },
    body: '광안리 새벽 산책 사진을 보니까\n바다가 너무 보고 싶어졌어요.\n성북 골목은 어떤 냄새가 나나요?\n부산은 요즘 바람이 많이 불어요.',
    signature_text: '바다 소리 같이 들어요',
  },
  103: {
    id: 103,
    sender_nickname: '귤껍질',
    sender_region: '제주 서귀포',
    receiver_region: '서울 성북',
    travel_minutes: 720,
    is_first_letter: true,
    is_read: true,
    stamp: { code: 'first-letter', name: '첫 편지' },
    body: '제주는 지금 귤 수확이 한창이에요.\n보내 주신 일기에서 서울의 가을이\n느껴져서 반가웠어요.\n귤 한 상자 보내고 싶은 마음이에요.',
    signature_text: '귤 먹고 힘내요!',
  },
  104: {
    id: 104,
    sender_nickname: '감자왕',
    sender_region: '강원 춘천',
    receiver_region: '서울 성북',
    travel_minutes: 360,
    is_first_letter: false,
    is_read: true,
    stamp: { code: 'first-roundtrip', name: '첫 왕복' },
    body: '답장 고마워요!\n춘천은 벌써 아침저녁으로 쌀쌀해요.\n닭갈비 맛집은 다음 편지에 알려 줄게요.',
    signature_text: '또 편지해요',
  },
}
