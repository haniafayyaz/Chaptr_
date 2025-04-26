const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Admin = require('../models/Admin');

async function addAdmin() {
  try {
    await mongoose.connect('mongodb://localhost:27017/chaptr', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    const adminData = {
      username: 'admin',
      email: 'admin@gmail.com',
      password: '123456',
    };

    // Remove existing admin to avoid duplicate key error
    await Admin.deleteOne({ email: adminData.email });
    console.log('Cleared existing admin with email:', adminData.email);

    //const hashedPassword = await bcrypt.hash(adminData.password, 10);

    const admin = new Admin({
      username: adminData.username,
      email: adminData.email,
      password: adminData.password,
    });

    await admin.save();
    console.log('Admin created successfully:', {
      username: admin.username,
      email: admin.email,
    });
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

addAdmin();