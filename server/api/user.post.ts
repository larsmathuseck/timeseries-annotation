export default defineEventHandler(async () => {
    const db = useDatabase()

    const userId = String(Math.round(Math.random() * 10_000))
    await db.sql`INSERT INTO users VALUES (${userId}, 'John', 'Doe')`

    return await db.sql`SELECT * FROM users WHERE id = ${userId}`
})
