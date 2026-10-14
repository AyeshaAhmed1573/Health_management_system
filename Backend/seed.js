import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

import User from './Models/User.model.js';
import Vendor from './Models/Vendor.model.js';
import VendorStaff from './Models/VendorStaff.model.js';
import Product from './Models/Product.model.js';
import LabTest from './Models/LabTest.model.js';
import LabPackage from './Models/LabPackage.model.js';
import Commission from './Models/Commission.model.js';
import PatientProfile from './Models/PatientProfile.model.js';

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/health-management');
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({ role: { $in: ['super_admin', 'vendor_owner', 'vendor_staff'] } });
    await Vendor.deleteMany({});
    await VendorStaff.deleteMany({});
    await Product.deleteMany({});
    await LabTest.deleteMany({});
    await LabPackage.deleteMany({});
    await Commission.deleteMany({});
    console.log('Data cleared');

    // Create Super Admin
    console.log('Creating Super Admin...');
    const superAdminPassword = await bcrypt.hash('Admin@123', 10);
    const superAdmin = await User.create({
      name: 'Super Admin',
      email: 'superadmin@health.com',
      passwordHash: superAdminPassword,
      role: 'super_admin',
      isVerified: true,
    });
    console.log('Super Admin created:', superAdmin.email);

    // Create default commission settings
    console.log('Creating commission settings...');
    await Commission.create({
      vendorType: 'pharmacy',
      rate: 15,
      isDefault: true,
      effectiveFrom: new Date(),
    });
    await Commission.create({
      vendorType: 'laboratory',
      rate: 12,
      isDefault: true,
      effectiveFrom: new Date(),
    });
    console.log('Commission settings created');

    // Create Pharmacy Vendors
    console.log('Creating Pharmacy Vendors...');
    const pharmacy1Password = await bcrypt.hash('Pharmacy1@123', 10);
    const pharmacy1User = await User.create({
      name: 'John Pharmacy Owner',
      email: 'pharmacy1@health.com',
      passwordHash: pharmacy1Password,
      phone: '+1234567890',
      role: 'vendor_owner',
      isVerified: true,
    });

    const pharmacy1 = await Vendor.create({
      ownerUserId: pharmacy1User._id,
      businessName: 'City Care Pharmacy',
      type: 'pharmacy',
      licenseNumber: 'PHARM-001',
      description: 'Full-service pharmacy with home delivery',
      address: {
        street: '123 Main Street',
        city: 'New York',
        province: 'NY',
        postalCode: '10001',
      },
      city: 'New York',
      serviceArea: ['Manhattan', 'Brooklyn', 'Queens'],
      contactInfo: {
        phone: '+1234567890',
        email: 'info@citycare.com',
      },
      operatingHours: {
        monday: { open: '08:00', close: '20:00', closed: false },
        tuesday: { open: '08:00', close: '20:00', closed: false },
        wednesday: { open: '08:00', close: '20:00', closed: false },
        thursday: { open: '08:00', close: '20:00', closed: false },
        friday: { open: '08:00', close: '20:00', closed: false },
        saturday: { open: '09:00', close: '18:00', closed: false },
        sunday: { open: '10:00', close: '16:00', closed: false },
      },
      status: 'approved',
      deliveryAvailable: true,
      deliveryAreas: [
        { area: 'Manhattan', charge: 5 },
        { area: 'Brooklyn', charge: 7 },
        { area: 'Queens', charge: 8 },
      ],
      approvedAt: new Date(),
      approvedBy: superAdmin._id,
      rating: { average: 4.5, count: 120 },
    });

    await User.findByIdAndUpdate(pharmacy1User._id, { vendorId: pharmacy1._id });
    console.log('Pharmacy 1 created:', pharmacy1.businessName);

    // Create Pharmacy 2
    const pharmacy2Password = await bcrypt.hash('Pharmacy2@123', 10);
    const pharmacy2User = await User.create({
      name: 'Sarah Pharmacy Owner',
      email: 'pharmacy2@health.com',
      passwordHash: pharmacy2Password,
      phone: '+1234567891',
      role: 'vendor_owner',
      isVerified: true,
    });

    const pharmacy2 = await Vendor.create({
      ownerUserId: pharmacy2User._id,
      businessName: 'Health Plus Pharmacy',
      type: 'pharmacy',
      licenseNumber: 'PHARM-002',
      description: '24/7 pharmacy with emergency services',
      address: {
        street: '456 Oak Avenue',
        city: 'Los Angeles',
        province: 'CA',
        postalCode: '90001',
      },
      city: 'Los Angeles',
      serviceArea: ['Downtown', 'Hollywood', 'Beverly Hills'],
      contactInfo: {
        phone: '+1234567891',
        email: 'info@healthplus.com',
      },
      operatingHours: {
        monday: { open: '00:00', close: '23:59', closed: false },
        tuesday: { open: '00:00', close: '23:59', closed: false },
        wednesday: { open: '00:00', close: '23:59', closed: false },
        thursday: { open: '00:00', close: '23:59', closed: false },
        friday: { open: '00:00', close: '23:59', closed: false },
        saturday: { open: '00:00', close: '23:59', closed: false },
        sunday: { open: '00:00', close: '23:59', closed: false },
      },
      status: 'approved',
      deliveryAvailable: true,
      deliveryAreas: [
        { area: 'Downtown', charge: 6 },
        { area: 'Hollywood', charge: 8 },
      ],
      approvedAt: new Date(),
      approvedBy: superAdmin._id,
      rating: { average: 4.8, count: 200 },
    });

    await User.findByIdAndUpdate(pharmacy2User._id, { vendorId: pharmacy2._id });
    console.log('Pharmacy 2 created:', pharmacy2.businessName);

    // Create Laboratory Vendors
    console.log('Creating Laboratory Vendors...');
    const lab1Password = await bcrypt.hash('Lab1@123', 10);
    const lab1User = await User.create({
      name: 'Dr. Mike Lab Owner',
      email: 'lab1@health.com',
      passwordHash: lab1Password,
      phone: '+1234567892',
      role: 'vendor_owner',
      isVerified: true,
    });

    const lab1 = await Vendor.create({
      ownerUserId: lab1User._id,
      businessName: 'Central Diagnostic Lab',
      type: 'laboratory',
      licenseNumber: 'LAB-001',
      description: 'State-of-the-art diagnostic laboratory',
      address: {
        street: '789 Medical Center Drive',
        city: 'Chicago',
        province: 'IL',
        postalCode: '60601',
      },
      city: 'Chicago',
      serviceArea: ['Chicago', 'Evanston', 'Oak Park'],
      contactInfo: {
        phone: '+1234567892',
        email: 'info@centrallab.com',
      },
      operatingHours: {
        monday: { open: '06:00', close: '22:00', closed: false },
        tuesday: { open: '06:00', close: '22:00', closed: false },
        wednesday: { open: '06:00', close: '22:00', closed: false },
        thursday: { open: '06:00', close: '22:00', closed: false },
        friday: { open: '06:00', close: '22:00', closed: false },
        saturday: { open: '07:00', close: '18:00', closed: false },
        sunday: { open: '08:00', close: '14:00', closed: false },
      },
      status: 'approved',
      homeCollectionAvailable: true,
      homeCollectionFee: 15,
      approvedAt: new Date(),
      approvedBy: superAdmin._id,
      rating: { average: 4.7, count: 150 },
    });

    await User.findByIdAndUpdate(lab1User._id, { vendorId: lab1._id });
    console.log('Laboratory 1 created:', lab1.businessName);

    // Create Lab 2
    const lab2Password = await bcrypt.hash('Lab2@123', 10);
    const lab2User = await User.create({
      name: 'Dr. Lisa Lab Owner',
      email: 'lab2@health.com',
      passwordHash: lab2Password,
      phone: '+1234567893',
      role: 'vendor_owner',
      isVerified: true,
    });

    const lab2 = await Vendor.create({
      ownerUserId: lab2User._id,
      businessName: 'Precision Pathology Lab',
      type: 'laboratory',
      licenseNumber: 'LAB-002',
      description: 'Specialized pathology and genetics testing',
      address: {
        street: '321 Science Park',
        city: 'Boston',
        province: 'MA',
        postalCode: '02101',
      },
      city: 'Boston',
      serviceArea: ['Boston', 'Cambridge', 'Somerville'],
      contactInfo: {
        phone: '+1234567893',
        email: 'info@precisionlab.com',
      },
      operatingHours: {
        monday: { open: '07:00', close: '20:00', closed: false },
        tuesday: { open: '07:00', close: '20:00', closed: false },
        wednesday: { open: '07:00', close: '20:00', closed: false },
        thursday: { open: '07:00', close: '20:00', closed: false },
        friday: { open: '07:00', close: '20:00', closed: false },
        saturday: { open: '08:00', close: '16:00', closed: false },
        sunday: { open: 'closed', closed: true },
      },
      status: 'approved',
      homeCollectionAvailable: true,
      homeCollectionFee: 20,
      approvedAt: new Date(),
      approvedBy: superAdmin._id,
      rating: { average: 4.9, count: 180 },
    });

    await User.findByIdAndUpdate(lab2User._id, { vendorId: lab2._id });
    console.log('Laboratory 2 created:', lab2.businessName);

    // Create Sample Products for Pharmacy 1
    console.log('Creating sample products...');
    const sampleProducts = [
      {
        vendorId: pharmacy1._id,
        name: 'Paracetamol 500mg',
        genericName: 'Acetaminophen',
        category: 'Pain Relief',
        subcategory: 'Analgesics',
        description: 'For relief of mild to moderate pain and fever',
        manufacturer: 'PharmaCorp',
        price: 5.99,
        mrp: 7.50,
        discountPercent: 20,
        stock: 500,
        lowStockThreshold: 50,
        batchNumber: 'BATCH-001',
        expiryDate: new Date('2025-12-31'),
        prescriptionRequired: false,
        dosageForm: 'tablet',
        strength: '500mg',
        requiresPrescription: false,
      },
      {
        vendorId: pharmacy1._id,
        name: 'Amoxicillin 250mg',
        genericName: 'Amoxicillin',
        category: 'Antibiotics',
        subcategory: 'Penicillins',
        description: 'Broad-spectrum antibiotic for bacterial infections',
        manufacturer: 'MediLife',
        price: 12.99,
        mrp: 15.00,
        discountPercent: 13,
        stock: 200,
        lowStockThreshold: 30,
        batchNumber: 'BATCH-002',
        expiryDate: new Date('2025-06-30'),
        prescriptionRequired: true,
        dosageForm: 'capsule',
        strength: '250mg',
        requiresPrescription: true,
      },
      {
        vendorId: pharmacy1._id,
        name: 'Omeprazole 20mg',
        genericName: 'Omeprazole',
        category: 'Gastric',
        subcategory: 'PPI',
        description: 'For treatment of acid reflux and heartburn',
        manufacturer: 'GastroHealth',
        price: 8.99,
        mrp: 10.00,
        discountPercent: 10,
        stock: 350,
        lowStockThreshold: 40,
        batchNumber: 'BATCH-003',
        expiryDate: new Date('2026-03-15'),
        prescriptionRequired: false,
        dosageForm: 'capsule',
        strength: '20mg',
        requiresPrescription: false,
      },
    ];

    await Product.insertMany(sampleProducts);
    console.log('Sample products created');

    // Create Sample Products for Pharmacy 2
    const sampleProducts2 = [
      {
        vendorId: pharmacy2._id,
        name: 'Ibuprofen 400mg',
        genericName: 'Ibuprofen',
        category: 'Pain Relief',
        subcategory: 'NSAIDs',
        description: 'Anti-inflammatory for pain and swelling',
        manufacturer: 'PainRelief Inc',
        price: 6.49,
        mrp: 8.00,
        discountPercent: 19,
        stock: 400,
        lowStockThreshold: 50,
        batchNumber: 'BATCH-004',
        expiryDate: new Date('2025-09-30'),
        prescriptionRequired: false,
        dosageForm: 'tablet',
        strength: '400mg',
        requiresPrescription: false,
      },
      {
        vendorId: pharmacy2._id,
        name: 'Metformin 500mg',
        genericName: 'Metformin',
        category: 'Diabetes',
        subcategory: 'Oral Hypoglycemics',
        description: 'For type 2 diabetes management',
        manufacturer: 'DiaCare',
        price: 15.99,
        mrp: 18.00,
        discountPercent: 11,
        stock: 250,
        lowStockThreshold: 35,
        batchNumber: 'BATCH-005',
        expiryDate: new Date('2026-01-20'),
        prescriptionRequired: true,
        dosageForm: 'tablet',
        strength: '500mg',
        requiresPrescription: true,
      },
    ];

    await Product.insertMany(sampleProducts2);
    console.log('Sample products for Pharmacy 2 created');

    // Create Sample Lab Tests for Lab 1
    console.log('Creating sample lab tests...');
    const sampleLabTests = [
      {
        vendorId: lab1._id,
        name: 'Complete Blood Count (CBC)',
        code: 'CBC-001',
        category: 'CBC',
        subcategory: 'Hematology',
        description: 'Complete blood count with differential',
        sampleType: 'blood',
        preparationInstructions: 'No special preparation required',
        fastingRequired: false,
        turnaroundHours: 24,
        price: 25.00,
        homeCollectionAvailable: true,
        homeCollectionFee: 10,
        parameters: [
          { name: 'Hemoglobin', unit: 'g/dL' },
          { name: 'WBC Count', unit: 'cells/μL' },
          { name: 'Platelet Count', unit: 'cells/μL' },
        ],
      },
      {
        vendorId: lab1._id,
        name: 'HbA1c Test',
        code: 'HBA1C-001',
        category: 'HbA1c',
        subcategory: 'Diabetes',
        description: 'Glycated hemoglobin for diabetes monitoring',
        sampleType: 'blood',
        preparationInstructions: 'No fasting required',
        fastingRequired: false,
        turnaroundHours: 48,
        price: 35.00,
        homeCollectionAvailable: true,
        homeCollectionFee: 10,
        parameters: [
          { name: 'HbA1c', unit: '%' },
        ],
      },
      {
        vendorId: lab1._id,
        name: 'Lipid Profile',
        code: 'LIPID-001',
        category: 'Lipid Profile',
        subcategory: 'Cardiac',
        description: 'Cholesterol and triglycerides panel',
        sampleType: 'blood',
        preparationInstructions: 'Fast for 10-12 hours before test',
        fastingRequired: true,
        fastingHours: 12,
        turnaroundHours: 24,
        price: 40.00,
        homeCollectionAvailable: true,
        homeCollectionFee: 10,
        parameters: [
          { name: 'Total Cholesterol', unit: 'mg/dL' },
          { name: 'HDL', unit: 'mg/dL' },
          { name: 'LDL', unit: 'mg/dL' },
          { name: 'Triglycerides', unit: 'mg/dL' },
        ],
      },
    ];

    await LabTest.insertMany(sampleLabTests);
    console.log('Sample lab tests created');

    // Create Sample Lab Tests for Lab 2
    const sampleLabTests2 = [
      {
        vendorId: lab2._id,
        name: 'Thyroid Panel',
        code: 'THYROID-001',
        category: 'Thyroid Profile',
        subcategory: 'Endocrinology',
        description: 'Complete thyroid function test',
        sampleType: 'blood',
        preparationInstructions: 'No special preparation required',
        fastingRequired: false,
        turnaroundHours: 48,
        price: 55.00,
        homeCollectionAvailable: true,
        homeCollectionFee: 15,
        parameters: [
          { name: 'TSH', unit: 'mIU/L' },
          { name: 'T3', unit: 'ng/dL' },
          { name: 'T4', unit: 'μg/dL' },
        ],
      },
      {
        vendorId: lab2._id,
        name: 'Liver Function Test',
        code: 'LFT-001',
        category: 'Liver Function Test',
        subcategory: 'Hepatology',
        description: 'Complete liver panel',
        sampleType: 'blood',
        preparationInstructions: 'Fast for 10-12 hours before test',
        fastingRequired: true,
        fastingHours: 12,
        turnaroundHours: 24,
        price: 45.00,
        homeCollectionAvailable: true,
        homeCollectionFee: 15,
        parameters: [
          { name: 'ALT', unit: 'U/L' },
          { name: 'AST', unit: 'U/L' },
          { name: 'Bilirubin', unit: 'mg/dL' },
        ],
      },
    ];

    await LabTest.insertMany(sampleLabTests2);
    console.log('Sample lab tests for Lab 2 created');

    // Create Sample Lab Package for Lab 1
    console.log('Creating sample lab packages...');
    const sampleLabPackage = await LabPackage.create({
      vendorId: lab1._id,
      name: 'Annual Health Checkup Package',
      code: 'PKG-001',
      description: 'Comprehensive health screening package',
      tests: [
        {
          testId: sampleLabTests[0]._id,
          testName: 'Complete Blood Count (CBC)',
          includedPrice: 25.00,
        },
        {
          testId: sampleLabTests[1]._id,
          testName: 'HbA1c Test',
          includedPrice: 35.00,
        },
        {
          testId: sampleLabTests[2]._id,
          testName: 'Lipid Profile',
          includedPrice: 40.00,
        },
      ],
      totalPrice: 85.00,
      originalPrice: 100.00,
      discountPercent: 15,
      sampleType: 'blood',
      preparationInstructions: 'Fast for 12 hours before test',
      fastingRequired: true,
      fastingHours: 12,
      turnaroundHours: 48,
      homeCollectionAvailable: true,
      homeCollectionFee: 10,
    });
    console.log('Sample lab package created');

    // Create Sample Patients
    console.log('Creating sample patients...');
    const patient1Password = await bcrypt.hash('Patient1@123', 10);
    const patient1 = await User.create({
      name: 'Alice Johnson',
      email: 'patient1@health.com',
      passwordHash: patient1Password,
      phone: '+1234567894',
      role: 'patient',
      isVerified: true,
    });

    const patient1Profile = await PatientProfile.create({
      userId: patient1._id,
      name: 'Alice Johnson',
      relationship: 'self',
      gender: 'female',
      dateOfBirth: new Date('1990-05-15'),
      bloodGroup: 'A+',
    });

    const patient2Password = await bcrypt.hash('Patient2@123', 10);
    const patient2 = await User.create({
      name: 'Bob Smith',
      email: 'patient2@health.com',
      passwordHash: patient2Password,
      phone: '+1234567895',
      role: 'patient',
      isVerified: true,
    });

    const patient2Profile = await PatientProfile.create({
      userId: patient2._id,
      name: 'Bob Smith',
      relationship: 'self',
      gender: 'male',
      dateOfBirth: new Date('1985-08-20'),
      bloodGroup: 'O+',
    });

    console.log('Sample patients created');

    console.log('\n=== SEEDING COMPLETE ===');
    console.log('\nCREDENTIALS:');
    console.log('Super Admin: superadmin@health.com / Admin@123');
    console.log('Pharmacy 1: pharmacy1@health.com / Pharmacy1@123');
    console.log('Pharmacy 2: pharmacy2@health.com / Pharmacy2@123');
    console.log('Lab 1: lab1@health.com / Lab1@123');
    console.log('Lab 2: lab2@health.com / Lab2@123');
    console.log('Patient 1: patient1@health.com / Patient1@123');
    console.log('Patient 2: patient2@health.com / Patient2@123');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();
