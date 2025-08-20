import { Sequelize } from 'sequelize'
import { initializeModels, User, Repository } from '../models'

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
})

export const connectDatabase = async () => {
  try {
    await sequelize.authenticate()
    console.log('✅ 数据库连接成功')
    
    // 初始化模型
    initializeModels()
    
    // 同步数据库模型
    await sequelize.sync({ force: false })
    console.log('✅ 数据库模型同步成功')
    
  } catch (error) {
    console.error('❌ 数据库连接失败:', error)
    throw error
  }
}

export { sequelize, User, Repository }