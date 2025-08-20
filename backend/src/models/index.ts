import { sequelize } from '../config/database'
import { User, initializeUser } from './User'
import { Repository, initializeRepository } from './Repository'

export const initializeModels = () => {
  // 初始化所有模型
  initializeUser(sequelize)
  initializeRepository(sequelize)
  
  // 定义关联关系
  User.hasMany(Repository, { foreignKey: 'userId' })
  Repository.belongsTo(User, { foreignKey: 'userId' })
}

export { User, Repository }