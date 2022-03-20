import Dexie from 'dexie';

export const db = new Dexie('tfAnnotator');

db.version(1).stores({
  annotations: 'id++, name, lastAdded',
  labels: 'id++, name, color, annoId, [annoId+name]',
  annoData: 'id++, timestamp, labelId, annoId',
  lastSelected: 'id++, annoId',
  areas: 'id++, firstTimestamp, secondTimestamp, labelId, annoId, y1, y2',
});