import seedDatabase from './utils/seed.js';

console.log('🌱 Starting database seed...\n');

seedDatabase().then(() => {
  console.log('\n✅ Database seed completed successfully!');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Error seeding database:', error);
  process.exit(1);
});
