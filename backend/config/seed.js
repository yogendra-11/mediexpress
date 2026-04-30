const User = require('../models/User');

const sampleDoctors = [
  { name: 'Priya Sharma', email: 'priya.sharma@mediexpress.in', password: 'doctor123', role: 'doctor', phone: '+91 98101 11111', specialization: 'General Physician' },
  { name: 'Rajesh Kumar', email: 'rajesh.kumar@mediexpress.in', password: 'doctor123', role: 'doctor', phone: '+91 98101 22222', specialization: 'Dermatologist' },
  { name: 'Anjali Mehta', email: 'anjali.mehta@mediexpress.in', password: 'doctor123', role: 'doctor', phone: '+91 98101 33333', specialization: 'Pediatrician' },
  { name: 'Vikram Singh', email: 'vikram.singh@mediexpress.in', password: 'doctor123', role: 'doctor', phone: '+91 98101 44444', specialization: 'Cardiologist' },
  { name: 'Sneha Patel', email: 'sneha.patel@mediexpress.in', password: 'doctor123', role: 'doctor', phone: '+91 98101 55555', specialization: 'Gynecologist' },
  { name: 'Amit Gupta', email: 'amit.gupta@mediexpress.in', password: 'doctor123', role: 'doctor', phone: '+91 98101 66666', specialization: 'Orthopedic' },
];

const samplePharmacy = { name: 'MediExpress Pharmacy', email: 'pharmacy@mediexpress.in', password: 'pharmacy123', role: 'pharmacy', phone: '+91 98101 77777' };
const sampleDelivery = { name: 'Ravi Delivery', email: 'delivery@mediexpress.in', password: 'delivery123', role: 'delivery', phone: '+91 98101 88888' };

const seedDatabase = async () => {
  try {
    const doctorCount = await User.countDocuments({ role: 'doctor' });
    if (doctorCount > 0) {
      console.log(`📋 Database already has ${doctorCount} doctors, skipping seed`);
      return;
    }

    console.log('🌱 Seeding sample data...');

    for (const doc of sampleDoctors) {
      await User.create(doc);
    }

    // Create sample pharmacy and delivery accounts
    await User.create(samplePharmacy);
    await User.create(sampleDelivery);

    console.log('✅ Seeded 6 doctors, 1 pharmacy, 1 delivery partner');
    console.log('   Doctor login: any_doctor_email / doctor123');
    console.log('   Pharmacy login: pharmacy@mediexpress.in / pharmacy123');
    console.log('   Delivery login: delivery@mediexpress.in / delivery123');
  } catch (error) {
    console.error('❌ Seed error:', error.message);
  }
};

module.exports = seedDatabase;
