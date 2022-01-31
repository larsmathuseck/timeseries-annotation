import Dexie from 'dexie';

export const db = new Dexie('tfAnnotator');

db.version(1).stores({
  data: 'id++, name, dataPoints, timestamps, selectedAxes',
});