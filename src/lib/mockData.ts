import { User, Lesson, LessonAccess, UserLessonProgress, Attendance, Product, Order, HomepageSection, Coupon, NoticeBoard, DeliveryFees } from './types';

export const MOCK_ADMIN: User = {
  id: 'usr-admin-01',
  fullName: 'Ershad Zaman',
  email: process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'ershad@guitart.com',
  password: process.env.NEXT_PUBLIC_ADMIN_PASSWORD || process.env.ADMIN_DEFAULT_PASSWORD || 'admin123',
  role: 'admin',
  mobile: '+880 1711-000000',
  registrationDate: '2023-01-01',
  status: 'Active',
  avatarUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
};

export const MOCK_STUDENTS: User[] = [
  {
    id: 'usr-std-01',
    fullName: 'Tariq Hasan',
    email: 'tariq.hasan@gmail.com',
    password: 'password123',
    role: 'student',
    mobile: '+880 1819-123456',
    dateOfBirth: '1998-05-14',
    level: 'Intermediate',
    registrationDate: '2024-02-15',
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'usr-std-02',
    fullName: 'Nusrat Jahan',
    email: 'nusrat.jahan@yahoo.com',
    password: 'password123',
    role: 'student',
    mobile: '+880 1712-987654',
    dateOfBirth: '2001-09-20',
    level: 'Beginner',
    registrationDate: '2024-03-01',
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'usr-std-03',
    fullName: 'Tanvir Ahmed',
    email: 'tanvir.ahmed@outlook.com',
    password: 'password123',
    role: 'student',
    mobile: '+880 1911-456789',
    dateOfBirth: '1995-11-03',
    level: 'Advanced',
    registrationDate: '2023-11-10',
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'usr-std-04',
    fullName: 'Farhan Kabir',
    email: 'farhan.kabir@gmail.com',
    password: 'password123',
    role: 'student',
    mobile: '+880 1680-334455',
    dateOfBirth: '2002-01-25',
    level: 'Beginner',
    registrationDate: '2024-04-12',
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'usr-std-05',
    fullName: 'Sadiya Rahman',
    email: 'sadiya.r@gmail.com',
    password: 'password123',
    role: 'student',
    mobile: '+880 1552-889900',
    dateOfBirth: '1999-07-18',
    level: 'Intermediate',
    registrationDate: '2024-01-08',
    status: 'Inactive',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'usr-std-06',
    fullName: 'Abrar Chowdhury',
    email: 'abrar.chowdhury@gmail.com',
    password: 'password123',
    role: 'student',
    mobile: '+880 1715-112233',
    dateOfBirth: '2003-08-12',
    level: 'Beginner',
    registrationDate: '2024-04-18',
    status: 'Pending',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'usr-std-07',
    fullName: 'Mehnaz Tabassum',
    email: 'mehnaz.tabassum@gmail.com',
    password: 'password123',
    role: 'student',
    mobile: '+880 1844-998877',
    dateOfBirth: '2000-11-30',
    level: 'Intermediate',
    registrationDate: '2024-04-19',
    status: 'Pending',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
  },
];

