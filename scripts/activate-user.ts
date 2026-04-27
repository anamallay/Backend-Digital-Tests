import 'dotenv/config'
import mongoose from 'mongoose'
import User from '../src/models/userSchema'

async function main() {
  const url = process.env.MONGODB_URL
  if (!url) throw new Error('MONGODB_URL not set in .env')

  await mongoose.connect(url)

  const users = await User.find({}, { email: 1, username: 1, active: 1, createdAt: 1 })
    .sort({ createdAt: -1 })
    .lean()

  console.log(`\nRegistered users (${users.length}):`)
  for (const u of users) {
    const id = u._id.toString()
    const flag = u.active ? 'ACTIVE  ' : 'inactive'
    console.log(`  [${flag}] ${u.email ?? u.username ?? '(no id)'}  —  ${id}`)
  }

  const target = process.argv[2]
  if (!target) {
    console.log('\nTo activate, run: npx ts-node scripts/activate-user.ts <email>')
    await mongoose.disconnect()
    return
  }

  const result = await User.updateOne(
    { email: target.toLowerCase() },
    { $set: { active: true } }
  )

  if (result.matchedCount === 0) {
    console.log(`\nNo user found with email "${target}".`)
  } else {
    console.log(`\nActivated "${target}" (modified: ${result.modifiedCount}).`)
  }

  await mongoose.disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
