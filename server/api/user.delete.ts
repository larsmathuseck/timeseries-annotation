export default defineEventHandler(async () => {
    const db = useDatabase()

    await db.sql`DELETE FROM users`

    return await db.sql`SELECT * FROM users`
})