export const MOCK_LESSONS: Lesson[] = [
  {
    id: 'lsn-01',
    title: 'Alternate Picking Fundamentals & Hand Synchronization',
    description: 'Master strict alternate picking mechanics, wrist relaxation, and clean string transitions across all 6 guitar strings.',
    level: 'Beginner',
    lessonNumber: 1,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Standard embed format
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=electric-guitar-riff-114486.mp3',
    tabPreviewText: `E|---------------------------------1-2-3-4-|
B|-------------------------1-2-3-4---------|
G|-----------------1-2-3-4-----------------|
D|---------1-2-3-4-------------------------|
A|---------1-2-3-4-------------------------|
E|-1-2-3-4---------------------------------|`,
    tabFileUrl: '/tabs/lesson-01-alternate-picking.pdf',
    thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    durationMinutes: 24,
    instructorNotes: 'Ensure your picking wrist stays fluid. Practice with a metronome at 60 BPM before raising tempo to 120 BPM.',
    isPublic: true,
    createdAt: '2024-01-10',
  },
  {
    id: 'lsn-02',
    title: 'Minor Pentatonic Scale Patterns & Expressive Bending',
    description: 'Learn position 1 & 2 of the A Minor Pentatonic scale along with micro-tonal bends, quarter-step vibrato, and blues phrasing.',
    level: 'Beginner',
    lessonNumber: 2,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8230b5a.mp3?filename=rock-guitar-solo-14283.mp3',
    tabPreviewText: `E|---------------------------------5-8-b10-|
B|-----------------------------5-8---------|
G|-------------------------5-7-------------|
D|---------------------5-7-----------------|
A|-----------------5-7---------------------|
E|-5-8-5-8-5-8-5-8-------------------------|`,
    tabFileUrl: '/tabs/lesson-02-pentatonic-bending.pdf',
    thumbnail: 'https://images.unsplash.com/photo-1525201548942-d8732f6617a0?auto=format&fit=crop&w=800&q=80',
    durationMinutes: 32,
    instructorNotes: 'Support your ring finger bend with the index and middle fingers behind it for pitch accuracy.',
    createdAt: '2024-01-18',
  },
  {
    id: 'lsn-03',
    title: 'CAGED System & Triad Inversions across the Fretboard',
    description: 'Deconstruct the fretboard using CAGED chord shapes and major/minor triad inversions on the top 3 string sets.',
    level: 'Intermediate',
    lessonNumber: 3,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
    tabPreviewText: `E|---5---8--12---|---7--10--14---|
B|---5---8--13---|---6--10--15---|
G|---5---9--12---|---7--10--14---|
D|---------------|---------------|
A|---------------|---------------|
E|---------------|---------------|`,
    tabFileUrl: '/tabs/lesson-03-caged-triads.pdf',
    thumbnail: 'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?auto=format&fit=crop&w=800&q=80',
    durationMinutes: 45,
    instructorNotes: 'Focus on memorizing the root note locations for C, A, G, E, and D shapes across the 6th and 5th strings.',
    createdAt: '2024-02-01',
  },
  {
    id: 'lsn-04',
    title: 'Legato Technique: Smooth Hammer-Ons & Pull-Offs',
    description: 'Develop finger independence, stamina, and fluid speed using 3-note-per-string diatonic legato sequences.',
    level: 'Intermediate',
    lessonNumber: 4,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8230b5a.mp3',
    tabPreviewText: `E|--5h7h8p7p5-----------------------|
B|------------8h10h12p10p8----------|
G|-------------------------7h9h10---|
D|----------------------------------|
A|----------------------------------|
E|----------------------------------|`,
    tabFileUrl: '/tabs/lesson-04-legato-mastery.pdf',
    thumbnail: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80',
    durationMinutes: 38,
    instructorNotes: 'Keep the thumb centered behind the neck. Ensure pull-offs pull slightly downward toward the floor for volume consistency.',
    createdAt: '2024-02-14',
  },
  {
    id: 'lsn-05',
    title: 'Sweep Picking Arpeggios & Neoclassical Speed Riffs',
    description: 'Advanced 5-string and 6-string sweep picking economy motion, muted rest strokes, and tapping add-ons.',
    level: 'Advanced',
    lessonNumber: 5,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
    tabPreviewText: `E|--------12h17p12--------|
B|------13--------13------|
G|----14------------14----|
D|--14----------------14--|
A|-15------------------15-|
E|------------------------|`,
    tabFileUrl: '/tabs/lesson-05-sweep-arpeggios.pdf',
    thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
    durationMinutes: 50,
    instructorNotes: 'Sweep picking is a single continuous fluid push of the pick, NOT individual picks. Control string noise with your palm.',
    createdAt: '2024-03-01',
  },
  {
    id: 'lsn-06',
    title: 'Modal Improvisation: Dorian, Aeolian & Mixolydian Phrasing',
    description: 'Deep dive into modal soloing over modal vamps, targeting chord tones, and crafting memorable solos like Ershad Zaman.',
    level: 'Advanced',
    lessonNumber: 6,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8230b5a.mp3',
    tabPreviewText: `E|--12-14-15--14-12----12-----------|
B|------------------15----15-13-12--|
G|----------------------------------|
D|----------------------------------|
A|----------------------------------|
E|----------------------------------|`,
    tabFileUrl: '/tabs/lesson-06-modal-improvisation.pdf',
    thumbnail: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=800&q=80',
    durationMinutes: 55,
    instructorNotes: 'Notice how the major 6th in Dorian creates a distinctive bright jazz-fusion flavor against minor 7th chords.',
    createdAt: '2024-03-15',
  },
];

