import { consola } from 'consola'

import { toast } from '@/components/ui/toast'

export const notifyDebug = ({ message }: { message: string }) =>
    consola.debug(message)

export const notifyInfo = ({ message }: { message: string }) => {
    consola.info(message)
    toast({
        description: message,
        title: 'Information',
    })
}

export const notifyWarn = ({ message }: { message: string }) => {
    consola.warn(message)
    toast({
        description: message,
        title: 'Warning',
    })
}

export const notifyError = (
    { message }: { message: string },
    ...args: unknown[]
) => {
    if (args.length) {
        consola.error(message, args)
    } else {
        consola.error(message)
    }

    toast({
        description: message,
        title: 'Error',
        variant: 'destructive',
    })
}
