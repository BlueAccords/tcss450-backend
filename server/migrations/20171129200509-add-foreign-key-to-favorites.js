'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.addColumn(
      'Favorites',
      'userId',
      {
        type: Sequelize.INTEGER,
        allowNull: false,
        onDelete: 'CASCADE',
        references: {
          model: 'Users',
          key: 'id',
          as: 'userId',
        },
      }
    )
  },
  down: (queryInterface, Sequelize) => {
    queryInterface.removeColumn(
      'Favorites',
      'userId'
    )
  }
};