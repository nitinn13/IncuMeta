const mongoose = require('mongoose');
const {Schema} = mongoose;

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String },
    // role: { type: String, enum: ['startup', 'incubator'], required: true },
  
    // Startup-specific fields
    industry: { type: String },
    fundingStage: { type: String, enum: ['Ideation', 'Pre-Seed', 'Seed', 'Series A', 'Series B', 'Growth'] },
    revenue: { type: Number },
    teamSize: { type: Number },
  
    // Approval status (Only for startups)
    isApproved: { type: Boolean, default: false },
  
    createdAt: { type: Date, default: Date.now }
  });
  

const adminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  });


  const AnnouncementSchema = new mongoose.Schema({
    title: { type: String, required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  });

  const EventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    // date: { type: Date, required: true },
    location: { type: String },
    createdAt: { type: Date, default: Date.now }
  });



const userModel = mongoose.model('users', userSchema);
const adminModel = mongoose.model('admins', adminSchema);
const announcementModel = mongoose.model('announcements', AnnouncementSchema);
const eventModel = mongoose.model('events', EventSchema);

module.exports = {
    userModel,
    adminModel,
    announcementModel,
    eventModel
}