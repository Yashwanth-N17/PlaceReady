// Mock data shared across dashboards (frontend-only v1)
// All API endpoints fall back to this data when no real backend responds.

export type Role = "student" | "faculty" | "placement";

export const currentUser = {
  id: "stu-1",
  name: "Aarav Sharma",
  email: "aarav.sharma@college.edu",
  role: "student" as Role,
  rollNo: "CS21B042",
  batch: "CSE 2025",
  branch: "CSE",
  cgpa: 8.4,
};

export const readinessScore = 76;

export const skillsOverTime = [
  { month: "Jan", aptitude: 55, coding: 48, core: 60, soft: 62 },
  { month: "Feb", aptitude: 58, coding: 53, core: 63, soft: 64 },
  { month: "Mar", aptitude: 64, coding: 60, core: 65, soft: 67 },
  { month: "Apr", aptitude: 68, coding: 66, core: 69, soft: 70 },
  { month: "May", aptitude: 72, coding: 71, core: 72, soft: 74 },
  { month: "Jun", aptitude: 78, coding: 76, core: 75, soft: 78 },
];

export const readinessTrend = [
  { month: "Jan", score: 56 },
  { month: "Feb", score: 60 },
  { month: "Mar", score: 64 },
  { month: "Apr", score: 69 },
  { month: "May", score: 73 },
  { month: "Jun", score: 76 },
];

export const skillRadar = [
  { skill: "Aptitude", value: 78, full: 100 },
  { skill: "Coding", value: 76, full: 100 },
  { skill: "Core CS", value: 75, full: 100 },
  { skill: "Soft Skills", value: 78, full: 100 },
  { skill: "Communication", value: 70, full: 100 },
  { skill: "Problem Solving", value: 82, full: 100 },
];

export const weakAreas = [
  { topic: "Dynamic Programming", score: 42, category: "Coding" },
  { topic: "Probability", score: 51, category: "Aptitude" },
  { topic: "Operating Systems", score: 58, category: "Core CS" },
];

// ============= TESTS =============
export type TestStatus = "upcoming" | "completed" | "missed";
export interface ScheduledTest {
  id: string;
  title: string;
  subject: string;
  type: string;
  date: string;        // ISO
  durationMin: number;
  questionsCount: number;
  status: TestStatus;
  scheduledBy?: string;
}

export const scheduledTests: ScheduledTest[] = [
  { id: "t1", title: "TCS NQT Mock", subject: "Aptitude", type: "Aptitude", date: "2026-04-22T10:00:00", durationMin: 120, questionsCount: 60, status: "upcoming", scheduledBy: "Prof. Iyer" },
  { id: "t2", title: "DSA Sprint", subject: "Data Structures", type: "Coding", date: "2026-04-25T14:00:00", durationMin: 90, questionsCount: 25, status: "upcoming", scheduledBy: "Prof. Kapoor" },
  { id: "t3", title: "HR Interview Sim", subject: "Soft Skills", type: "Soft Skills", date: "2026-04-29T11:00:00", durationMin: 30, questionsCount: 15, status: "upcoming", scheduledBy: "Prof. Rao" },
  { id: "t4", title: "OS Concepts", subject: "Operating Systems", type: "Core CS", date: "2026-05-02T09:30:00", durationMin: 60, questionsCount: 30, status: "upcoming", scheduledBy: "Prof. Iyer" },
  { id: "t5", title: "Infosys Mock", subject: "Aptitude", type: "Aptitude", date: "2026-04-12T10:00:00", durationMin: 90, questionsCount: 50, status: "completed" },
  { id: "t6", title: "Wipro Aptitude", subject: "Aptitude", type: "Aptitude", date: "2026-04-08T10:00:00", durationMin: 60, questionsCount: 40, status: "completed" },
  { id: "t7", title: "DSA Weekly", subject: "Data Structures", type: "Coding", date: "2026-04-03T10:00:00", durationMin: 75, questionsCount: 20, status: "completed" },
];

export const recentResults = [
  { id: "t5", title: "Infosys Mock", subject: "Aptitude", date: "Apr 12", score: 82, percentile: 88, timeTakenMin: 78, correct: 41, total: 50, status: "Excellent" },
  { id: "t6", title: "Wipro Aptitude", subject: "Aptitude", date: "Apr 08", score: 71, percentile: 72, timeTakenMin: 55, correct: 28, total: 40, status: "Good" },
  { id: "t7", title: "DSA Weekly", subject: "Coding", date: "Apr 03", score: 58, percentile: 51, timeTakenMin: 70, correct: 12, total: 20, status: "Improve" },
  { id: "t8", title: "Soft Skills Quiz", subject: "Soft Skills", date: "Mar 28", score: 88, percentile: 92, timeTakenMin: 22, correct: 13, total: 15, status: "Excellent" },
];