export const MOCK_LESSON_ACCESS: LessonAccess[] = [
  // Tariq Hasan (Intermediate student)
  { studentId: 'usr-std-01', lessonId: 'lsn-01', isUnlocked: true, unlockedAt: '2024-02-15' },
  { studentId: 'usr-std-01', lessonId: 'lsn-02', isUnlocked: true, unlockedAt: '2024-02-20' },
  { studentId: 'usr-std-01', lessonId: 'lsn-03', isUnlocked: true, unlockedAt: '2024-03-01' },
  { studentId: 'usr-std-01', lessonId: 'lsn-04', isUnlocked: true, unlockedAt: '2024-03-10' },
  { studentId: 'usr-std-01', lessonId: 'lsn-05', isUnlocked: false },
  { studentId: 'usr-std-01', lessonId: 'lsn-06', isUnlocked: false },

  // Nusrat Jahan (Beginner student)
  { studentId: 'usr-std-02', lessonId: 'lsn-01', isUnlocked: true, unlockedAt: '2024-03-01' },
  { studentId: 'usr-std-02', lessonId: 'lsn-02', isUnlocked: true, unlockedAt: '2024-03-15' },
  { studentId: 'usr-std-02', lessonId: 'lsn-03', isUnlocked: false },
  { studentId: 'usr-std-02', lessonId: 'lsn-04', isUnlocked: false },
  { studentId: 'usr-std-02', lessonId: 'lsn-05', isUnlocked: false },
  { studentId: 'usr-std-02', lessonId: 'lsn-06', isUnlocked: false },

  // Tanvir Ahmed (Advanced student - all unlocked)
  { studentId: 'usr-std-03', lessonId: 'lsn-01', isUnlocked: true },
  { studentId: 'usr-std-03', lessonId: 'lsn-02', isUnlocked: true },
  { studentId: 'usr-std-03', lessonId: 'lsn-03', isUnlocked: true },
  { studentId: 'usr-std-03', lessonId: 'lsn-04', isUnlocked: true },
  { studentId: 'usr-std-03', lessonId: 'lsn-05', isUnlocked: true },
  { studentId: 'usr-std-03', lessonId: 'lsn-06', isUnlocked: true },
];

export const MOCK_LESSON_PROGRESS: UserLessonProgress[] = [
  { studentId: 'usr-std-01', lessonId: 'lsn-01', status: 'Completed', completedAt: '2024-02-18' },
  { studentId: 'usr-std-01', lessonId: 'lsn-02', status: 'Completed', completedAt: '2024-02-28' },
  { studentId: 'usr-std-01', lessonId: 'lsn-03', status: 'In Progress', lastAccessed: '2024-04-01' },
  { studentId: 'usr-std-01', lessonId: 'lsn-04', status: 'Unlocked' },
  { studentId: 'usr-std-01', lessonId: 'lsn-05', status: 'Locked' },
  { studentId: 'usr-std-01', lessonId: 'lsn-06', status: 'Locked' },
];

