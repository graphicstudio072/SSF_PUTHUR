const Unit = require('../models/Unit');
const Setting = require('../models/Setting');
const Candidate = require('../models/Candidate');

const DEFAULT_UNITS = [
  { name: 'Puthur', code: 'PT-01' },
  { name: 'Kaniyarkandam', code: 'PT-02' },
  { name: 'Kulathakkara', code: 'PT-03' },
  { name: 'Mattumannil', code: 'PT-04' },
  { name: 'Rayarukandy', code: 'PT-05' },
  { name: 'Nadammalpoyil', code: 'PT-06' },
  { name: 'Jaramkandy', code: 'PT-07' },
];

const seedDatabase = async () => {
  try {
    // 1. Seed 7 Units if none exist
    const unitCount = await Unit.countDocuments();
    if (unitCount === 0) {
      console.log('🌱 Seeding initial 7 Units for SSF Puthur Sector...');
      await Unit.insertMany(DEFAULT_UNITS);
      console.log('✅ 7 Sector Units seeded successfully.');
    }

    // 2. Seed Default Settings if none exist
    const settingCount = await Setting.countDocuments();
    if (settingCount === 0) {
      console.log('🌱 Seeding default event & branding settings...');
      const defaultSetting = new Setting({
        eventName: 'SSF PUTHUR SECTOR SAHITYOTSAV & REPRESENTATIVE MEET 2026',
        eventSubtitle: 'Sunni Students Federation • Puthur Sector Council',
        eventTheme: 'Moral Revolution for Social Reformation',
        eventDate: 'Sunday, 15 December 2026',
        eventTime: '09:00 AM - 05:00 PM',
        venue: 'Town Hall, Puthur, Dakshina Kannada',
        sectorName: 'SSF PUTHUR SECTOR',
        theme: 'white-green',
        adminPin: process.env.ADMIN_PIN || '7860',
        contactPhone: '+91 97400 00000',
        contactEmail: 'ssfputhursector@gmail.com',
      });
      await defaultSetting.save();
      console.log('✅ Default settings seeded successfully.');
    }

    // 3. Seed initial demo candidates if table is empty
    const candidateCount = await Candidate.countDocuments();
    if (candidateCount === 0) {
      console.log('🌱 Seeding sample candidates for initial demonstration...');
      const sampleCandidates = [
        {
          name: 'Mohammed Fayis P.K',
          phone: '9845112233',
          unit: 'Parladka',
          ticketId: 'SSF-PUT-100201',
          attended: true,
          checkInTime: new Date(Date.now() - 3600000 * 2),
        },
        {
          name: 'Ahmed Shafi',
          phone: '9845223344',
          unit: 'Puthur Town',
          ticketId: 'SSF-PUT-100202',
          attended: true,
          checkInTime: new Date(Date.now() - 3600000 * 1.5),
        },
        {
          name: 'Musthafa Bannur',
          phone: '9845334455',
          unit: 'Bannur',
          ticketId: 'SSF-PUT-100203',
          attended: false,
          checkInTime: null,
        },
        {
          name: 'Zubair Kombam',
          phone: '9845445566',
          unit: 'Kombam',
          ticketId: 'SSF-PUT-100204',
          attended: false,
          checkInTime: null,
        },
        {
          name: 'Ibrahim Mukve',
          phone: '9845556677',
          unit: 'Mukve',
          ticketId: 'SSF-PUT-100205',
          attended: true,
          checkInTime: new Date(Date.now() - 3600000 * 0.5),
        },
      ];
      await Candidate.insertMany(sampleCandidates);
      console.log('✅ Sample candidates seeded.');
    }
  } catch (error) {
    console.error('❌ Error during database seeding:', error.message);
  }
};

module.exports = seedDatabase;