// ============= MOCK QUIZ QUESTIONS =============
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topic: string;
}

export const sampleQuiz: QuizQuestion[] = [
  {
    id: "q1",
    question: "What is the time complexity of binary search on a sorted array of n elements?",
    options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
    correctIndex: 1,
    explanation: "Binary search halves the search space at each step, giving O(log n).",
    topic: "Algorithms",
  },
  {
    id: "q2",
    question: "Which data structure uses LIFO ordering?",
    options: ["Queue", "Stack", "Linked List", "Heap"],
    correctIndex: 1,
    explanation: "A Stack uses Last-In-First-Out order.",
    topic: "Data Structures",
  },
  {
    id: "q3",
    question: "If A = 5, B = 10, what is A << 1 + B?",
    options: ["20", "25", "15", "30"],
    correctIndex: 0,
    explanation: "A << 1 = 10. 10 + B (10) = 20. (Operator precedence: + before <<.)",
    topic: "Bit Manipulation",
  },
  {
    id: "q4",
    question: "Which of these is NOT a process scheduling algorithm?",
    options: ["FCFS", "Round Robin", "Banker's", "SJF"],
    correctIndex: 2,
    explanation: "Banker's algorithm is for deadlock avoidance, not scheduling.",
    topic: "Operating Systems",
  },
  {
    id: "q5",
    question: "Normalization in DBMS is used to:",
    options: ["Increase redundancy", "Reduce redundancy", "Encrypt data", "Compress data"],
    correctIndex: 1,
    explanation: "Normalization decomposes tables to reduce redundancy and improve integrity.",
    topic: "DBMS",
  },
  {
    id: "q6",
    question: "What does HTTP stand for?",
    options: ["HyperText Transfer Protocol", "Hyper Tool Transfer Protocol", "High Transfer Text Protocol", "None"],
    correctIndex: 0,
    explanation: "HTTP = HyperText Transfer Protocol.",
    topic: "Networking",
  },
  {
    id: "q7",
    question: "If 4 men can do a job in 6 days, how many days will 6 men take?",
    options: ["3", "4", "5", "9"],
    correctIndex: 1,
    explanation: "Work = 24 man-days. 24 / 6 = 4 days.",
    topic: "Aptitude",
  },
  {
    id: "q8",
    question: "Probability of getting a head when a fair coin is tossed once?",
    options: ["1", "0.5", "0.25", "0.75"],
    correctIndex: 1,
    explanation: "Single fair coin toss: P(head) = 1/2.",
    topic: "Probability",
  },
  {
    id: "q9",
    question: "Find the next number: 2, 6, 12, 20, 30, ?",
    options: ["38", "40", "42", "44"],
    correctIndex: 2,
    explanation: "Differences are 4,6,8,10,12. So 30+12 = 42.",
    topic: "Series",
  },
  {
    id: "q10",
    question: "Which sorting algorithm has the worst-case O(n²) but best-case O(n)?",
    options: ["Merge sort", "Insertion sort", "Heap sort", "Quick sort"],
    correctIndex: 1,
    explanation: "Insertion sort runs O(n) on already-sorted input.",
    topic: "Algorithms",
  },
];

// ============= TRAINING =============
export interface TrainingModule {
  id: string;
  title: string;
  category: "Coding" | "Aptitude" | "Core CS" | "Soft Skills";
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedMin: number;
  progress: number;     // 0-100
  recommended: boolean;
  reason?: string;
  hasMockTest?: boolean;
}

export const trainingModules: TrainingModule[] = [
  { id: "m1", title: "Mastering Dynamic Programming", category: "Coding", difficulty: "Advanced", estimatedMin: 240, progress: 30, recommended: true, reason: "Weak in DP", hasMockTest: true },
  { id: "m2", title: "Probability & Combinatorics", category: "Aptitude", difficulty: "Intermediate", estimatedMin: 120, progress: 0, recommended: true, reason: "Score 51%", hasMockTest: true },
  { id: "m3", title: "Operating Systems Deep Dive", category: "Core CS", difficulty: "Intermediate", estimatedMin: 180, progress: 45, recommended: true, reason: "Score 58%", hasMockTest: true },
  { id: "m4", title: "Group Discussion Essentials", category: "Soft Skills", difficulty: "Beginner", estimatedMin: 60, progress: 100, recommended: false, hasMockTest: false },
  { id: "m5", title: "Graph Algorithms 101", category: "Coding", difficulty: "Intermediate", estimatedMin: 180, progress: 60, recommended: false, hasMockTest: true },
  { id: "m6", title: "DBMS Joins & Indexing", category: "Core CS", difficulty: "Intermediate", estimatedMin: 120, progress: 20, recommended: false, hasMockTest: true },
  { id: "m7", title: "Quant: Time, Speed, Distance", category: "Aptitude", difficulty: "Beginner", estimatedMin: 90, progress: 75, recommended: false, hasMockTest: true },
  { id: "m8", title: "HR Interview Mastery", category: "Soft Skills", difficulty: "Intermediate", estimatedMin: 75, progress: 0, recommended: false, hasMockTest: false },
];