export const MOCK_ATTENDANCE: Attendance[] = [
  { id: 'att-01', studentId: 'usr-std-01', studentName: 'Tariq Hasan', date: '2024-04-05', status: 'Present', notes: 'Excellent technique on alternate picking exercises.' },
  { id: 'att-02', studentId: 'usr-std-01', studentName: 'Tariq Hasan', date: '2024-03-29', status: 'Present', notes: 'Worked on minor pentatonic bends.' },
  { id: 'att-03', studentId: 'usr-std-01', studentName: 'Tariq Hasan', date: '2024-03-22', status: 'Late', notes: '15 mins late due to traffic. Completed CAGED shapes.' },
  { id: 'att-04', studentId: 'usr-std-01', studentName: 'Tariq Hasan', date: '2024-03-15', status: 'Present' },
  { id: 'att-05', studentId: 'usr-std-01', studentName: 'Tariq Hasan', date: '2024-03-08', status: 'Excused', notes: 'Prior medical appointment notified in advance.' },
  { id: 'att-06', studentId: 'usr-std-02', studentName: 'Nusrat Jahan', date: '2024-04-05', status: 'Present', notes: 'Improving thumb posture.' },
  { id: 'att-07', studentId: 'usr-std-02', studentName: 'Nusrat Jahan', date: '2024-03-29', status: 'Absent', notes: 'No call received.' },
  { id: 'att-08', studentId: 'usr-std-03', studentName: 'Tanvir Ahmed', date: '2024-04-05', status: 'Present', notes: 'Mastered sweep picking at 140 BPM.' },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prd-01',
    name: 'Ershad Zaman Signature Heavy Picks (Pack of 12)',
    description: 'Precision 1.5mm Dunlop Delrin guitar picks featuring gold foil Guitart logo embossing. Custom edge bevel for lightning speed picking.',
    price: 650,
    images: ['https://images.unsplash.com/photo-1550985616-10810253b84d?auto=format&fit=crop&w=600&q=80'],
    stock: 45,
    category: 'Accessories',
    isActive: true,
  },
  {
    id: 'prd-02',
    name: 'Guitart Premium Vintage Leather Strap',
    description: 'Handcrafted full-grain genuine leather strap with soft padded backing. Adjustable length (42"-58") with reinforced strap pin holes.',
    price: 2450,
    images: ['https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?auto=format&fit=crop&w=600&q=80'],
    stock: 18,
    category: 'Accessories',
    isActive: true,
  },
  {
    id: 'prd-03',
    name: 'Guitart Academy Embroidered Heavyweight Hoodie',
    description: 'Ultra-soft 380 GSM fleece hoodie in Obsidian Black with subtle golden Guitart chest crest and sleeve fretboard graphic.',
    price: 3200,
    images: ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80'],
    stock: 24,
    category: 'Apparel',
    isActive: true,
  },
  {
    id: 'prd-04',
    name: 'Fingerstyle & Lead Guitar Masterclass Workbook (Hardcover)',
    description: 'Comprehensive 180-page spiral-bound notation & TAB workbook written personally by Ershad Zaman. Includes scale maps, solo transcriptions & exercises.',
    price: 1850,
    images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'],
    stock: 30,
    category: 'Learning Material',
    isActive: true,
  },
  {
    id: 'prd-05',
    name: 'Guitart Oxygen-Free Copper Instrument Cable (10ft / 3m)',
    description: 'Low-capacitance braided guitar instrument cable with gold-plated Neutrik 1/4" connectors for pure signal transparency.',
    price: 1600,
    images: ['https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80'],
    stock: 12,
    category: 'Accessories',
    isActive: true,
  },
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-2024-8841',
    studentId: 'usr-std-01',
    customerName: 'Tariq Hasan',
    customerMobile: '+880 1819-123456',
    customerEmail: 'tariq.hasan@gmail.com',
    deliveryAddress: 'House 42, Road 11, Block D, Banani, Dhaka',
    deliveryMethod: 'Inside Dhaka (৳80)',
    deliveryCharge: 80,
    items: [
      { product: MOCK_PRODUCTS[0], quantity: 2 },
      { product: MOCK_PRODUCTS[3], quantity: 1 },
    ],
    subtotal: 3150,
    totalAmount: 3230,
    paymentMethod: 'bKash',
    bKashTransactionId: 'BK9X7721A0',
    bKashSenderMobile: '01819123456',
    paymentStatus: 'Pending',
    orderStatus: 'Pending',
    createdAt: '2024-04-06 14:30',
    notes: 'Please verify bKash payment.',
  },
  {
    id: 'ORD-2024-8790',
    studentId: 'usr-std-02',
    customerName: 'Nusrat Jahan',
    customerMobile: '+880 1712-987654',
    customerEmail: 'nusrat.jahan@yahoo.com',
    deliveryAddress: 'Flat 4B, Green Road, Dhanmondi, Dhaka',
    deliveryMethod: 'Inside Dhaka (৳80)',
    deliveryCharge: 80,
    items: [
      { product: MOCK_PRODUCTS[1], quantity: 1 },
    ],
    subtotal: 2450,
    totalAmount: 2530,
    paymentMethod: 'bKash',
    bKashTransactionId: 'BK8Y9912C3',
    bKashSenderMobile: '01712987654',
    paymentStatus: 'Verified',
    orderStatus: 'Processing',
    createdAt: '2024-04-02 11:15',
  },
  {
    id: 'ORD-2024-8622',
    studentId: 'usr-std-03',
    customerName: 'Tanvir Ahmed',
    customerMobile: '+880 1911-456789',
    customerEmail: 'tanvir.ahmed@outlook.com',
    deliveryAddress: 'Sector 4, Road 7, Uttara, Dhaka',
    deliveryMethod: 'Inside Dhaka (৳80)',
    deliveryCharge: 80,
    items: [
      { product: MOCK_PRODUCTS[2], quantity: 1 },
      { product: MOCK_PRODUCTS[0], quantity: 1 },
    ],
    subtotal: 3850,
    totalAmount: 3930,
    paymentMethod: 'Cash on Delivery',
    paymentStatus: 'Pending',
    orderStatus: 'Delivered',
    createdAt: '2024-03-25 18:40',
  },
];

