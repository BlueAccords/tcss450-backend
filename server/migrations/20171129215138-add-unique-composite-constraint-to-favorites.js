'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.addConstraint('Favorites', ['title', 'userId'], {
      type: 'unique',
      name: 'unique_userId_and_title_constraint'
    })
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.sequelize.query(
      'ALTER TABLE Favorites DROP CONSTRAINT unique_userId_and_title_constraint;'
    );
    queryInterface.removeIndex('Favorites', 'unique_userId_and_title_constraint');
  
  }
};
