import { CourseFileNode } from "./courses";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SlideData = {
  title: string;
  bullets: string[];
  hasImage: boolean;
};

export type FileSlideSet = {
  fileId: string;
  slides: SlideData[];
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns true when the file extension is one of ppt, pptx, or pdf
 * (case-insensitive).
 */
export function isEligibleForReview(fileName: string): boolean {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  return ["ppt", "pptx", "pdf"].includes(ext);
}

/**
 * Recursively searches a CourseFileNode tree for a node matching `fileId`.
 */
export function findFileNode(
  nodes: CourseFileNode[],
  fileId: string
): CourseFileNode | undefined {
  for (const node of nodes) {
    if (node.id === fileId) return node;
    if (node.children) {
      const found = findFileNode(node.children, fileId);
      if (found) return found;
    }
  }
  return undefined;
}

/**
 * Returns mock slide data for a given file ID, or undefined if no data exists.
 */
export function getSlides(fileId: string): SlideData[] | undefined {
  return mockSlideData[fileId];
}

// ---------------------------------------------------------------------------
// Mock slide data
// ---------------------------------------------------------------------------

const mockSlideData: Record<string, SlideData[]> = {
  // -----------------------------------------------------------------------
  // CSE 310 — Lectures
  // -----------------------------------------------------------------------

  "file-lec01": [
    {
      title: "Introduction to Arrays",
      bullets: [
        "Arrays store elements in contiguous memory locations",
        "Access any element in O(1) time using its index",
        "Fixed size in most languages; dynamic arrays resize automatically",
        "Common operations: traversal, insertion, deletion, search",
      ],
      hasImage: true,
    },
    {
      title: "Big-O Notation",
      bullets: [
        "Describes the upper bound of an algorithm's growth rate",
        "Common classes: O(1), O(log n), O(n), O(n log n), O(n²)",
        "Focus on dominant terms — drop constants and lower-order terms",
        "Useful for comparing algorithms independent of hardware",
      ],
      hasImage: false,
    },
    {
      title: "Time Complexity Analysis",
      bullets: [
        "Best case, average case, and worst case scenarios",
        "Linear search is O(n) worst case, O(1) best case",
        "Binary search on sorted arrays achieves O(log n)",
        "Nested loops typically indicate O(n²) complexity",
        "Amortized analysis accounts for occasional expensive operations",
      ],
      hasImage: true,
    },
    {
      title: "Space Complexity",
      bullets: [
        "Measures additional memory an algorithm requires",
        "In-place algorithms use O(1) extra space",
        "Recursive algorithms use O(depth) stack space",
        "Trade-offs between time and space are common in practice",
      ],
      hasImage: false,
    },
    {
      title: "Summary & Key Takeaways",
      bullets: [
        "Arrays are the foundation of most data structures",
        "Big-O helps us reason about scalability",
        "Always consider both time and space complexity",
        "Practice: implement dynamic array with amortized O(1) append",
      ],
      hasImage: false,
    },
  ],

  "file-lec02": [
    {
      title: "Singly Linked Lists",
      bullets: [
        "Each node stores data and a pointer to the next node",
        "Head pointer gives access to the first element",
        "Insertion at head is O(1); at tail is O(n) without tail pointer",
        "No random access — traversal is always O(n)",
      ],
      hasImage: true,
    },
    {
      title: "Doubly Linked Lists",
      bullets: [
        "Each node has pointers to both next and previous nodes",
        "Enables efficient traversal in both directions",
        "Deletion of a known node is O(1) with direct reference",
        "Uses more memory per node than singly linked lists",
      ],
      hasImage: false,
    },
    {
      title: "Core Operations",
      bullets: [
        "Insert: at head, at tail, or at a given position",
        "Delete: by value, by position, or by node reference",
        "Search: linear scan from head — O(n) worst case",
        "Reverse: iterative approach uses three pointers",
        "Detect cycle: Floyd's tortoise and hare algorithm",
      ],
      hasImage: true,
    },
    {
      title: "Linked Lists vs Arrays",
      bullets: [
        "Arrays offer O(1) access; linked lists offer O(1) insertion at head",
        "Arrays have better cache locality due to contiguous memory",
        "Linked lists avoid costly resizing operations",
        "Choose based on access patterns and mutation frequency",
      ],
      hasImage: false,
    },
    {
      title: "Summary & Practice Problems",
      bullets: [
        "Linked lists are fundamental for stacks, queues, and graphs",
        "Understand trade-offs between singly and doubly linked variants",
        "Practice: reverse a linked list in-place",
        "Practice: merge two sorted linked lists",
      ],
      hasImage: false,
    },
  ],

  "file-lec03": [
    {
      title: "Binary Trees — Fundamentals",
      bullets: [
        "Each node has at most two children: left and right",
        "Depth of a node is its distance from the root",
        "Height of a tree is the longest root-to-leaf path",
        "Full, complete, and perfect binary trees have distinct properties",
      ],
      hasImage: true,
    },
    {
      title: "Binary Search Trees (BST)",
      bullets: [
        "Left subtree values are less than the node's value",
        "Right subtree values are greater than the node's value",
        "In-order traversal yields sorted output",
        "Search, insert, and delete are O(h) where h is tree height",
        "Balanced BSTs guarantee O(log n) operations",
      ],
      hasImage: false,
    },
    {
      title: "Tree Traversals",
      bullets: [
        "In-order: left → root → right (sorted order for BST)",
        "Pre-order: root → left → right (useful for copying trees)",
        "Post-order: left → right → root (useful for deletion)",
        "Level-order: breadth-first using a queue",
      ],
      hasImage: true,
    },
    {
      title: "Heaps & Priority Queues",
      bullets: [
        "A heap is a complete binary tree satisfying the heap property",
        "Max-heap: parent ≥ children; min-heap: parent ≤ children",
        "Insert and extract operations are O(log n)",
        "Efficiently implemented using an array representation",
        "Priority queues are the primary application of heaps",
      ],
      hasImage: false,
    },
    {
      title: "Heap Sort & Applications",
      bullets: [
        "Build a max-heap, then repeatedly extract the maximum",
        "Time complexity: O(n log n) in all cases",
        "In-place sorting with O(1) extra space",
        "Applications: scheduling, median finding, graph algorithms",
      ],
      hasImage: true,
    },
  ],

  // -----------------------------------------------------------------------
  // CSE 310 — Problem Sets
  // -----------------------------------------------------------------------

  "file-ps1": [
    {
      title: "Problem Set 1 — Overview",
      bullets: [
        "Topic: Arrays and basic complexity analysis",
        "Four problems of increasing difficulty",
        "Submit solutions in C++ or Python",
        "Due date: January 26, 2026",
      ],
      hasImage: false,
    },
    {
      title: "Problem 1: Two Sum",
      bullets: [
        "Given an array of integers and a target, find two indices that sum to the target",
        "Brute force: O(n²) nested loop approach",
        "Optimal: O(n) using a hash map for complement lookup",
        "Return indices in ascending order",
      ],
      hasImage: false,
    },
    {
      title: "Problem 2: Rotate Array",
      bullets: [
        "Rotate an array of n elements to the right by k steps",
        "Handle k > n by using k mod n",
        "Approach: reverse entire array, then reverse each partition",
        "Must be done in-place with O(1) extra space",
      ],
      hasImage: true,
    },
    {
      title: "Problem 3: Maximum Subarray",
      bullets: [
        "Find the contiguous subarray with the largest sum",
        "Kadane's algorithm runs in O(n) time",
        "Track current sum and global maximum as you iterate",
        "Edge case: all negative numbers — return the least negative",
      ],
      hasImage: false,
    },
  ],

  "file-ps2": [
    {
      title: "Problem Set 2 — Overview",
      bullets: [
        "Topic: Linked list operations and pointer manipulation",
        "Three implementation problems plus one analysis question",
        "Use the provided Node class template",
        "Due date: February 2, 2026",
      ],
      hasImage: false,
    },
    {
      title: "Problem 1: Reverse a Linked List",
      bullets: [
        "Reverse a singly linked list iteratively",
        "Use three pointers: prev, current, and next",
        "Return the new head of the reversed list",
        "Time: O(n), Space: O(1)",
      ],
      hasImage: true,
    },
    {
      title: "Problem 2: Detect and Remove Cycle",
      bullets: [
        "Detect if a linked list contains a cycle using Floyd's algorithm",
        "If a cycle exists, find the start node and remove the cycle",
        "Explain why the algorithm works in your written analysis",
        "Handle edge cases: empty list, single node, no cycle",
      ],
      hasImage: false,
    },
    {
      title: "Problem 3: Merge Two Sorted Lists",
      bullets: [
        "Merge two sorted singly linked lists into one sorted list",
        "Do not allocate new nodes — reuse existing ones",
        "Handle lists of different lengths",
        "Analyze the time and space complexity of your solution",
      ],
      hasImage: false,
    },
  ],

  "file-ps3": [
    {
      title: "Problem Set 3 — Overview",
      bullets: [
        "Topic: Sorting algorithms and their analysis",
        "Implement and compare three sorting algorithms",
        "Include empirical timing measurements",
        "Due date: February 16, 2026",
      ],
      hasImage: false,
    },
    {
      title: "Problem 1: Merge Sort Implementation",
      bullets: [
        "Implement merge sort for an array of integers",
        "Use the divide-and-conquer paradigm",
        "Count the number of comparisons made during sorting",
        "Verify O(n log n) behavior with timing experiments",
      ],
      hasImage: true,
    },
    {
      title: "Problem 2: Quick Sort with Pivot Strategies",
      bullets: [
        "Implement quick sort with three pivot selection strategies",
        "Strategies: first element, random element, median-of-three",
        "Compare performance on sorted, reverse-sorted, and random inputs",
        "Discuss worst-case scenarios for each strategy",
      ],
      hasImage: false,
    },
    {
      title: "Problem 3: Comparative Analysis",
      bullets: [
        "Run merge sort and quick sort on arrays of size 1K, 10K, and 100K",
        "Plot execution time vs input size for each algorithm",
        "Write a one-page analysis comparing theoretical and empirical results",
        "Discuss when you would choose one algorithm over the other",
      ],
      hasImage: true,
    },
  ],

  "file-ps4": [
    {
      title: "Problem Set 4 — Overview",
      bullets: [
        "Topic: Binary trees and BST operations",
        "Implement a BST class with full CRUD operations",
        "Extend to an AVL tree with self-balancing",
        "Due date: April 28, 2026",
      ],
      hasImage: false,
    },
    {
      title: "Problem 1: BST Implementation",
      bullets: [
        "Implement insert, search, remove, and in-order traversal",
        "Handle duplicate keys by ignoring them",
        "Use a templated class for generic key types",
        "Write Big-O analysis for each operation in comments",
      ],
      hasImage: false,
    },
    {
      title: "Problem 2: AVL Tree Extension",
      bullets: [
        "Extend your BST to maintain the AVL balance property",
        "Implement left-rotate, right-rotate, left-right, and right-left rotations",
        "Verify balance after every insertion and deletion",
        "Test with a sequence of 20 random insertions",
      ],
      hasImage: true,
    },
    {
      title: "Problem 3: Testing & Analysis",
      bullets: [
        "Write a test file exercising all edge cases",
        "Test: insert into empty tree, remove root, remove node with two children",
        "Compare BST vs AVL tree height after inserting sorted sequences",
        "Submit a README describing your design decisions",
      ],
      hasImage: false,
    },
  ],

  // -----------------------------------------------------------------------
  // DES 301 — Lectures
  // -----------------------------------------------------------------------

  "des-file-lec01": [
    {
      title: "What is a Brand?",
      bullets: [
        "A brand is more than a logo — it's the total perception of a company",
        "Brand identity encompasses visual, verbal, and experiential elements",
        "Strong brands create emotional connections with their audience",
        "Examples: Apple's simplicity, Nike's empowerment, Airbnb's belonging",
      ],
      hasImage: true,
    },
    {
      title: "Brand Strategy Foundations",
      bullets: [
        "Define mission, vision, and core values before any visual work",
        "Identify your target audience and their needs",
        "Craft a brand positioning statement that differentiates you",
        "Tone of voice should be consistent across all touchpoints",
      ],
      hasImage: false,
    },
    {
      title: "The Brand Identity System",
      bullets: [
        "A system of interconnected visual elements working together",
        "Includes: logo, color palette, typography, imagery, iconography",
        "Consistency builds recognition and trust over time",
        "Flexibility within the system allows adaptation across media",
      ],
      hasImage: false,
    },
    {
      title: "Building Brand Guidelines",
      bullets: [
        "Document every element with clear usage rules",
        "Include do's and don'ts with visual examples",
        "Specify minimum sizes, clear space, and color variations",
        "Guidelines ensure consistency as teams and channels grow",
        "Living documents that evolve with the brand",
      ],
      hasImage: true,
    },
  ],

  "des-file-lec02": [
    {
      title: "Introduction to Color Theory",
      bullets: [
        "Color is one of the most powerful tools in visual communication",
        "The color wheel: primary, secondary, and tertiary colors",
        "Hue, saturation, and brightness define any color",
        "Understanding color models: RGB for screen, CMYK for print",
      ],
      hasImage: true,
    },
    {
      title: "Color Harmonies",
      bullets: [
        "Complementary: colors opposite on the wheel create high contrast",
        "Analogous: adjacent colors create harmonious, cohesive palettes",
        "Triadic: three evenly spaced colors offer vibrant variety",
        "Split-complementary: a softer alternative to full complementary",
      ],
      hasImage: true,
    },
    {
      title: "Color Psychology",
      bullets: [
        "Red: energy, urgency, passion — used in food and retail brands",
        "Blue: trust, stability, calm — dominant in tech and finance",
        "Green: growth, health, nature — common in wellness brands",
        "Yellow: optimism, warmth, attention — effective for call-to-actions",
        "Cultural context can shift color associations significantly",
      ],
      hasImage: false,
    },
    {
      title: "Building a Brand Color Palette",
      bullets: [
        "Start with one primary brand color that reflects your identity",
        "Add 2–3 secondary colors using a defined color harmony",
        "Include a neutral scale: white through black",
        "Define semantic colors for UI states: success, warning, error, info",
      ],
      hasImage: false,
    },
    {
      title: "Accessibility & Contrast",
      bullets: [
        "WCAG 2.1 requires minimum contrast ratios for text readability",
        "AA standard: 4.5:1 for normal text, 3:1 for large text",
        "Test all color combinations with a contrast checker tool",
        "Never rely on color alone to convey meaning",
      ],
      hasImage: true,
    },
  ],

  "des-file-lec03": [
    {
      title: "Typography Fundamentals",
      bullets: [
        "Typography is the art of arranging type to make text readable and appealing",
        "Serif vs sans-serif: each conveys a different personality",
        "Key terms: typeface, font, weight, style, leading, tracking, kerning",
        "Good typography is invisible — it serves the content",
      ],
      hasImage: false,
    },
    {
      title: "Building a Type System",
      bullets: [
        "Select a primary typeface for headings and a secondary for body text",
        "Define a modular type scale (e.g., 1.25 ratio or 8px grid)",
        "Specify sizes for display, H1–H4, body, caption, and label styles",
        "Document font family, weight, size, line height, and letter spacing",
      ],
      hasImage: true,
    },
    {
      title: "Typographic Hierarchy",
      bullets: [
        "Hierarchy guides the reader's eye through content in order of importance",
        "Use size, weight, color, and spacing to create visual levels",
        "Limit to 3–4 distinct levels to avoid visual clutter",
        "Consistent hierarchy improves scannability and comprehension",
        "Test hierarchy by squinting — the structure should still be visible",
      ],
      hasImage: false,
    },
    {
      title: "Typography in Digital Products",
      bullets: [
        "Responsive type scales adapt to different screen sizes",
        "System fonts improve performance; web fonts add personality",
        "Line length of 50–75 characters is optimal for readability",
        "Ensure sufficient contrast between text and background",
      ],
      hasImage: true,
    },
  ],

  "des-file-lec04": [
    {
      title: "Logo Design Principles",
      bullets: [
        "A great logo is simple, memorable, timeless, versatile, and appropriate",
        "Simplicity ensures recognition at any size",
        "The best logos work in a single color",
        "Avoid trends that will date the design quickly",
      ],
      hasImage: true,
    },
    {
      title: "Types of Logos",
      bullets: [
        "Wordmark: the brand name in a distinctive typeface (e.g., Google)",
        "Lettermark: initials or monogram (e.g., IBM, HBO)",
        "Symbol/icon: a standalone graphic mark (e.g., Apple, Twitter)",
        "Combination mark: text and symbol together (e.g., Adidas)",
        "Emblem: text enclosed within a symbol (e.g., Starbucks)",
      ],
      hasImage: true,
    },
    {
      title: "The Logo Design Process",
      bullets: [
        "Research: understand the brand, audience, and competitors",
        "Sketch: explore dozens of concepts on paper before going digital",
        "Refine: select the strongest concepts and develop them further",
        "Test: evaluate at different sizes, on different backgrounds, in context",
      ],
      hasImage: false,
    },
    {
      title: "Logo Construction & Grid",
      bullets: [
        "Use a construction grid to ensure geometric precision",
        "Define clear space as a multiple of a logo element (e.g., x-height)",
        "Specify minimum reproduction sizes for print and digital",
        "Optical adjustments may override strict geometry for visual balance",
      ],
      hasImage: false,
    },
    {
      title: "Logo Usage Guidelines",
      bullets: [
        "Provide full-color, reversed, and monochrome versions",
        "Document incorrect usage: stretching, wrong colors, busy backgrounds",
        "Include at least 6 incorrect usage examples in brand guidelines",
        "Specify approved color backgrounds and placement rules",
        "The logo is the cornerstone of the entire brand identity system",
      ],
      hasImage: true,
    },
  ],

  // -----------------------------------------------------------------------
  // DES 301 — Resources & Assignments
  // -----------------------------------------------------------------------

  "des-file-syllabus": [
    {
      title: "Course Overview — DES 301",
      bullets: [
        "Brand Identity & Visual Systems — Spring 2026",
        "Professor Sofia Reyes — Office hours: Tuesdays 2–4 PM",
        "Explores principles of building cohesive brand identities",
        "Hands-on projects culminating in a complete brand design system",
      ],
      hasImage: false,
    },
    {
      title: "Learning Objectives",
      bullets: [
        "Apply color theory and typography principles to brand design",
        "Develop a comprehensive brand identity from concept to delivery",
        "Create professional brand guidelines documentation",
        "Critique and analyze existing brand systems",
        "Use industry-standard tools: Figma, Adobe Creative Suite",
      ],
      hasImage: false,
    },
    {
      title: "Course Schedule Highlights",
      bullets: [
        "Weeks 1–4: Foundations — brand strategy, color, typography",
        "Weeks 5–8: Logo design and visual identity development",
        "Weeks 9–12: Brand system components and guidelines",
        "Weeks 13–16: Final project development and presentations",
      ],
      hasImage: true,
    },
    {
      title: "Grading & Policies",
      bullets: [
        "Brand Audit (20%), Brand Design System (40%), Participation (15%), Critiques (25%)",
        "Late submissions lose 10% per day up to 3 days, then zero",
        "Attendance is mandatory — more than 3 absences affects final grade",
        "Academic integrity: all work must be original",
      ],
      hasImage: false,
    },
  ],

  "des-file-brand-examples": [
    {
      title: "Case Study: Apple",
      bullets: [
        "Minimalist design language across all touchpoints",
        "Consistent use of San Francisco typeface and clean photography",
        "Product design and brand identity are inseparable",
        "Demonstrates how simplicity creates premium perception",
      ],
      hasImage: true,
    },
    {
      title: "Case Study: Airbnb",
      bullets: [
        "The Bélo symbol represents belonging and community",
        "Warm color palette with coral as the primary brand color",
        "Photography style emphasizes real people and authentic experiences",
        "Brand system flexes across digital, print, and environmental design",
      ],
      hasImage: true,
    },
    {
      title: "Case Study: Spotify",
      bullets: [
        "Bold duotone imagery creates a distinctive visual language",
        "Green is ownable and instantly recognizable in the music space",
        "Dynamic brand system adapts to artist content and moods",
        "Typography uses Circular for a modern, friendly feel",
      ],
      hasImage: false,
    },
    {
      title: "Key Takeaways from Brand Systems",
      bullets: [
        "Great brands have a clear point of view and stick to it",
        "Flexibility within constraints keeps the brand fresh",
        "Every element should reinforce the brand's core message",
        "Consistency across channels builds trust and recognition",
        "Study brands you admire — reverse-engineer their systems",
      ],
      hasImage: false,
    },
  ],

  "des-file-a1-brief": [
    {
      title: "Assignment 1 — Brand Audit Overview",
      bullets: [
        "Select an existing brand and conduct a comprehensive visual audit",
        "Analyze their color system, typography, logo, and imagery",
        "Evaluate consistency across at least 5 different touchpoints",
        "Due date: February 24, 2026",
      ],
      hasImage: false,
    },
    {
      title: "Audit Framework",
      bullets: [
        "Document the brand's visual identity elements systematically",
        "Compare stated brand values with actual visual execution",
        "Identify strengths, weaknesses, and inconsistencies",
        "Use screenshots and examples to support your analysis",
      ],
      hasImage: true,
    },
    {
      title: "Competitive Comparison",
      bullets: [
        "Select 2–3 direct competitors of your chosen brand",
        "Compare visual identity approaches across the competitive set",
        "Identify opportunities for differentiation",
        "Create a visual comparison matrix",
      ],
      hasImage: false,
    },
    {
      title: "Deliverables & Submission",
      bullets: [
        "PDF report: 8–12 pages with visual examples throughout",
        "Include an executive summary and recommendations section",
        "Presentation: 5-minute in-class presentation of key findings",
        "Submit via CanvasAI by 11:59 PM on the due date",
      ],
      hasImage: false,
    },
  ],

  "des-file-a2-brief": [
    {
      title: "Assignment 2 — Brand Design System Overview",
      bullets: [
        "Create a complete brand design system for a fictional company",
        "System must be thorough, consistent, and production-ready",
        "Deliverables: Figma file and PDF brand guidelines (20+ pages)",
        "Due date: May 2, 2026",
      ],
      hasImage: false,
    },
    {
      title: "Required Components",
      bullets: [
        "Brand foundation: mission, vision, values, and brand story",
        "Color system with primary, secondary, neutral, and semantic colors",
        "Typography system with full type scale and specifications",
        "Logo design with all required variations and usage rules",
        "Iconography style and at least 8 custom icons",
      ],
      hasImage: true,
    },
    {
      title: "Technical Requirements",
      bullets: [
        "All colors must meet WCAG 2.1 AA contrast requirements",
        "Document colors in HEX, RGB, HSL, and CMYK formats",
        "Define spacing system based on a consistent base unit",
        "Include layout grids for desktop (12-column) and mobile (4-column)",
      ],
      hasImage: false,
    },
    {
      title: "Submission Guidelines",
      bullets: [
        "Submit a ZIP archive with Figma source, PDF guidelines, and README",
        "README: max 300 words explaining brand concept and key decisions",
        "Grading: concept (20%), visual execution (40%), documentation (25%), presentation (15%)",
        "Late penalty: 10% per day, maximum 3 days",
      ],
      hasImage: true,
    },
  ],

  // -----------------------------------------------------------------------
  // PDF Examples (these would be actual PDF pages in a real implementation)
  // -----------------------------------------------------------------------

  "phase-3-pdf": [
    {
      title: "Phase 3 - Page 1",
      bullets: ["This is the first page of your Phase 3.pdf document"],
      hasImage: false,
    },
    {
      title: "Phase 3 - Page 2", 
      bullets: ["This is the second page of your Phase 3.pdf document"],
      hasImage: false,
    },
    {
      title: "Phase 3 - Page 3",
      bullets: ["This is the third page of your Phase 3.pdf document"],
      hasImage: false,
    },
    {
      title: "Phase 3 - Page 4",
      bullets: ["This is the fourth page of your Phase 3.pdf document"],
      hasImage: false,
    },
    {
      title: "Phase 3 - Page 5",
      bullets: ["This is the fifth page of your Phase 3.pdf document"],
      hasImage: false,
    },
  ],

  "pdf-sample-1": [
    {
      title: "PDF Page 1",
      bullets: ["This is a PDF document rendered as slides"],
      hasImage: false,
    },
    {
      title: "PDF Page 2", 
      bullets: ["Each page becomes a slide in the reviewer"],
      hasImage: false,
    },
    {
      title: "PDF Page 3",
      bullets: ["Navigation and voice features work the same"],
      hasImage: false,
    },
  ],
};