export const MOCK_CMS_SECTIONS: HomepageSection[] = [
  {
    id: 'sec-hero',
    title: 'Master the Art of Guitar with Ershad Zaman',
    subtitle: 'Structured video lessons, custom tab notation, and one-on-one mentorship tailored for acoustic & electric guitarists.',
    content: 'Elevate your musicality from foundational picking mechanics to virtuosic lead guitar solos.',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1600&q=80',
    buttonText: 'Explore Curriculum',
    buttonLink: '#curriculum',
    enabled: true,
    order: 1,
  },
  {
    id: 'sec-about',
    title: 'The Guitart Philosophy',
    subtitle: 'Music is not just memorizing scale shapes — it is tone, touch, & timing.',
    content: 'Guitart was founded by Ershad Zaman to bridge the gap between mechanical technique and emotional guitar expression. Our curriculum builds rhythm precision, fingerboard visualization, and improvisational mastery.',
    imageUrl: 'https://images.unsplash.com/photo-1525201548942-d8732f6617a0?auto=format&fit=crop&w=1000&q=80',
    enabled: true,
    order: 2,
  },
  {
    id: 'sec-instructor',
    title: 'Meet Your Mentor — Ershad Zaman',
    subtitle: 'Iconic Bangladeshi guitarist, composer, & lead mentor.',
    content: 'With over two decades of studio recording, concert tours, and masterclass instruction, Ershad Zaman brings a deep passion for unlocking every student\'s unique guitar voice.',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    buttonText: 'View Student Testimonials',
    buttonLink: '#testimonials',
    enabled: true,
    order: 3,
  },
  {
    id: 'sec-process',
    title: 'The 4-Step Learning Roadmap',
    subtitle: 'Proven pedagogical path from absolute beginner to stage performer.',
    content: '1. Foundation & Picking Mechanics -> 2. Scales, CAGED & Rhythm -> 3. Expressive Soloing & Phrasing -> 4. Advanced Virtuosity & Composition.',
    enabled: true,
    order: 4,
  },
  {
    id: 'sec-featured',
    title: 'Featured Academy Lessons',
    subtitle: 'Hand-crafted modules designed with video breakdowns, audio backings, & downloadable tabs.',
    content: 'Explore sample lessons across Beginner, Intermediate, and Advanced tiers.',
    enabled: true,
    order: 5,
  },
  {
    id: 'sec-why',
    title: 'Why Study at Guitart Academy?',
    subtitle: 'The ultimate modern guitar learning environment.',
    content: 'Direct instructor feedback, downloadable PDF tabs, high-definition video walkthroughs, and official merchandise.',
    enabled: true,
    order: 6,
  },
  {
    id: 'sec-testimonials',
    title: 'What Our Students Say',
    subtitle: 'Real stories from passionate guitarists across Bangladesh and beyond.',
    content: 'Over 500+ guitarists have unlocked their potential with Guitart.',
    enabled: true,
    order: 7,
  },
  {
    id: 'sec-merch',
    title: 'Official Guitart Gear & Gear',
    subtitle: 'Signature picks, leather straps, apparel, and masterclass workbooks.',
    content: 'Gear crafted for passionate guitarists.',
    buttonText: 'Shop Merchandise',
    buttonLink: '/student/merchandise',
    enabled: true,
    order: 8,
  },
  {
    id: 'sec-cta',
    title: 'Ready to Transform Your Guitar Playing?',
    subtitle: 'Enroll today and get instant access to your unlocked lessons & student portal.',
    content: 'Join Ershad Zaman\'s Guitart Academy.',
    buttonText: 'Join Academy Now',
    buttonLink: '/signup',
    enabled: true,
    order: 9,
  },
];

