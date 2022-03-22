import * as fs from 'fs';
import stringifyObject from 'stringify-object';
import { printStatsForBreakingChangeList } from './common';
const { execSync } = require('child_process');

/**
 * This script generates methods and properties schematics code.
 *
 * Input: A breaking changes file, likely `./data/breaking-changes.json`
 * Output: A file, `generate-methods-props.out.ts`, that contains code paste over in the migration schematics code.
 *
 */

/**
 * -----------
 * Main logic
 * -----------
 */

const breakingChangesFile = process.argv[2];

const breakingChangesData = JSON.parse(
  fs.readFileSync(breakingChangesFile, 'utf-8')
);

console.log(
  `Read: ${breakingChangesFile}, ${breakingChangesData.length} entries`
);

const deletedMemberSchematics = [];

const deletedMembers = getUpdatedMembers(breakingChangesData);
console.log(`Found ${deletedMembers.length} updated members.`);
printStatsForBreakingChangeList(deletedMembers);

deletedMembers.forEach((breakingChange: any) => {
  deletedMemberSchematics.push(getSchematicsData(breakingChange));
});

console.log(`Generated ${deletedMemberSchematics.length} entries.`);
fs.writeFileSync(
  `generate-methods-props.out.ts`,
  stringifyObject(deletedMemberSchematics)
);

/**
 * -----------
 * Functions
 * -----------
 */

function getSchematicsData(breakingChange: any): any {
  const schematicsData: any = {};
  schematicsData.class = breakingChange.apiElementName;
  schematicsData.importPath = breakingChange.entryPoint;
  schematicsData.deprecatedNode = breakingChange.changeElementName;
  schematicsData.comment = getShematicsComment(breakingChange);
  return schematicsData;
}

function getShematicsComment(breakingChange: any): string {
  if (breakingChange.changeType === 'DELETED') {
    return `${breakingChange.deletedComment} ${breakingChange.migrationComment}`;
  }
  if (breakingChange.changeKind.startsWith('Method')) {
    return `The '${
      breakingChange.changeElementName
    }' method's signature changed to: '${normalizeDoc(
      breakingChange.currentStateDoc
    )}'`;
  }
  if (breakingChange.changeKind.startsWith('Property')) {
    return `The type of property '${breakingChange.changeElementName}' changed to: '${breakingChange.currentStateDoc}' `;
  }
  throw new Error(
    `Unsupported breaking change ${breakingChange.change}:${breakingChange.changeElementName}`
  );
}

function getUpdatedMembers(breakingChangesData: any) {
  return breakingChangesData
    .filter((apiElement: any) => apiElement.kind === 'Class')
    .map((apiElement: any) => {
      return apiElement.breakingChanges.map((breakingChange) => {
        //TODO: Update the compare process to bake this info in each breaking change in advances.
        return {
          ...breakingChange,
          apiElementName: apiElement.name,
          entryPoint: apiElement.entryPoint,
        };
      });
    })
    .flat()
    .filter(
      (breakingChange: any) =>
        (breakingChange.changeType === 'DELETED' ||
          breakingChange.changeType === 'CHANGED') &&
        isMethodOrProperty(breakingChange.changeKind)
    );
}

function isMethodOrProperty(memberKind: string): boolean {
  return memberKind.startsWith('Method') || memberKind.startsWith('Property');
}

function normalizeDoc(doc: string): string {
  return doc.replace(/\n/g, '').replace(/\s+/g, ' ').trim();
}