// ============= FACULTY / STUDENTS =============
export const batchPerformance = [
  { batch: "CSE-A", apt: 74, code: 70, core: 72, soft: 76 },
  { batch: "CSE-B", apt: 68, code: 66, core: 70, soft: 72 },
  { batch: "ECE-A", apt: 71, code: 60, core: 74, soft: 70 },
  { batch: "ECE-B", apt: 65, code: 58, core: 69, soft: 68 },
  { batch: "MECH", apt: 60, code: 50, core: 72, soft: 65 },
];

export interface StudentRecord {
  id: string;
  name: string;
  roll: string;
  email: string;
  branch: string;
  batch: string;
  cgpa: number;
  aptitude: number;
  coding: number;
  core: number;
  soft: number;
  readiness: number;
  weak: string;
  active: string;
  mentorId?: string;
  subjects: string[];
}

export const students: StudentRecord[] = [
  { id: "stu-1", name: "Aarav Sharma", roll: "CS21B042", email: "aarav@college.edu", branch: "CSE", batch: "CSE-A", cgpa: 8.4, aptitude: 78, coding: 76, core: 75, soft: 78, readiness: 76, weak: "DP, Probability", active: "2h ago", mentorId: "fac-1", subjects: ["DSA", "OS", "Aptitude"] },
  { id: "stu-2", name: "Diya Patel", roll: "CS21B017", email: "diya@college.edu", branch: "CSE", batch: "CSE-A", cgpa: 9.1, aptitude: 92, coding: 90, core: 89, soft: 93, readiness: 91, weak: "—", active: "1h ago", mentorId: "fac-1", subjects: ["DSA", "DBMS"] },
  { id: "stu-3", name: "Ishaan Kumar", roll: "CS21B055", email: "ishaan@college.edu", branch: "CSE", batch: "CSE-A", cgpa: 7.2, aptitude: 65, coding: 58, core: 60, soft: 70, readiness: 64, weak: "OS, Networks", active: "5h ago", mentorId: "fac-2", subjects: ["OS", "Networks"] },
  { id: "stu-4", name: "Saanvi Reddy", roll: "CS21B029", email: "saanvi@college.edu", branch: "CSE", batch: "CSE-A", cgpa: 8.0, aptitude: 78, coding: 75, core: 76, soft: 80, readiness: 77, weak: "Graphs", active: "30m ago", mentorId: "fac-1", subjects: ["DSA"] },
  { id: "stu-5", name: "Vihaan Mehta", roll: "CS21B061", email: "vihaan@college.edu", branch: "CSE", batch: "CSE-B", cgpa: 6.8, aptitude: 52, coding: 48, core: 55, soft: 60, readiness: 53, weak: "DBMS, DSA", active: "1d ago", mentorId: "fac-2", subjects: ["DBMS", "DSA"] },
  { id: "stu-6", name: "Anaya Singh", roll: "CS21B008", email: "anaya@college.edu", branch: "CSE", batch: "CSE-B", cgpa: 8.7, aptitude: 86, coding: 84, core: 88, soft: 85, readiness: 86, weak: "Communication", active: "3h ago", mentorId: "fac-2", subjects: ["DSA", "Soft Skills"] },
  { id: "stu-7", name: "Kabir Joshi", roll: "EC21B074", email: "kabir@college.edu", branch: "ECE", batch: "ECE-A", cgpa: 7.5, aptitude: 70, coding: 64, core: 72, soft: 70, readiness: 69, weak: "Aptitude", active: "6h ago", mentorId: "fac-3", subjects: ["Aptitude", "Networks"] },
  { id: "stu-8", name: "Myra Nair", roll: "CS21B011", email: "myra@college.edu", branch: "CSE", batch: "CSE-A", cgpa: 8.2, aptitude: 80, coding: 78, core: 76, soft: 82, readiness: 79, weak: "OS", active: "12h ago", mentorId: "fac-1", subjects: ["OS"] },
  { id: "stu-9", name: "Arjun Verma", roll: "CS21B033", email: "arjun@college.edu", branch: "CSE", batch: "CSE-B", cgpa: 7.9, aptitude: 74, coding: 72, core: 70, soft: 75, readiness: 73, weak: "DBMS", active: "4h ago", mentorId: "fac-2", subjects: ["DBMS"] },
  { id: "stu-10", name: "Riya Gupta", roll: "EC21B019", email: "riya@college.edu", branch: "ECE", batch: "ECE-A", cgpa: 8.6, aptitude: 84, coding: 70, core: 86, soft: 88, readiness: 82, weak: "Coding", active: "1h ago", mentorId: "fac-3", subjects: ["Networks", "Soft Skills"] },
];

