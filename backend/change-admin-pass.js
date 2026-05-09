require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

const NEW_PASSWORD = process.argv[2] || 'admin123';

const changePassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bloxfruit_service');
    console.log('Connected to MongoDB');

    // Delete old admin
    const deleteResult = await Admin.deleteOne({ username: 'admin' });
    console.log('Deleted old admin:', deleteResult.deletedCount);

    // Create new admin with new password
    const admin = new Admin({
      username: 'admin',
      password: NEW_PASSWORD
    });

    await admin.save();
    console.log('Admin password changed successfully!');
    console.log('Username: admin');
    console.log('Password:', NEW_PASSWORD);

    // Verify by trying to compare
    const verifyAdmin = await Admin.findOne({ username: 'admin' });
    const isMatch = await verifyAdmin.comparePassword(NEW_PASSWORD);
    console.log('Verification (comparePassword):', isMatch ? 'PASS' : 'FAIL');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

changePassword();
