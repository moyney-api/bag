export const changelog: Changelog = [
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
export type Changelog = (ChangelogChanges | ChangelogTechChanges)[];