export const skillGaps = [
  { area: "Dynamic Programming", percent: 64 },
  { area: "Operating Systems", percent: 52 },
  { area: "Probability", percent: 48 },
  { area: "DBMS Joins", percent: 41 },
  { area: "Soft Skills", percent: 33 },
];

// Heatmap (batch × skill)
export const skillHeatmap = [
  { batch: "CSE-A", DSA: 78, OS: 62, DBMS: 70, Aptitude: 74, Soft: 76 },
  { batch: "CSE-B", DSA: 70, OS: 58, DBMS: 65, Aptitude: 68, Soft: 72 },
  { batch: "ECE-A", DSA: 60, OS: 65, DBMS: 60, Aptitude: 71, Soft: 70 },
  { batch: "ECE-B", DSA: 55, OS: 60, DBMS: 58, Aptitude: 65, Soft: 68 },
  { batch: "MECH",  DSA: 48, OS: 55, DBMS: 50, Aptitude: 60, Soft: 65 },
];

export interface FacultyMember {
  id: string;
  name: string;
  email: string;
  subjects: string[];
  menteeIds: string[];
}

export const faculty: FacultyMember[] = [
  { id: "fac-1", name: "Prof. Anita Iyer", email: "anita.iyer@college.edu", subjects: ["DSA", "OS", "Aptitude"], menteeIds: ["stu-1", "stu-2", "stu-4", "stu-8"] },
  { id: "fac-2", name: "Prof. Rajiv Kapoor", email: "rajiv.kapoor@college.edu", subjects: ["DBMS", "DSA"], menteeIds: ["stu-3", "stu-5", "stu-6", "stu-9"] },
  { id: "fac-3", name: "Prof. Meera Rao", email: "meera.rao@college.edu", subjects: ["Networks", "Soft Skills"], menteeIds: ["stu-7", "stu-10"] },
];

// Currently logged-in faculty (mock)
export const currentFaculty = faculty[0];

// ============= PLACEMENT =============
export const placementHistory = [
  { year: "2021", offers: 245, avg: 8.4 },
  { year: "2022", offers: 312, avg: 9.1 },
  { year: "2023", offers: 388, avg: 10.2 },
  { year: "2024", offers: 421, avg: 11.5 },
  { year: "2025", offers: 467, avg: 12.8 },
];

export interface Company {
  id: string;
  name: string;
  role: string;
  ctc: string;
  minCgpa: number;
  minReadiness: number;
  minApt: number;
  minCode: number;
  branches: string[];
  requiredSkills: string[];
}

export const companies: Company[] = [
  { id: "co-1", name: "Google",        role: "SDE-1",   ctc: "₹42 LPA", minCgpa: 8.5, minReadiness: 85, minApt: 80, minCode: 85, branches: ["CSE", "ECE"], requiredSkills: ["DSA", "System Design"] },
  { id: "co-2", name: "Microsoft",     role: "SWE",     ctc: "₹38 LPA", minCgpa: 8.0, minReadiness: 80, minApt: 75, minCode: 80, branches: ["CSE", "ECE"], requiredSkills: ["DSA", "OS"] },
  { id: "co-3", name: "Amazon",        role: "SDE",     ctc: "₹32 LPA", minCgpa: 7.5, minReadiness: 75, minApt: 70, minCode: 75, branches: ["CSE", "ECE"], requiredSkills: ["DSA", "DBMS"] },
  { id: "co-4", name: "Goldman Sachs", role: "Analyst", ctc: "₹28 LPA", minCgpa: 8.0, minReadiness: 78, minApt: 85, minCode: 65, branches: ["CSE", "ECE", "MECH"], requiredSkills: ["Aptitude", "Quant"] },
  { id: "co-5", name: "Infosys",       role: "SE",      ctc: "₹6.5 LPA",minCgpa: 6.5, minReadiness: 60, minApt: 60, minCode: 55, branches: ["CSE", "ECE", "MECH"], requiredSkills: ["DBMS"] },
];

