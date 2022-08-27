export const changelog: Changelog = [
  {
    version: '1.0.0',
    changes: [
      'Routes added',
      'First working version for Bag api'
    ],
    techChanges: [
      'Bag endpoints now added, serving several services at the same time is now possible'  
    ],
    knownIssues: [
      'Tests are broken now, but because implementation of mock was incorrect. Has to update it'
    ]
  },
  {
    version: '0.0.6',
    changes: ['Bag controller set'],
    techChanges: ['Testing included. Controller basic CRUD'],
    knownIssues: ['Tech debt rises with files of over 200 lines'],
  },
  {
    version: '0.0.5',
    techChanges: ['Firestore manager is now an external dependency'],
  },
  {
    version: '0.0.4',
    techChanges: ['Improved firestore manager. Updated model to use new FSManager'],
  },
  {
    version: '0.0.3',
    changes: [
      'Rules now implemented. Automatic rule triggers available',
    ],
    techChanges: [
      'Tests now for every type of rule existing so far',
    ],
    knownIssues: [
      'Firebase manager needs rethinking and rework',
      'Rule logic and bag logic is flaky. Lots of rigidity and complexity',
    ]
  },
  {
    version: '0.0.2',
    techChanges: [
      'Bag implementation with tests complete',
      'Lacking rule implementation',
    ],
  },
  {
    version: '0.0.1',
    techChanges: ['Initialized repo'],
  }
];

interface ChangelogVersion {
  version: `${number}.${number}.${number}`;
}
interface ChangelogChanges extends ChangelogVersion {
  changes: string[];
}
interface ChangelogTechChanges extends ChangelogVersion {
  techChanges: string[];
}
interface ChangelogKnownIssues extends ChangelogVersion {
  knownIssues: string[];
}

export type Changelog = (ChangelogChanges | ChangelogTechChanges | ChangelogKnownIssues)[];
