const { DataTypes } = require('sequelize');

const DataPlan = sequelize.define('dataPlan', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  data_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true, 
  },
  network: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  plan_type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
        min: 0,
    },
  },
  size: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  validity: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'dataPlan',
  timestamps: true,
});

module.exports = DataPlan;