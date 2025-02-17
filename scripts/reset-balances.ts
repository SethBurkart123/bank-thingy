import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function resetBalances() {
  try {
    await prisma.user.updateMany({
      data: {
        balance: 500
      }
    })
    console.log('Successfully reset all user balances to $500')
  } catch (error) {
    console.error('Error resetting balances:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetBalances()