export const DEFAULT_DELIVERY_FEES: DeliveryFees = {
  insideDhaka: 80,
  outsideDhaka: 150,
};

export const MOCK_COUPONS: Coupon[] = [
  {
    id: 'cpn-01',
    code: 'GUITART10',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 500,
    maxDiscount: 500,
    isActive: true,
    description: '10% off on all official Guitart accessories & apparel',
    usageCount: 14,
    createdAt: '2024-03-01',
  },
  {
    id: 'cpn-02',
    code: 'ERSHAD200',
    discountType: 'fixed',
    discountValue: 200,
    minOrderAmount: 1000,
    isActive: true,
    description: '৳200 flat discount on masterclass guitar gear orders',
    usageCount: 8,
    createdAt: '2024-03-10',
  },
  {
    id: 'cpn-03',
    code: 'FESTIVE15',
    discountType: 'percentage',
    discountValue: 15,
    minOrderAmount: 1200,
    maxDiscount: 750,
    isActive: true,
    description: '15% festive academy discount for registered students',
    usageCount: 5,
    createdAt: '2024-03-15',
  },
];

export const DEFAULT_NOTICE_BOARD: NoticeBoard = {
  isActive: true,
  title: '🎸 New Live Masterclass with Ershad Zaman!',
  message: 'Ershad Zaman has scheduled a special interactive Q&A and phrasing masterclass this Friday at 8:00 PM. Check your unlocked lessons catalog to review backing tracks beforehand!',
  type: 'announcement',
  updatedAt: '2024-03-20T10:00:00.000Z',
};

