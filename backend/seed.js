require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bloxfruit_service');
    console.log('Connected to MongoDB');

    await Admin.deleteOne({ username: 'admin' });

    const NEW_PASSWORD = '16112013quocdepzaivcl';

    const admin = new Admin({
      username: 'admin',
      password: NEW_PASSWORD
    });

    await admin.save();
    console.log('Admin user created/updated successfully');
    console.log('Username: admin');
    console.log('Password:', NEW_PASSWORD);

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedAdmin();
