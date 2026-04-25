export type CourseStatus = "active" | "upcoming" | "completed";

export type CourseFileNode = {
  id: string;
  name: string;
  type: "folder" | "file";
  size?: string;           // e.g. "2.4 MB" — files only
  modifiedAt?: string;     // e.g. "Apr 12, 2025" — files only
  url?: string;            // download/view URL — files only
  children?: CourseFileNode[]; // folders only
};

export type Teammate = {
  id: string;
  name: string;
  role: string;         // e.g. "Team Lead", "Member"
  initials: string;     // e.g. "AS"
  avatarColor: string;  // hex color
  online: boolean;
};

export type Milestone = {
  id: string;
  title: string;
  targetDate: string;       // ISO date string e.g. "2026-04-21"
  completed: boolean;
  reminderSet: boolean;
  meetingScheduled: boolean;
};

export type CourseAssignment = {
  id: string;
  title: string;
  dueDate: string;
  status: "due" | "submitted" | "overdue";
  description?: string;
  points?: number;
  submissionType?: string;  // e.g. "File Upload", "Text Entry"
  teammates?: Teammate[];
  milestones?: Milestone[];
};

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
  overview?: string;
  files?: CourseFileNode[];
  assignments?: CourseAssignment[];
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
    overview:
      "This course provides a rigorous introduction to the design and analysis of algorithms and fundamental data structures. Topics include arrays, linked lists, stacks, queues, trees, heaps, hash tables, graphs, sorting algorithms, and dynamic programming. Students will analyze time and space complexity using Big-O notation and implement solutions in C++ and Python. By the end of the semester you will be equipped to tackle technical interviews and reason about the performance of real-world software systems.",
    files: [
      {
        id: "folder-lectures",
        name: "Lectures",
        type: "folder",
        children: [
          {
            id: "file-lec01",
            name: "Lecture 01 — Arrays & Complexity.pdf",
            type: "file",
            size: "1.2 MB",
            modifiedAt: "Jan 14, 2026",
            url: "#",
          },
          {
            id: "file-lec02",
            name: "Lecture 02 — Linked Lists.pdf",
            type: "file",
            size: "980 KB",
            modifiedAt: "Jan 21, 2026",
            url: "#",
          },
          {
            id: "file-lec03",
            name: "Lecture 03 — Trees & Heaps.pptx",
            type: "file",
            size: "3.4 MB",
            modifiedAt: "Feb 4, 2026",
            url: "#",
          },
        ],
      },
      {
        id: "folder-problem-sets",
        name: "Problem Sets",
        type: "folder",
        children: [
          {
            id: "file-ps1",
            name: "Problem Set 1 — Arrays.pdf",
            type: "file",
            size: "420 KB",
            modifiedAt: "Jan 19, 2026",
            url: "#",
          },
          {
            id: "file-ps2",
            name: "Problem Set 2 — Linked Lists.pdf",
            type: "file",
            size: "390 KB",
            modifiedAt: "Jan 26, 2026",
            url: "#",
          },
          {
            id: "file-ps3",
            name: "Problem Set 3 — Sorting.pdf",
            type: "file",
            size: "510 KB",
            modifiedAt: "Feb 9, 2026",
            url: "#",
          },
          {
            id: "file-ps4",
            name: "Problem Set 4 — Binary Trees.pdf",
            type: "file",
            size: "475 KB",
            modifiedAt: "Apr 14, 2026",
            url: "#",
          },
        ],
      },
      {
        id: "folder-resources",
        name: "Resources",
        type: "folder",
        children: [
          {
            id: "file-syllabus",
            name: "Syllabus Spring 2026.pdf",
            type: "file",
            size: "210 KB",
            modifiedAt: "Jan 12, 2026",
            url: "#",
          },
          {
            id: "file-starter",
            name: "starter-code.zip",
            type: "file",
            size: "88 KB",
            modifiedAt: "Jan 12, 2026",
            url: "#",
          },
        ],
      },
    ],
    assignments: [
      {
        id: "cse310-a1",
        title: "Binary Trees — Problem Set 4",
        dueDate: "Due Apr 28, 11:59 PM",
        status: "due",
        description:
          "In this problem set you will implement and analyze binary search trees (BSTs) and AVL trees in C++. You are required to complete the following tasks:\n\n1. **BST Implementation**: Implement a templated BST class supporting `insert`, `search`, `remove`, and `inorder` traversal. Your implementation must handle duplicate keys by ignoring them.\n\n2. **AVL Tree**: Extend your BST to an AVL tree that maintains the height-balance property after every insertion and deletion. Implement left-rotate, right-rotate, left-right rotate, and right-left rotate operations.\n\n3. **Complexity Analysis**: For each operation, provide a written Big-O analysis in the comments of your source file, explaining best-case, average-case, and worst-case time complexity.\n\n4. **Test Suite**: Write a test file `tests.cpp` that exercises all edge cases: inserting into an empty tree, removing the root, removing a node with two children, and verifying AVL balance after a sequence of 20 random insertions.\n\nSubmit a single ZIP archive containing your `.cpp` and `.h` files along with a short `README.md` describing your design decisions.",
        points: 100,
        submissionType: "File Upload",
        teammates: [
          {
            id: "tm-1",
            name: "Aisha Sharma",
            role: "Team Lead",
            initials: "AS",
            avatarColor: "#8C1D40",
            online: true,
          },
          {
            id: "tm-2",
            name: "Marcus Chen",
            role: "Member",
            initials: "MC",
            avatarColor: "#0F766E",
            online: false,
          },
          {
            id: "tm-3",
            name: "Priya Nair",
            role: "Member",
            initials: "PN",
            avatarColor: "#6B21A8",
            online: true,
          },
        ],
        milestones: [],
      },
      {
        id: "cse310-a2",
        title: "Sorting Algorithms — Problem Set 3",
        dueDate: "Submitted Mar 10",
        status: "submitted",
      },
      {
        id: "cse310-a3",
        title: "Linked Lists — Problem Set 2",
        dueDate: "Overdue — Feb 3",
        status: "overdue",
      },
    ],
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
    id: "des-301",
    code: "DES 301",
    name: "Brand Identity & Visual Systems",
    semester: "Spring 2026",
    professor: "Prof. Sofia Reyes",
    duration: "Jan 12 – May 2, 2026",
    tags: ["Design", "Elective"],
    status: "active",
    accent: "#C2410C",
    unreadMessages: 2,
    overview:
      "This course explores the principles and practice of building cohesive brand identities. Students will learn how visual systems — including color, typography, logo design, iconography, and layout — work together to communicate a brand's personality and values. Through a series of hands-on projects, you will develop a complete brand design system from concept to delivery, applying color theory, grid systems, and design thinking methodologies. By the end of the semester you will have a professional-grade brand identity portfolio piece ready for real-world use.",
    files: [
      {
        id: "des-folder-lectures",
        name: "Lectures",
        type: "folder",
        children: [
          {
            id: "des-file-lec01",
            name: "Lecture 01 — What is a Brand.pdf",
            type: "file",
            size: "2.1 MB",
            modifiedAt: "Jan 13, 2026",
            url: "#",
          },
          {
            id: "des-file-lec02",
            name: "Lecture 02 — Color Theory Fundamentals.pdf",
            type: "file",
            size: "4.8 MB",
            modifiedAt: "Jan 20, 2026",
            url: "#",
          },
          {
            id: "des-file-lec03",
            name: "Lecture 03 — Typography & Type Systems.pdf",
            type: "file",
            size: "3.2 MB",
            modifiedAt: "Jan 27, 2026",
            url: "#",
          },
          {
            id: "des-file-lec04",
            name: "Lecture 04 — Logo Design Principles.pptx",
            type: "file",
            size: "6.7 MB",
            modifiedAt: "Feb 3, 2026",
            url: "#",
          },
        ],
      },
      {
        id: "des-folder-resources",
        name: "Resources",
        type: "folder",
        children: [
          {
            id: "des-file-syllabus",
            name: "Syllabus Spring 2026.pdf",
            type: "file",
            size: "310 KB",
            modifiedAt: "Jan 12, 2026",
            url: "#",
          },
          {
            id: "des-file-brand-examples",
            name: "Brand System Examples.pdf",
            type: "file",
            size: "12.4 MB",
            modifiedAt: "Jan 12, 2026",
            url: "#",
          },
          {
            id: "des-file-figma-kit",
            name: "Figma Starter Kit.fig",
            type: "file",
            size: "1.8 MB",
            modifiedAt: "Jan 14, 2026",
            url: "#",
          },
        ],
      },
      {
        id: "des-folder-assignments",
        name: "Assignment Briefs",
        type: "folder",
        children: [
          {
            id: "des-file-a1-brief",
            name: "A1 — Brand Audit Brief.pdf",
            type: "file",
            size: "540 KB",
            modifiedAt: "Jan 19, 2026",
            url: "#",
          },
          {
            id: "des-file-a2-brief",
            name: "A2 — Brand Design System Brief.pdf",
            type: "file",
            size: "620 KB",
            modifiedAt: "Feb 10, 2026",
            url: "#",
          },
        ],
      },
    ],
    assignments: [
      {
        id: "des301-a1",
        title: "Brand Design System",
        dueDate: "Due May 2, 11:59 PM",
        status: "due",
        points: 120,
        submissionType: "File Upload",
        description:
          "In this assignment you will create a comprehensive Brand Design System for a fictional company of your choosing. Your system must be thorough, consistent, and production-ready. The deliverable is a Figma file and a PDF brand guidelines document covering all of the following sections:\n\n**1. Brand Foundation**\nDefine the brand's mission, vision, and core values. Write a one-paragraph brand story that communicates the personality and tone of voice. Identify the target audience and articulate how the visual identity will speak to them.\n\n**2. Color System**\nDevelop a full color palette grounded in color theory. Your palette must include:\n- A primary brand color with rationale (e.g. psychological associations, cultural context)\n- Two to three secondary/accent colors that complement the primary using a defined color harmony (complementary, analogous, triadic, or split-complementary)\n- A neutral scale (at minimum: white, light gray, mid gray, dark gray, black)\n- Semantic colors for UI states: success (green family), warning (amber family), error (red family), and info (blue family)\n- All colors must meet WCAG 2.1 AA contrast requirements when used for text on their intended backgrounds\n- Document each color with its HEX, RGB, HSL, and CMYK values\n\n**3. Typography**\nSelect a type system consisting of at least two typefaces (one for headings, one for body). Define the full type scale:\n- Display / Hero heading\n- H1 through H4\n- Body large, Body regular, Body small\n- Caption and label styles\nFor each style, specify font family, weight, size, line height, letter spacing, and intended use case.\n\n**4. Logo Design**\nDesign a primary logo mark and wordmark. Deliverables include:\n- Primary logo (full color, on light background)\n- Reversed logo (on dark/brand-color background)\n- Monochrome version (black and white)\n- Minimum size specifications\n- Clear space rules (defined as a multiple of a logo element, e.g. the x-height of the wordmark)\n- Incorrect usage examples (at least 6: stretching, wrong colors, busy backgrounds, etc.)\n\n**5. Iconography & Illustration Style**\nDefine the visual language for icons and any supporting illustration. Specify stroke weight, corner radius, grid size (e.g. 24×24px), and style (outlined, filled, or duotone). Provide at least 8 custom icons relevant to your brand.\n\n**6. Spacing & Grid System**\nDocument the base spacing unit (e.g. 4px or 8px) and the spacing scale derived from it. Define the layout grid for both desktop (12-column) and mobile (4-column) with column widths, gutters, and margins.\n\n**7. Component Showcase**\nApply your design system to at least three UI components: a primary button (with all states: default, hover, active, disabled), a form input field, and a card component. Show how the color, typography, and spacing tokens come together in real UI.\n\n**Submission**\nSubmit a single ZIP archive containing:\n- Your Figma source file (.fig)\n- An exported PDF of the brand guidelines (minimum 20 pages)\n- A short README.md (max 300 words) explaining your brand concept and key design decisions",
        teammates: [
          {
            id: "des-tm-1",
            name: "Jordan Lee",
            role: "Creative Lead",
            initials: "JL",
            avatarColor: "#C2410C",
            online: true,
          },
          {
            id: "des-tm-2",
            name: "Nadia Osei",
            role: "Member",
            initials: "NO",
            avatarColor: "#0F766E",
            online: true,
          },
          {
            id: "des-tm-3",
            name: "Ravi Kapoor",
            role: "Member",
            initials: "RK",
            avatarColor: "#1D4ED8",
            online: false,
          },
          {
            id: "des-tm-4",
            name: "Camille Dubois",
            role: "Member",
            initials: "CD",
            avatarColor: "#6B21A8",
            online: true,
          },
        ],
        milestones: [],
      },
      {
        id: "des301-a2",
        title: "Brand Audit — Competitive Analysis",
        dueDate: "Submitted Feb 24",
        status: "submitted",
      },
      {
        id: "des301-a3",
        title: "Mood Board & Visual Direction",
        dueDate: "Overdue — Mar 17",
        status: "overdue",
      },
    ],
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