export const DEFAULT_LEGAL_POLICIES: import('./types').LegalPolicies = {
  privacyPolicy: {
    title: 'Privacy Policy',
    subtitle: 'How Guitart protects your personal learning data, account credentials, & privacy.',
    lastUpdated: 'March 2026',
    content: `### 1. Academy Privacy Commitment
At **Guitart (Ershad Zaman Guitar Academy)**, we respect and safeguard the privacy of every student, guitarist, and website visitor. This policy explains what information we collect, how it is utilized for your musical education, and your confidentiality rights.

### 2. Information We Collect
When you register for an academy student account or order merchandise, we may collect:
- **Personal Identification**: Full name, contact email address, mobile phone number, and date of birth.
- **Musical Skill Level**: Selected guitar proficiency (Beginner, Intermediate, Advanced) to customize your curriculum roadmap.
- **Academic Progress Data**: Practice log timestamps, lesson completion statuses, attendance records, and teacher feedback.
- **Order & Transaction Data**: Shipping addresses, selected delivery zones, applied coupon codes, and bKash transaction identifiers. We do **not** store raw credit/debit card numbers.

### 3. How We Use Your Data
- To authenticate your student login and provide access to unlocked masterclasses and interactive tabs.
- To process and ship official Guitart merchandise and apparel to your doorstep.
- To notify you regarding upcoming live Q&A sessions, module unlock approvals, and academy announcements.
- To maintain security and prevent unauthorized account sharing.

### 4. 10-Day Session Retention & Cookies
When you enable **"Remember Me on this device"** during login, Guitart stores an encrypted authentication token in your browser for 10 days. If the device remains inactive for more than 10 days, the session automatically expires for your security.

### 5. Third-Party Integrations
We partner with trusted service providers strictly to power our platform:
- **Firebase Authentication & Cloud**: Secure Google OAuth and email verification services.
- **Cloudinary CDN**: High-definition video streaming, audio playback proxying, and tab assets.
- **MongoDB Atlas**: Encrypted database infrastructure.

### 6. Your Data Rights
You may update your profile information at any time from your student portal. To request full account deletion or data export, contact our administrative team at **support@guitart.com**.`,
  },
  termsOfService: {
    title: 'Terms of Service',
    subtitle: 'Student enrollment agreements, curriculum copyright, & academy code of conduct.',
    lastUpdated: 'March 2026',
    content: `### 1. Acceptance of Terms
By accessing **Guitart**, registering as a student, or purchasing masterclass merchandise, you agree to comply with and be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use our services.

### 2. Student Enrollment & Account Verification
- Registration requires valid personal details including full legal name, active mobile number, and email address.
- All new student registrations undergo administrative review by academy instructors.
- Accounts with **"Pending"** status will gain access to curriculum modules once enrollment verification is completed by the administration.
- You are responsible for maintaining the confidentiality of your account credentials. Account sharing or credential distribution is strictly prohibited.

### 3. Intellectual Property & Copyright
All educational video lectures, multi-angle guitar masterclasses, custom TAB notation files, studio backing tracks, and learning roadmaps hosted on Guitart are the exclusive intellectual property of **Ershad Zaman** and **Guitart Academy**.
- Content is licensed strictly for personal, non-commercial guitar practice by the registered student.
- Downloading, screen recording, republishing, re-distributing, or broadcasting any lesson materials without prior written consent is a direct copyright violation and will result in immediate termination without refund.

### 4. Merchandise Orders & Deliveries
- Merchandise prices are listed in Bangladeshi Taka (৳ BDT) and include applicable platform charges.
- Standard delivery timelines: **24–48 Hours** for Inside Dhaka and **2–4 Business Days** for Outside Dhaka.
- Defective or damaged merchandise items are eligible for free replacement within **7 days** of delivery.

### 5. Code of Conduct & Academic Integrity
Students are expected to maintain respectful behavior within academy forums, live masterclasses, and instructor Q&A sessions. Harassment, disruptive conduct, or academic dishonesty will lead to immediate account suspension.`,
  },
  bkashFaq: {
    title: 'bKash Payment FAQ',
    subtitle: 'Step-by-step guidance for course enrollment payments, gear purchases, & TrxID verification.',
    lastUpdated: 'March 2026',
    content: `### 1. How do I pay using bKash?
Paying for your Guitart merchandise or academy enrollment is simple and fast:
1. Open your **bKash App** on your smartphone.
2. Select **"Send Money"** (or Payment if using a merchant QR code).
3. Enter our official Academy Number: **01711-000000** (Personal / Merchant).
4. Enter the exact **Total Payable Amount** shown at checkout.
5. In the reference field, you can write your **Name** or **Order ID**.
6. Enter your bKash PIN and tap & hold to complete the transaction.
7. Copy the **Transaction ID (TrxID)** (e.g. \`9J28DA10K\`) and paste it into the TrxID field on the Guitart checkout screen.

### 2. How long does bKash verification take?
- Once you submit your order with the TrxID, our billing department verifies the transaction against our live merchant ledger.
- Verification is typically completed within **15 to 30 minutes** during normal academy hours (9:00 AM – 10:00 PM BST).
- You can check your order status under **My Orders** in the student portal.

### 3. What if I entered the wrong TrxID or made a typo?
Don't worry! If you accidentally entered an incorrect TrxID or sender phone number:
- Reach out to our billing support immediately via WhatsApp/Phone at **+880 1711-000000** or email **support@guitart.com**.
- Provide your Order ID, student email, and the correct screenshot of your bKash transaction.
- Our admin team will manually match and update your payment status to **Verified**.

### 4. Are delivery fees included in the bKash payment?
Yes! Our dynamic checkout automatically calculates the delivery charge:
- **Inside Dhaka**: ৳80 delivery charge.
- **Outside Dhaka**: ৳150 nationwide delivery charge.
- The total amount shown on the checkout screen is the exact final amount you need to send via bKash.

### 5. What is the refund policy for bKash payments?
- If an ordered merchandise item is out of stock, a 100% full refund is issued back to your bKash account within **24 hours**.
- Course fee adjustments and cancellation inquiries can be submitted directly to our administrative office.`,
  },
};

