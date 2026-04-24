export type CourseStatus = "active" | "upcoming" | "completed";

export type Course = {
  id: string;
  code: string;
  name: string;
  semester: string;
  professor: string;
  duration: string;
  tags: string[];
  status: CourseStatus;
  accent: string; // hex for the header gradient
  unreadMessages?: number;
};

export const courses: Course[] = [
  {
    id: "cse-310",
    code: "CSE 310",
    name: "Data Structures & Algorithms",
    semester: "Spring 2026",
    professor: "Prof. Meera Patel",
    duration: "Jan 12 – May 2, 2026",
    tags: ["Core", "Computer Science"],
    status: "active",
    accent: "#8C1D40",
    unreadMessages: 3,
  },
  {
    id: "cse-365",
    code: "CSE 365",
    name: "Introduction to Information Assurance",
    semester: "Spring 2026",
    professor: "Prof. Daniel Rivera",
    duration: "Jan 12 – May 2, 2026",
    tags: ["Security", "Elective"],
    status: "active",
    accent: "#1F2937",
    unreadMessages: 1,
  },
  {
    id: "mat-267",
    code: "MAT 267",
    name: "Calculus for Engineers III",
    semester: "Spring 2026",
    professor: "Prof. Aisha Mohammed",
    duration: "Jan 12 – May 2, 2026",
    tags: ["Math", "Core"],
    status: "active",
    accent: "#334155",
  },
  {
    id: "eng-301",
    code: "ENG 301",
    name: "Writing for the Professions",
    semester: "Spring 2026",
    professor: "Prof. Liam O'Connor",
    duration: "Jan 12 – May 2, 2026",
    tags: ["Humanities"],
    status: "active",
    accent: "#6B21A8",
  },
  {
    id: "cse-360",
    code: "CSE 360",
    name: "Introduction to Software Engineering",
    semester: "Fall 2026",
    professor: "Prof. Kenji Watanabe",
    duration: "Aug 20 – Dec 10, 2026",
    tags: ["Computer Science", "Core"],
    status: "upcoming",
    accent: "#0F766E",
  },
  {
    id: "psy-101",
    code: "PSY 101",
    name: "Introduction to Psychology",
    semester: "Fall 2025",
    professor: "Prof. Elena García",
    duration: "Aug 22 – Dec 12, 2025",
    tags: ["Elective", "General"],
    status: "completed",
    accent: "#475569",
  },
];