export interface PlacementDrive {
  id: string;
  companyId: string;
  date: string;
  venue: string;
  status: "scheduled" | "in_progress" | "completed";
  applicantIds: string[];
  applicantStatus: Record<string, "applied" | "shortlisted" | "interviewed" | "offered" | "rejected">;
}

export const drives: PlacementDrive[] = [
  {
    id: "dr-1", companyId: "co-2", date: "2026-05-10T09:00:00", venue: "Auditorium A", status: "scheduled",
    applicantIds: ["stu-1", "stu-2", "stu-4", "stu-8"],
    applicantStatus: { "stu-1": "applied", "stu-2": "shortlisted", "stu-4": "applied", "stu-8": "shortlisted" },
  },
  {
    id: "dr-2", companyId: "co-3", date: "2026-05-15T10:00:00", venue: "Lab Block 2", status: "scheduled",
    applicantIds: ["stu-1", "stu-2", "stu-4", "stu-6", "stu-8", "stu-9", "stu-10"],
    applicantStatus: { "stu-1": "shortlisted", "stu-2": "interviewed", "stu-4": "applied", "stu-6": "applied", "stu-8": "shortlisted", "stu-9": "applied", "stu-10": "applied" },
  },
  {
    id: "dr-3", companyId: "co-5", date: "2026-04-20T09:30:00", venue: "Auditorium B", status: "completed",
    applicantIds: ["stu-3", "stu-5", "stu-7", "stu-9"],
    applicantStatus: { "stu-3": "offered", "stu-5": "rejected", "stu-7": "offered", "stu-9": "interviewed" },
  },
];

// ============= NOTIFICATIONS =============
export type NotificationType = "test" | "training" | "drive" | "marks" | "mentor" | "readiness";
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  time: string;
  read: boolean;
  forRole: Role[];
}

export const notifications: Notification[] = [
  { id: "n1", type: "test",      title: "New mock test scheduled",       body: "Prof. Iyer scheduled 'TCS NQT Mock' for Apr 22, 10:00 AM.", time: "10m ago", read: false, forRole: ["student"] },
  { id: "n2", type: "training",  title: "Training module recommended",   body: "Based on your latest results, try 'Mastering Dynamic Programming'.", time: "1h ago", read: false, forRole: ["student"] },
  { id: "n3", type: "drive",     title: "Microsoft drive announced",     body: "Drive on May 10. Eligibility: CGPA ≥ 8.0, Readiness ≥ 80.", time: "3h ago", read: false, forRole: ["student", "placement"] },
  { id: "n4", type: "marks",     title: "Marks uploaded",                body: "Mid-sem marks for OS have been published.", time: "1d ago", read: true, forRole: ["student", "faculty"] },
  { id: "n5", type: "readiness", title: "Readiness score updated",       body: "Your score is now 76 (+4 this week).", time: "2d ago", read: true, forRole: ["student"] },
  { id: "n6", type: "mentor",    title: "Mentor assigned",               body: "Prof. Anita Iyer has been assigned as your mentor.", time: "3d ago", read: true, forRole: ["student"] },
  { id: "n7", type: "test",      title: "20 students enrolled in DSA Sprint", body: "Enrollment is now open in your batch.", time: "2h ago", read: false, forRole: ["faculty"] },
  { id: "n8", type: "drive",     title: "Goldman Sachs requested shortlist",  body: "Generate a shortlist before May 5.", time: "4h ago", read: false, forRole: ["placement"] },
];

// ============= REPORTS =============
export const monthlyReadiness = [
  { month: "Jan", batchA: 56, batchB: 50, ece: 52 },
  { month: "Feb", batchA: 60, batchB: 54, ece: 56 },
  { month: "Mar", batchA: 65, batchB: 58, ece: 60 },
  { month: "Apr", batchA: 70, batchB: 63, ece: 64 },
  { month: "May", batchA: 74, batchB: 68, ece: 68 },
  { month: "Jun", batchA: 78, batchB: 72, ece: 71 },
];

export const yearOverYear = [
  { year: "2022", placementRate: 68, avgCtc: 9.1 },
  { year: "2023", placementRate: 75, avgCtc: 10.2 },
  { year: "2024", placementRate: 82, avgCtc: 11.5 },
  { year: "2025", placementRate: 87, avgCtc: 12.8 },
];

export const adminStats = {
  totalStudents: 2840,
  totalFaculty: 86,
  testsRun: 412,
  uploadJobs: 67,
};
