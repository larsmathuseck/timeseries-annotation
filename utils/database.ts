import { from, useObservable } from '@vueuse/rxjs'
import {
    Dexie,
    Entity,
    liveQuery,
    type EntityTable,
    type PromiseExtended,
} from 'dexie'

class AnnotationArea extends Entity {
    annotationId!: number
    id!: number
    labelId!: number
    timestampFrom!: number
    timestampTo!: number
    yAmount!: number | null
    yFrom!: number | null
    yTo!: number | null
}

class AnnotationFile extends Entity {
    // lastAdded!: number | null
    hash: string | undefined
    id!: number
    name!: string
}

class AnnotationFileSelected extends Entity {
    annotationId!: number
    id!: number
}

export class AnnotationLabel extends Entity {
    annotationId!: number
    annotationIdName!: string | null
    color!: string
    id!: number
    name!: string
}

class AnnotationTimestamp extends Entity {
    annotationId!: number
    id!: number
    labelId!: number
    timestamp!: number
}

class Database extends Dexie {
    annotationArea!: EntityTable<AnnotationArea, 'id'>
    annotationFile!: EntityTable<AnnotationFile, 'id'>
    annotationFileSelected!: EntityTable<AnnotationFileSelected, 'id'>
    annotationLabel!: EntityTable<AnnotationLabel, 'id'>
    annotationTimestamp!: EntityTable<AnnotationTimestamp, 'id'>

    constructor() {
        super('tfAnnotator')
        this.version(2).stores({
            annotationArea:
                'id++, annotationId, labelId, timestampFrom, timestampTo, yAmount, yFrom, yTo',
            annotationFile: 'id++, hash, name', // lastAdded
            annotationFileSelected: 'id++, annotationId',
            annotationLabel:
                'id++, annotationId, [annotationId+name], color, name',
            annotationTimestamp: 'id++, annotationId, labelId, timestamp',
        })
        this.annotationFile.mapToClass(AnnotationFile)
    }
}

export const database = new Database()

export const clearDatabase = () => {
    database.annotationFile.clear()
    database.annotationTimestamp.clear()
    database.annotationLabel.clear()
    database.annotationArea.clear()

    notifyInfo({ message: `Database has been cleared` })
}

export const getLiveQuery = <T>(querier: () => PromiseExtended<T>) =>
    useObservable(from(liveQuery(querier)))
