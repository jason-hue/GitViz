import { Model, DataTypes, Optional, Sequelize } from 'sequelize'

interface RepositoryAttributes {
  id: number
  name: string
  description?: string
  url: string
  localPath: string
  isPrivate: boolean
  userId: number
  branchCount: number
  commitCount: number
  lastUpdated: Date
  createdAt: Date
  updatedAt: Date
}

interface RepositoryCreationAttributes extends Optional<RepositoryAttributes, 'id' | 'branchCount' | 'commitCount' | 'lastUpdated' | 'createdAt' | 'updatedAt'> {}

class Repository extends Model<RepositoryAttributes, RepositoryCreationAttributes> implements RepositoryAttributes {
  public id!: number
  public name!: string
  public description?: string
  public url!: string
  public localPath!: string
  public isPrivate!: boolean
  public userId!: number
  public branchCount!: number
  public commitCount!: number
  public lastUpdated!: Date
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

const initializeRepository = (sequelize: Sequelize) => {
  Repository.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [1, 255]
        }
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      url: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isUrl: true
        }
      },
      localPath: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      isPrivate: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      branchCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      commitCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      lastUpdated: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    },
    {
      sequelize,
      modelName: 'Repository',
      tableName: 'repositories',
      timestamps: true
    }
  )
}

export { Repository, initializeRepository }