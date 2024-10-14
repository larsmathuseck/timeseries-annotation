import { Dexie, Entity, type EntityTable } from 'dexie'

class Annotation extends Entity {
    id!: number
    name!: string
    lastAdded!: number | null
}

export class Label extends Entity {
    id!: number
    name!: string
    color!: string
    annotationId!: number
    annotationIdName!: string | null
}

class AnnoDatum extends Entity {
    id!: number
    timestamp!: number
    labelId!: number
    annotationId!: number
}

class LastSelected extends Entity {
    id!: number
    annotationId!: number
}

class Area extends Entity {
    id!: number
    firstTimestamp!: number
    secondTimestamp!: number
    labelId!: number
    annotationId!: number
    y1!: number | null
    y2!: number | null
    yAmount!: number | null
}

class AppDB extends Dexie {
    annotations!: EntityTable<Annotation, 'id'>
    labels!: EntityTable<Label, 'id'>
    annoData!: EntityTable<AnnoDatum, 'id'>
    lastSelected!: EntityTable<LastSelected, 'id'>
    areas!: EntityTable<Area, 'id'>

    constructor() {
        super('tfAnnotator')
        this.version(1).stores({
            annotations: 'id++, name, lastAdded',
            labels: 'id++, name, color, annotationId, [annotationId+name]',
            annoData: 'id++, timestamp, labelId, annotationId',
            lastSelected: 'id++, annotationId',
            areas: 'id++, firstTimestamp, secondTimestamp, labelId, annotationId, y1, y2, yAmount',
        })
        this.annotations.mapToClass(Annotation)
    }
}

export const db = new AppDB()
