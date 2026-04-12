#!/usr/bin/env node
// backend/artillery-setup.js
// Seeds a test user + project in the running DB and prints
// the JWT token + project Id needed for the Artillery performance test.
// Run: node artillery-setup.js

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcrypt');
const jwt      = require('jsonwebtoken');
const fs       = require('fs');
const path     = require('path');

const User    = require('./src/models/User');
const Project = require('./src/models/Project');

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Clean up old perf-test seed if exists
  await User.deleteOne({ email: 'perf-test@artillery.dev' });

  const hash = await bcrypt.hash('Artillery123!', 10);
  const user = await User.create({
    name: 'Artillery Perf Test',
    email: 'perf-test@artillery.dev',
    password: hash,
    role: 'CONTRACTOR',
    isVerified: true,
  });

  let project = await Project.findOne({ createdBy: user._id });
  if (!project) {
    project = await Project.create({
      title: 'Artillery Load Test Project',
      projectType: 'bridge',
      location: { address: 'Colombo, Sri Lanka', lat: 6.9271, lng: 79.8612 },
      createdBy: user._id,
    });
    console.log('✅ Test project created');
  } else {
    console.log('✅ Reusing existing project');
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '2h' });

  console.log('\n─────────────────────────────────────────');
  console.log('JWT Token  :', token);
  console.log('Project ID :', project._id.toString());
  console.log('─────────────────────────────────────────\n');

  // Auto-patch the artillery YAML
  const ymlPath = path.join(__dirname, 'artillery.mitigation.yml');
  let yml = fs.readFileSync(ymlPath, 'utf8');
  yml = yml.replace(/authToken:.*"[^"]*"/, `authToken: "${token}"`);
  yml = yml.replace(/projectId:.*"[^"]*"/, `projectId: "${project._id}"`);
  fs.writeFileSync(ymlPath, yml);
  console.log('✅ artillery.mitigation.yml updated with real token and project ID');
  console.log('   Run: npm run test:performance\n');

  await mongoose.disconnect();
}

main().catch(err => {
  console.error('❌ Setup failed:', err.message);
  process.exit(1);
});
