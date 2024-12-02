export default defineNitroPlugin(async () => {
    const db = useDatabase()

    await db.sql`DROP TABLE IF EXISTS users`
    await db.sql`CREATE TABLE IF NOT EXISTS users ("id" TEXT PRIMARY KEY, "firstName" TEXT, "lastName" TEXT)`
})
