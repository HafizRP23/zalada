import * as TransJob from './scripts/Transaction'

async function main() {
    const jobs = []
    try {
        jobs.push(await TransJob.CronOrderAutoCancel())
        jobs.push(await TransJob.CronSendNotificationLowStock())
        jobs.push(await TransJob.CronAutoFinishTransaction())
        
        return jobs.filter(Boolean) // Filter out any undefined jobs if any
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}

export default main
