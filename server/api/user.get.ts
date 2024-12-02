export default defineEventHandler(async () => {
    const db = useDatabase()
    return await db.sql`SELECT * FROM users`
})
