// Central photo library. Swap these IDs/URLs to re-art-direct the site.
// All photographs are served by Unsplash's CDN and cropped on request.

export const unsplash = (id: string, w = 1200, h?: number, q = 72) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}${h ? `&h=${h}` : ''}&q=${q}`;

/** Build a responsive srcSet for an Unsplash-hosted photo. */
export const srcSetFor = (src: string) => {
  if (!src.includes('images.unsplash.com')) return undefined;
  const base = src.replace(/([?&])w=\d+/, '$1w=__W__').replace(/&h=\d+/, '');
  return [480, 800, 1200, 1800].map((w) => `${base.replace('__W__', String(w))} ${w}w`).join(', ');
};

export const PHOTO = {
  auditorium: '1544531586-fde5298cdd40',
  graduatesLawn: '1541339907198-e08756dedf3f',
  schoolBuilding: '1562774053-701939374585',
  libraryGirl: '1427504494785-3a9ca7044f45',
  classroomKids: '1503676260728-1c00da094a0b',
  lectureHall: '1524178232363-1fb2b075b655',
  classroomDesks: '1509062522246-3755977927d7',
  schoolHall: '1580582932707-520aed937b7b',
  friendsBehind: '1529156069898-49953e39b3ac',
  friendsSunset: '1511632765486-a01980e01a18',
  friendsGroup: '1517486808906-6ca8b3f04846',
  balloons: '1530103862676-de8c9debad1d',
  confetti: '1492684223066-81342ee5ff30',
  concertCrowd: '1540575467063-178a50c2df87',
  audience: '1475721027785-f74eccf877e2',
  basketball: '1546519638-68e109498ffc',
  track: '1461896836934-ffe607ba8211',
  studyTable: '1522202176988-66273c2fd55f',
  studentsGroup: '1523240795612-9a054b0db644',
  books: '1497633762265-9d179a990aa6',
  library: '1481627834876-b7833e8f5570',
  libraryShelves: '1507842217343-583bb7270b66',
  gradCaps: '1627556704290-2b1f5853ff78',
  notebook: '1501504905252-473c47e087f8',
  roadTrip: '1469854523086-cc02fe5d8800',
  mountains: '1506905925346-21bda4d32df4',
  travel: '1488646953014-85cb44e25828',
  dinnerTable: '1511795409834-ef04bbd61622',
  banquet: '1464366400600-7168b8af9bc3',
  friendsLaugh: '1543269865-cbf427effbad',
  friendsCircle: '1528605248644-14dd04022da1',
  graduate: '1525921429624-479b6a26d84d',
  graduation: '1498243691581-b145c3f54a5a',
  classroomChairs: '1606761568499-6d2451b23c66',
  kidsStudy: '1588072432836-e10032774350',
  teacherClass: '1571260899304-425eee4c7efc',
  classroomTeacher: '1577896851231-70ef18881754',
  teacher: '1544717305-2782549b5136',
  football: '1574629810360-7efbbe195018',
  stadiumNight: '1431324155629-1a6deb1dec8d',
  cricketBall: '1531415074968-036ba1b575da',
  cricketGround: '1540747913346-19e32dc3e97e',
  cyclists: '1517649763962-0c623066013b',
  teamTable: '1519389950473-47ba0277781c',
  stageLights: '1514525253161-7a46d19cd819',
  desertRoad: '1500530855697-b586d89ba3ee',
  reunionDinner: '1544928147-79a2dbc1f389',
} as const;

export const portrait = (gender: 'men' | 'women', n: number) =>
  `https://randomuser.me/api/portraits/${gender}/${n}.jpg`;
