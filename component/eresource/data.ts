// Subject interface
export interface Subject {
  subject: string;
  approvedBooks: string[];
}

// Semester structure for BSc Nursing
export interface Semester {
  [key: string]: Subject[];
}

// Year structure for BSc Nursing
export interface YearStructure {
  [key: string]: Subject[] | Semester;
}

// Program interface
export interface ProgramData {
  BSc_Nursing: {
    Year_1: {
      Semester_1: Subject[];
      Semester_2: Subject[];
    };
    Year_2: {
      Semester_3: Subject[];
      Semester_4: Subject[];
    };
    Year_3: {
      Semester_5: Subject[];
      Semester_6: Subject[];
    };
    Year_4: {
      Semester_7: Subject[];
      Semester_8: Subject[];
    };
  };
  PostBasic_BSc_Nursing: {
    Year_1: Subject[];
    Year_2: Subject[];
  };
  GNM: {
    Year_1: Subject[];
    Year_2: Subject[];
    Year_3: Subject[];
  };
}

// Main eresource data
export const INC_EBOOKS: ProgramData = {
  BSc_Nursing: {
    Year_1: {
      Semester_1: [
        {
          subject: 'Anatomy & Physiology',
          approvedBooks: [
            'Ross & Wilson – Anatomy and Physiology in Health & Illness',
            'Tortora & Derrickson – Principles of Anatomy and Physiology',
          ],
        },
        {
          subject: 'Biochemistry',
          approvedBooks: [
            'Satyanarayana – Biochemistry',
            "Harper's Illustrated Biochemistry",
          ],
        },
        {
          subject: 'Nutrition & Dietetics',
          approvedBooks: ['Srilakshmi – Dietetics', 'Antia – Clinical Nutrition'],
        },
        {
          subject: 'Psychology',
          approvedBooks: [
            'Morgan & King – Introduction to Psychology',
            'Coley – Nursing Psychology',
          ],
        },
      ],
      Semester_2: [
        {
          subject: 'Fundamentals of Nursing',
          approvedBooks: [
            'Potter & Perry – Fundamentals of Nursing',
            'Kozier & Erb – Fundamentals of Nursing',
          ],
        },
        {
          subject: 'Microbiology',
          approvedBooks: [
            'Ananthanarayan – Textbook of Microbiology',
            'Prescott – Microbiology',
          ],
        },
        {
          subject: 'English',
          approvedBooks: ['Wren & Martin – English Grammar', 'Oxford Practical English'],
        },
      ],
    },
    Year_2: {
      Semester_3: [
        {
          subject: 'Medical Surgical Nursing I',
          approvedBooks: [
            'Brunner & Suddarth – Medical Surgical Nursing',
            'Lewis – Medical Surgical Nursing',
          ],
        },
        {
          subject: 'Pharmacology',
          approvedBooks: [
            'Lippincott Pharmacology',
            'K.D. Tripathi – Essentials of Pharmacology',
          ],
        },
        {
          subject: 'Pathology & Genetics',
          approvedBooks: ['Harsh Mohan – Pathology', 'Robbins – Basic Pathology'],
        },
      ],
      Semester_4: [
        {
          subject: 'Community Health Nursing I',
          approvedBooks: [
            'Park – Preventive & Social Medicine',
            'Stanhope – Community Health Nursing',
          ],
        },
        {
          subject: 'Communication & Educational Technology',
          approvedBooks: [
            'Bhatia – Educational Technology',
            'Nagpal – Communication in Nursing',
          ],
        },
      ],
    },
    Year_3: {
      Semester_5: [
        {
          subject: 'Child Health Nursing',
          approvedBooks: [
            "Marilyn Hockenberry – Wong's Pediatric Nursing",
            'Ghai – Essential Pediatrics',
          ],
        },
        {
          subject: 'Mental Health Nursing',
          approvedBooks: [
            'Kaplan & Saddock – Psychiatry',
            'Kneisl – Psychiatric Nursing',
          ],
        },
      ],
      Semester_6: [
        {
          subject: 'Medical Surgical Nursing II',
          approvedBooks: [
            'Brunner & Suddarth – MS Nursing Vol II',
            'Lewis – MS Nursing',
          ],
        },
        {
          subject: 'Nursing Research',
          approvedBooks: [
            'Polit & Beck – Nursing Research',
            'Burns & Grove – Research in Nursing',
          ],
        },
      ],
    },
    Year_4: {
      Semester_7: [
        {
          subject: 'Midwifery & Obstetrics',
          approvedBooks: ['D.C. Dutta – Obstetrics', 'Myles – Textbook for Midwives'],
        },
        {
          subject: 'Community Health Nursing II',
          approvedBooks: ['Park – PSM', 'Stanhope – CHN'],
        },
      ],
      Semester_8: [
        {
          subject: 'Nursing Management',
          approvedBooks: [
            'Tomey – Nursing Management',
            'Joanna Briggs – Nursing Leadership',
          ],
        },
      ],
    },
  },
  PostBasic_BSc_Nursing: {
    Year_1: [
      {
        subject: 'Nursing Foundation',
        approvedBooks: [
          'Kozier & Erb – Nursing Foundation',
          'Potter & Perry – Foundations of Nursing',
        ],
      },
      {
        subject: 'Nutrition & Biochemistry',
        approvedBooks: ['Satyanarayana – Biochemistry', 'Srilakshmi – Nutrition'],
      },
      {
        subject: 'Psychology',
        approvedBooks: [
          'Morgan & King – Psychology',
          'Coley – Psychology for Nurses',
        ],
      },
    ],
    Year_2: [
      {
        subject: 'Medical Surgical Nursing',
        approvedBooks: ['Brunner & Suddarth', 'Lewis – Medical Surgical Nursing'],
      },
      {
        subject: 'Maternal Nursing',
        approvedBooks: ['D.C. Dutta – Obstetrics', 'Myles – Midwifery'],
      },
      {
        subject: 'Child Health Nursing',
        approvedBooks: ['Wong – Pediatric Nursing', 'Ghai – Pediatrics'],
      },
    ],
  },
  GNM: {
    Year_1: [
      {
        subject: 'Biological Sciences',
        approvedBooks: ['Ross & Wilson – Anatomy', 'Ananthanarayan – Microbiology'],
      },
      {
        subject: 'Behavioral Sciences',
        approvedBooks: [
          'Morgan & King – Psychology',
          'Sociology for Nurses – K.P. Neeraja',
        ],
      },
      {
        subject: 'Fundamentals of Nursing',
        approvedBooks: ['Kozier & Erb', 'Potter & Perry'],
      },
    ],
    Year_2: [
      {
        subject: 'Medical Surgical Nursing',
        approvedBooks: ['Brunner & Suddarth', 'Lewis MS Nursing'],
      },
      {
        subject: 'Mental Health Nursing',
        approvedBooks: ['Neeraja – Psychiatric Nursing', 'Kneisl – MH Nursing'],
      },
    ],
    Year_3: [
      {
        subject: 'Midwifery',
        approvedBooks: ['D.C. Dutta – OBG', 'Myles – Midwifery'],
      },
      {
        subject: 'Community Health Nursing',
        approvedBooks: ['Park – PSM', 'CHN – S. Likhita'],
      },
    ],
  },
};

// Helper function to get subjects by program, year, and semester
export function getSubjects(program: string, year: string, semester?: string): Subject[] {
  const programData = INC_EBOOKS[program as keyof ProgramData];
  if (!programData) return [];

  const yearData = programData[year as keyof typeof programData];
  if (!yearData) return [];

  if (semester) {
    const semesterData = yearData[semester as keyof typeof yearData];
    return Array.isArray(semesterData) ? semesterData : [];
  }

  // If no semester specified and yearData is an array, return it
  return Array.isArray(yearData) ? yearData : [];
}