export const DEFAULT_SOCIAL_LINKS: import('./types').SocialMediaLink[] = [
  { id: 'soc-1', platform: 'youtube', label: 'YouTube Channel', url: 'https://youtube.com/@ershadzaman', isEnabled: true },
  { id: 'soc-2', platform: 'facebook', label: 'Facebook Page', url: 'https://facebook.com/guitart.academy', isEnabled: true },
  { id: 'soc-3', platform: 'instagram', label: 'Instagram Profile', url: 'https://instagram.com/guitart_academy', isEnabled: true },
  { id: 'soc-4', platform: 'spotify', label: 'Spotify Artist', url: 'https://open.spotify.com/artist/ershadzaman', isEnabled: false },
  { id: 'soc-5', platform: 'whatsapp', label: 'WhatsApp Helpline', url: 'https://wa.me/8801711000000', isEnabled: false },
  { id: 'soc-6', platform: 'tiktok', label: 'TikTok Channel', url: '', isEnabled: false },
  { id: 'soc-7', platform: 'soundcloud', label: 'SoundCloud Jams', url: '', isEnabled: false },
  { id: 'soc-8', platform: 'twitter', label: 'X (Twitter)', url: '', isEnabled: false },
];

export const MOCK_REVIEWS: import('./types').StudentReview[] = [
  {
    id: 'rev-01',
    studentId: 'usr-std-01',
    studentEmail: 'tariq.hasan@gmail.com',
    name: 'Tariq Hasan',
    level: 'Intermediate Student',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    comment: 'Ershad Zaman’s alternate picking module changed my playing completely within 3 weeks. The custom PDF tabs are so clean and easy to follow.',
    rating: 5,
    status: 'Approved',
    createdAt: '2026-08-20T10:00:00Z',
  },
  {
    id: 'rev-02',
    studentId: 'usr-std-02',
    studentEmail: 'nusrat.jahan@yahoo.com',
    name: 'Nusrat Jahan',
    level: 'Beginner Student',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
    comment: 'As a beginner, I was afraid of string noise and finger pain. Guitart’s hand synchronization lesson taught me wrist relaxation. Highly recommended!',
    rating: 5,
    status: 'Approved',
    createdAt: '2026-08-22T14:30:00Z',
  },
  {
    id: 'rev-03',
    studentId: 'usr-std-03',
    studentEmail: 'tanvir.ahmed@outlook.com',
    name: 'Tanvir Ahmed',
    level: 'Advanced Soloist',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    comment: 'The 5-string sweep arpeggio breakdown in Level 3 gave me the speed and clarity I needed for recording lead tracks with my band in Dhaka.',
    rating: 5,
    status: 'Approved',
    createdAt: '2026-08-25T09:15:00Z',
  },
  {
    id: 'rev-04',
    studentId: 'usr-std-04',
    studentEmail: 'ayanpaul246@gmail.com',
    name: 'Ayan Paul',
    level: 'Beginner Student',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=600&q=80',
    comment: 'Learning chord melody and pentatonic shifting from Ershad bhai has been a dream come true. The academy dashboard makes tracking progress seamless!',
    rating: 5,
    status: 'Approved',
    createdAt: '2026-08-26T16:45:00Z',
  },
  {
    id: 'rev-05',
    studentId: 'usr-std-05',
    studentEmail: 'samiul.islam@gmail.com',
    name: 'Samiul Islam',
    level: 'Intermediate Student',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    comment: 'The tone crafting modules and physical masterclass feedback helped me dial in the perfect overdrive lead tone. Worth every single taka!',
    rating: 5,
    status: 'Approved',
    createdAt: '2026-08-27T11:20:00Z',
  },
];

