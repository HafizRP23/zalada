import db from "@database"
import { Infrastructure } from "./base"

class DatabaseService extends Infrastructure {
    async init() {
        await db.initialize()
    }
    
    getInstance() {
        return db
    }

    async close() {
        if (db.isInitialized) {
            await db.destroy()
        }
    }
}

export default new DatabaseService()