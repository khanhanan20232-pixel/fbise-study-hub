const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

const prisma = new PrismaClient();

// Helper to create a realistic FBISE PDF Past Paper
async function generateSamplePdf(filePath, title, subject, classGrade, year, session) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    const { width, height } = page.getSize();

    // Top Header Board Title
    page.drawText('FEDERAL BOARD OF INTERMEDIATE AND SECONDARY EDUCATION', {
      x: 40,
      y: height - 50,
      size: 13,
      font: fontBold,
      color: rgb(0.04, 0.3, 0.15), // Deep FBISE Green
    });

    page.drawText('H-8/4, ISLAMABAD, PAKISTAN — WWW.FBISE.EDU.PK', {
      x: 160,
      y: height - 68,
      size: 9,
      font: fontRegular,
      color: rgb(0.3, 0.3, 0.3),
    });

    // Horizontal Rule
    page.drawLine({
      start: { x: 40, y: height - 76 },
      end: { x: width - 40, y: height - 76 },
      thickness: 1.5,
      color: rgb(0.04, 0.3, 0.15),
    });

    // Exam Title & Details
    const classLabel = classGrade === '9' ? 'SSC-I (Class 9)' : classGrade === '10' ? 'SSC-II (Class 10)' : classGrade === '11' ? 'HSSC-I (Class 11)' : 'HSSC-II (Class 12)';
    page.drawText(`${subject.toUpperCase()} — ${session.toUpperCase()} EXAMINATION ${year}`, {
      x: 40,
      y: height - 98,
      size: 12,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.1),
    });

    page.drawText(`Class: ${classLabel}  |  Time Allowed: 3 Hours  |  Maximum Marks: 85`, {
      x: 40,
      y: height - 114,
      size: 10,
      font: fontRegular,
      color: rgb(0.2, 0.2, 0.2),
    });

    // Candidate Roll Number Box
    page.drawRectangle({
      x: width - 210,
      y: height - 120,
      width: 170,
      height: 24,
      borderColor: rgb(0.4, 0.4, 0.4),
      borderWidth: 1,
    });
    page.drawText('Roll No: [                     ]', {
      x: width - 200,
      y: height - 105,
      size: 9,
      font: fontBold,
      color: rgb(0.3, 0.3, 0.3),
    });

    // Instructions Box
    page.drawRectangle({
      x: 40,
      y: height - 165,
      width: width - 80,
      height: 36,
      color: rgb(0.96, 0.98, 0.96),
      borderColor: rgb(0.8, 0.88, 0.8),
      borderWidth: 1,
    });
    page.drawText('GENERAL INSTRUCTIONS FOR STUDENTS:', {
      x: 48,
      y: height - 142,
      size: 8.5,
      font: fontBold,
      color: rgb(0.04, 0.3, 0.15),
    });
    page.drawText('1. Answer Section-A on the OMR sheet.  2. Write neat answers for Section-B & C on the answer book.', {
      x: 48,
      y: height - 156,
      size: 8,
      font: fontRegular,
      color: rgb(0.25, 0.25, 0.25),
    });

    // SECTION A
    page.drawText('SECTION — A (Marks: 12 / 17)', {
      x: 40,
      y: height - 190,
      size: 11,
      font: fontBold,
      color: rgb(0.04, 0.3, 0.15),
    });

    const sampleMcqs = [
      'Q1. Choose the correct option for each of the following statements:',
      '  (i) Which of the following is a fundamental base quantity in SI system?',
      '      A) Velocity        B) Force        C) Electric Current        D) Acceleration',
      '  (ii) The rate of change of momentum is equal to:',
      '      A) Torque          B) Applied Force C) Kinetic Energy         D) Impulse',
      '  (iii) According to Boyle's Law, at constant temperature, pressure is inversely proportional to:',
      '      A) Mass            B) Volume       C) Density                 D) Molecular weight',
    ];

    let currentY = height - 208;
    for (const mcq of sampleMcqs) {
      page.drawText(mcq, {
        x: 45,
        y: currentY,
        size: 9,
        font: fontRegular,
        color: rgb(0.15, 0.15, 0.15),
      });
      currentY -= 15;
    }

    // SECTION B
    currentY -= 10;
    page.drawText('SECTION — B (Marks: 33 / 42) — Short Questions', {
      x: 40,
      y: currentY,
      size: 11,
      font: fontBold,
      color: rgb(0.04, 0.3, 0.15),
    });
    currentY -= 16;
    page.drawText('Note: Attempt any ELEVEN parts from the following. All parts carry equal marks (3 marks each).', {
      x: 40,
      y: currentY,
      size: 8.5,
      font: fontOblique,
      color: rgb(0.4, 0.4, 0.4),
    });

    const sampleShorts = [
      'Q2. (i) Differentiate between vector and scalar quantities with two FBISE syllabus examples.',
      '    (ii) Derive the second equation of motion s = vit + 1/2 at^2 using a speed-time graph.',
      '    (iii) State Newton's Third Law of Motion. Why do action and reaction forces not cancel each other?',
      '    (iv) What is meant by centripetal force? Write down its mathematical formula and SI unit.',
      '    (v) Calculate the work done in lifting a 50 kg mass vertically through a height of 10 meters.',
      '    (vi) State Pascal's principle and illustrate its application in hydraulic brake systems.',
    ];

    currentY -= 16;
    for (const sq of sampleShorts) {
      page.drawText(sq, {
        x: 45,
        y: currentY,
        size: 9,
        font: fontRegular,
        color: rgb(0.15, 0.15, 0.15),
      });
      currentY -= 16;
    }

    // SECTION C
    currentY -= 10;
    page.drawText('SECTION — C (Marks: 20 / 26) — Descriptive Long Questions', {
      x: 40,
      y: currentY,
      size: 11,
      font: fontBold,
      color: rgb(0.04, 0.3, 0.15),
    });
    currentY -= 16;
    page.drawText('Note: Attempt any TWO questions. All questions carry equal marks (10 marks each).', {
      x: 40,
      y: currentY,
      size: 8.5,
      font: fontOblique,
      color: rgb(0.4, 0.4, 0.4),
    });

    const sampleLongs = [
      'Q3. (a) State and explain Law of Conservation of Momentum with the help of a mathematical derivation. (6)',
      '    (b) A car traveling at 72 km/h decelerates uniformly and comes to rest in 5 seconds. Find distance. (4)',
      'Q4. (a) Describe the working principle and construction of a compound microscope with a neat ray diagram. (6)',
      '    (b) Explain total internal reflection and calculate critical angle for glass-air interface. (4)',
    ];

    currentY -= 16;
    for (const lq of sampleLongs) {
      page.drawText(lq, {
        x: 45,
        y: currentY,
        size: 8.8,
        font: fontRegular,
        color: rgb(0.15, 0.15, 0.15),
      });
      currentY -= 16;
    }

    // Footer Watermark & Credit
    page.drawLine({
      start: { x: 40, y: 50 },
      end: { x: width - 40, y: 50 },
      thickness: 1,
      color: rgb(0.85, 0.85, 0.85),
    });
    page.drawText('FBISE Study Hub — Prepare Smart. Practice Better. Achieve More.', {
      x: 40,
      y: 36,
      size: 8,
      font: fontRegular,
      color: rgb(0.4, 0.4, 0.4),
    });
    page.drawText('Developed by Team Khan Hanan', {
      x: width - 180,
      y: 36,
      size: 8,
      font: fontBold,
      color: rgb(0.04, 0.3, 0.15),
    });

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(filePath, pdfBytes);
    return true;
  } catch (err) {
    console.error('Error generating PDF:', err);
    return false;
  }
}

async function main() {
  console.log('Seeding FBISE Study Hub Database...');

  // Ensure directories
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'papers');
  const subsDir = path.join(process.cwd(), 'public', 'uploads', 'submissions');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  if (!fs.existsSync(subsDir)) fs.mkdirSync(subsDir, { recursive: true });

  // 1. Create Admin User
  const adminPasswordHash = await bcrypt.hash('AdminPassword123!', 10);
  const studentPasswordHash = await bcrypt.hash('StudentPassword123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@fbise.edu.pk' },
    update: {},
    create: {
      name: 'FBISE Administrator',
      email: 'admin@fbise.edu.pk',
      password: adminPasswordHash,
      role: 'ADMIN',
      className: '12',
      phone: '+92 51 9269555',
      streak: 15,
    },
  });

  // 2. Create Students for each Class
  const student9 = await prisma.user.upsert({
    where: { email: 'student9@fbise.edu.pk' },
    update: {},
    create: {
      name: 'Ahmad Raza (Class 9)',
      email: 'student9@fbise.edu.pk',
      password: studentPasswordHash,
      role: 'STUDENT',
      className: '9',
      phone: '+92 300 1234567',
      streak: 5,
    },
  });

  const student10 = await prisma.user.upsert({
    where: { email: 'student10@fbise.edu.pk' },
    update: {},
    create: {
      name: 'Ayesha Fatima (Class 10)',
      email: 'student10@fbise.edu.pk',
      password: studentPasswordHash,
      role: 'STUDENT',
      className: '10',
      phone: '+92 301 2345678',
      streak: 7,
    },
  });

  const student11 = await prisma.user.upsert({
    where: { email: 'student11@fbise.edu.pk' },
    update: {},
    create: {
      name: 'Hamza Tariq (1st Year)',
      email: 'student11@fbise.edu.pk',
      password: studentPasswordHash,
      role: 'STUDENT',
      className: '11',
      phone: '+92 302 3456789',
      streak: 9,
    },
  });

  const student12 = await prisma.user.upsert({
    where: { email: 'student12@fbise.edu.pk' },
    update: {},
    create: {
      name: 'Zainab Bibi (2nd Year)',
      email: 'student12@fbise.edu.pk',
      password: studentPasswordHash,
      role: 'STUDENT',
      className: '12',
      phone: '+92 303 4567890',
      streak: 12,
    },
  });

  const leadScholar = await prisma.user.upsert({
    where: { email: 'khan.hanan@student.fbise.edu.pk' },
    update: {},
    create: {
      name: 'Khan Hanan (Top Scholar)',
      email: 'khan.hanan@student.fbise.edu.pk',
      password: studentPasswordHash,
      role: 'STUDENT',
      className: '12',
      phone: '+92 345 9876543',
      streak: 21,
    },
  });

  console.log('Seeded Users: Admin and Students.');

  // 3. Seed Past Papers and Model Papers
  const papersData = [
    // Class 9 Papers
    { title: 'Physics SSC-I Annual 2024', classGrade: '9', subject: 'Physics', year: 2024, session: 'Annual', paperType: 'PAST_PAPER', fileName: 'physics_9_2024_annual.pdf', fileSize: '1.4 MB' },
    { title: 'Physics SSC-I Model Paper 2024 (SLO Based)', classGrade: '9', subject: 'Physics', year: 2024, session: 'Annual', paperType: 'MODEL_PAPER', fileName: 'physics_9_model_2024.pdf', fileSize: '1.8 MB' },
    { title: 'Mathematics SSC-I Annual 2024', classGrade: '9', subject: 'Mathematics', year: 2024, session: 'Annual', paperType: 'PAST_PAPER', fileName: 'math_9_2024_annual.pdf', fileSize: '1.2 MB' },
    { title: 'Chemistry SSC-I Annual 2023', classGrade: '9', subject: 'Chemistry', year: 2023, session: 'Annual', paperType: 'PAST_PAPER', fileName: 'chemistry_9_2023_annual.pdf', fileSize: '1.5 MB' },
    { title: 'Biology SSC-I Annual 2024', classGrade: '9', subject: 'Biology', year: 2024, session: 'Annual', paperType: 'PAST_PAPER', fileName: 'biology_9_2024_annual.pdf', fileSize: '1.6 MB' },
    { title: 'Computer Science SSC-I Annual 2024', classGrade: '9', subject: 'Computer Science', year: 2024, session: 'Annual', paperType: 'PAST_PAPER', fileName: 'cs_9_2024_annual.pdf', fileSize: '1.3 MB' },
    { title: 'English SSC-I Annual 2024', classGrade: '9', subject: 'English', year: 2024, session: 'Annual', paperType: 'PAST_PAPER', fileName: 'english_9_2024_annual.pdf', fileSize: '1.1 MB' },
    { title: 'Pakistan Studies SSC-I Annual 2024', classGrade: '9', subject: 'Pakistan Studies', year: 2024, session: 'Annual', paperType: 'PAST_PAPER', fileName: 'pakstudies_9_2024_annual.pdf', fileSize: '1.0 MB' },

    // Class 10 Papers
    { title: 'Physics SSC-II Annual 2024', classGrade: '10', subject: 'Physics', year: 2024, session: 'Annual', paperType: 'PAST_PAPER', fileName: 'physics_10_2024_annual.pdf', fileSize: '1.5 MB' },
    { title: 'Physics SSC-II Model Paper 2024 (SLO Based)', classGrade: '10', subject: 'Physics', year: 2024, session: 'Annual', paperType: 'MODEL_PAPER', fileName: 'physics_10_model_2024.pdf', fileSize: '1.9 MB' },
    { title: 'Mathematics SSC-II Annual 2024', classGrade: '10', subject: 'Mathematics', year: 2024, session: 'Annual', paperType: 'PAST_PAPER', fileName: 'math_10_2024_annual.pdf', fileSize: '1.3 MB' },
    { title: 'Chemistry SSC-II Annual 2024', classGrade: '10', subject: 'Chemistry', year: 2024, session: 'Annual', paperType: 'PAST_PAPER', fileName: 'chemistry_10_2024_annual.pdf', fileSize: '1.6 MB' },
    { title: 'Biology SSC-II Model Paper 2024', classGrade: '10', subject: 'Biology', year: 2024, session: 'Annual', paperType: 'MODEL_PAPER', fileName: 'biology_10_model_2024.pdf', fileSize: '1.7 MB' },
    { title: 'Computer Science SSC-II Annual 2024', classGrade: '10', subject: 'Computer Science', year: 2024, session: 'Annual', paperType: 'PAST_PAPER', fileName: 'cs_10_2024_annual.pdf', fileSize: '1.4 MB' },

    // 1st Year (Class 11) Papers
    { title: 'Physics HSSC-I Annual 2024', classGrade: '11', subject: 'Physics', year: 2024, session: 'Annual', paperType: 'PAST_PAPER', fileName: 'physics_11_2024_annual.pdf', fileSize: '1.7 MB' },
    { title: 'Physics HSSC-I Model Paper 2024', classGrade: '11', subject: 'Physics', year: 2024, session: 'Annual', paperType: 'MODEL_PAPER', fileName: 'physics_11_model_2024.pdf', fileSize: '2.1 MB' },
    { title: 'Mathematics HSSC-I Annual 2024', classGrade: '11', subject: 'Mathematics', year: 2024, session: 'Annual', paperType: 'PAST_PAPER', fileName: 'math_11_2024_annual.pdf', fileSize: '1.4 MB' },
    { title: 'Chemistry HSSC-I Annual 2024', classGrade: '11', subject: 'Chemistry', year: 2024, session: 'Annual', paperType: 'PAST_PAPER', fileName: 'chemistry_11_2024_annual.pdf', fileSize: '1.6 MB' },
    { title: 'Biology HSSC-I Annual 2024', classGrade: '11', subject: 'Biology', year: 2024, session: 'Annual', paperType: 'PAST_PAPER', fileName: 'biology_11_2024_annual.pdf', fileSize: '1.8 MB' },
    { title: 'Computer Science HSSC-I Annual 2024', classGrade: '11', subject: 'Computer Science', year: 2024, session: 'Annual', paperType: 'PAST_PAPER', fileName: 'cs_11_2024_annual.pdf', fileSize: '1.5 MB' },

    // 2nd Year (Class 12) Papers
    { title: 'Physics HSSC-II Annual 2024', classGrade: '12', subject: 'Physics', year: 2024, session: 'Annual', paperType: 'PAST_PAPER', fileName: 'physics_12_2024_annual.pdf', fileSize: '1.8 MB' },
    { title: 'Physics HSSC-II Model Paper 2024', classGrade: '12', subject: 'Physics', year: 2024, session: 'Annual', paperType: 'MODEL_PAPER', fileName: 'physics_12_model_2024.pdf', fileSize: '2.2 MB' },
    { title: 'Mathematics HSSC-II Annual 2024', classGrade: '12', subject: 'Mathematics', year: 2024, session: 'Annual', paperType: 'PAST_PAPER', fileName: 'math_12_2024_annual.pdf', fileSize: '1.5 MB' },
    { title: 'Chemistry HSSC-II Annual 2024', classGrade: '12', subject: 'Chemistry', year: 2024, session: 'Annual', paperType: 'PAST_PAPER', fileName: 'chemistry_12_2024_annual.pdf', fileSize: '1.7 MB' },
    { title: 'Biology HSSC-II Annual 2024', classGrade: '12', subject: 'Biology', year: 2024, session: 'Annual', paperType: 'PAST_PAPER', fileName: 'biology_12_2024_annual.pdf', fileSize: '1.9 MB' },
    { title: 'Pakistan Studies HSSC-II Annual 2024', classGrade: '12', subject: 'Pakistan Studies', year: 2024, session: 'Annual', paperType: 'PAST_PAPER', fileName: 'pakstudies_12_2024_annual.pdf', fileSize: '1.1 MB' },
  ];

  const seededPapers = [];
  for (const p of papersData) {
    const pdfPath = path.join(uploadsDir, p.fileName);
    if (!fs.existsSync(pdfPath)) {
      await generateSamplePdf(pdfPath, p.title, p.subject, p.classGrade, p.year, p.session);
    }

    const createdPaper = await prisma.paper.create({
      data: {
        title: p.title,
        classGrade: p.classGrade,
        subject: p.subject,
        year: p.year,
        session: p.session,
        paperType: p.paperType,
        fileUrl: `/uploads/papers/${p.fileName}`,
        fileSize: p.fileSize,
        downloadCount: Math.floor(Math.random() * 250) + 40,
        viewCount: Math.floor(Math.random() * 600) + 120,
      },
    });
    seededPapers.push(createdPaper);
  }
  console.log(`Seeded ${seededPapers.length} FBISE Past & Model Papers with authentic PDFs.`);

  // 4. Seed Quizzes with genuine FBISE MCQs
  const quizzesData = [
    // Class 9 Quiz
    {
      title: 'Daily Quiz: Physics Class 9 — Physical Quantities & Measurement',
      classGrade: '9',
      subject: 'Physics',
      chapter: 'Unit 1: Physical Quantities & Measurement',
      timeLimit: 600,
      questions: [
        {
          question: 'Which of the following is an SI base unit?',
          optionA: 'Newton',
          optionB: 'Pascal',
          optionC: 'Kelvin',
          optionD: 'Joule',
          correctOption: 'C',
          explanation: 'Kelvin (K) is the SI base unit for thermodynamic temperature. Newton, Pascal, and Joule are derived units.',
        },
        {
          question: 'The least count of a standard vernier calipers with 10 vernier divisions is:',
          optionA: '0.1 cm',
          optionB: '0.01 cm',
          optionC: '0.001 cm',
          optionD: '1.0 mm',
          correctOption: 'B',
          explanation: 'Least count = Smallest main scale division (1 mm) / Number of vernier divisions (10) = 0.1 mm = 0.01 cm.',
        },
        {
          question: 'The number of significant figures in 0.00580 is:',
          optionA: '2',
          optionB: '3',
          optionC: '5',
          optionD: '6',
          correctOption: 'B',
          explanation: 'Leading zeros before the first non-zero digit are not significant. 5, 8, and the trailing zero are significant, making 3 significant figures.',
        },
        {
          question: 'One femto is equivalent to:',
          optionA: '10^-12',
          optionB: '10^-15',
          optionC: '10^-18',
          optionD: '10^-9',
          correctOption: 'B',
          explanation: 'In the metric prefix system: nano = 10^-9, pico = 10^-12, femto = 10^-15, atto = 10^-18.',
        },
        {
          question: 'Screw gauge is used to measure accurately up to:',
          optionA: '0.1 mm',
          optionB: '0.01 mm',
          optionC: '1 cm',
          optionD: '0.001 mm',
          correctOption: 'B',
          explanation: 'A standard laboratory micrometer screw gauge has a pitch of 0.5 mm or 1 mm and 50/100 divisions, yielding a precision of 0.01 mm (0.001 cm).',
        },
      ],
    },
    // Class 10 Quiz
    {
      title: 'Daily Quiz: Physics Class 10 — Simple Harmonic Motion & Waves',
      classGrade: '10',
      subject: 'Physics',
      chapter: 'Unit 10: Simple Harmonic Motion & Waves',
      timeLimit: 600,
      questions: [
        {
          question: 'In Simple Harmonic Motion (SHM), the acceleration of the vibrating body is directly proportional to its:',
          optionA: 'Velocity',
          optionB: 'Displacement from mean position',
          optionC: 'Mass',
          optionD: 'Time period',
          correctOption: 'B',
          explanation: 'By definition of SHM, a ∝ -x: acceleration is directly proportional to displacement from the mean position and always directed towards it.',
        },
        {
          question: 'The time period of a simple pendulum depends upon:',
          optionA: 'Mass of the bob',
          optionB: 'Length of the pendulum',
          optionC: 'Amplitude of vibration',
          optionD: 'Material of the bob',
          correctOption: 'B',
          explanation: 'The formula for the time period of a simple pendulum is T = 2π√(l/g). It is independent of mass, amplitude, and material.',
        },
        {
          question: 'Which of the following is an example of longitudinal waves?',
          optionA: 'Light waves',
          optionB: 'Water ripples',
          optionC: 'Sound waves',
          optionD: 'Radio waves',
          correctOption: 'C',
          explanation: 'Sound waves are mechanical longitudinal waves consisting of compressions and rarefactions parallel to wave propagation.',
        },
        {
          question: 'If the frequency of a wave is 50 Hz and its wavelength is 4 meters, its speed is:',
          optionA: '12.5 m/s',
          optionB: '54 m/s',
          optionC: '200 m/s',
          optionD: '46 m/s',
          correctOption: 'C',
          explanation: 'Using the wave equation v = f × λ: v = 50 Hz × 4 m = 200 m/s.',
        },
        {
          question: 'When a wave passes from deep water into shallow water, which property remains constant?',
          optionA: 'Speed',
          optionB: 'Wavelength',
          optionC: 'Frequency',
          optionD: 'Direction',
          correctOption: 'C',
          explanation: 'The frequency of a wave is determined solely by the source of vibration and does not change during refraction across media.',
        },
      ],
    },
    // 1st Year (Class 11) Quiz
    {
      title: 'Daily Quiz: Physics 1st Year — Vectors & Equilibrium',
      classGrade: '11',
      subject: 'Physics',
      chapter: 'Chapter 2: Vectors & Equilibrium',
      timeLimit: 600,
      questions: [
        {
          question: 'The scalar product of two mutually perpendicular non-zero vectors is:',
          optionA: 'Unity',
          optionB: 'Zero',
          optionC: 'Maximum',
          optionD: 'Negative',
          correctOption: 'B',
          explanation: 'A · B = |A||B| cos(90°) = 0, because cos(90°) = 0.',
        },
        {
          question: 'A body is in complete static equilibrium if:',
          optionA: 'ΣF = 0 only',
          optionB: 'Στ = 0 only',
          optionC: 'Both ΣF = 0 and Στ = 0',
          optionD: 'Linear velocity is constant',
          correctOption: 'C',
          explanation: 'Complete mechanical equilibrium requires both the 1st condition (ΣF = 0, no linear acceleration) and 2nd condition (Στ = 0, no rotational acceleration).',
        },
        {
          question: 'The direction of the torque vector τ = r × F is determined by:',
          optionA: 'Left-hand grip rule',
          optionB: 'Right-hand rule for cross products',
          optionC: 'Fleming’s Left-Hand rule',
          optionD: 'Coulomb’s rule',
          correctOption: 'B',
          explanation: 'By vector mathematics, the vector cross product direction is given by curling the fingers of the right hand from r into F; the thumb points along torque.',
        },
        {
          question: 'Two forces of 3 N and 4 N act at an angle of 90°. The magnitude of their resultant is:',
          optionA: '7 N',
          optionB: '1 N',
          optionC: '5 N',
          optionD: '12 N',
          correctOption: 'C',
          explanation: 'R = √(3^2 + 4^2) = √(9 + 16) = √25 = 5 N.',
        },
        {
          question: 'If the position vector r and force F are collinear, the torque produced is:',
          optionA: 'Maximum',
          optionB: 'Minimum non-zero',
          optionC: 'Zero',
          optionD: 'Infinite',
          correctOption: 'C',
          explanation: 'When r and F are collinear (θ = 0° or 180°), sin(θ) = 0, so τ = rF sin(θ) = 0.',
        },
      ],
    },
    // 2nd Year (Class 12) Quiz
    {
      title: 'Daily Quiz: Physics 2nd Year — Electrostatics & Gauss’s Law',
      classGrade: '12',
      subject: 'Physics',
      chapter: 'Chapter 12: Electrostatics',
      timeLimit: 600,
      questions: [
        {
          question: 'The SI unit of electric flux is:',
          optionA: 'N·m/C',
          optionB: 'N·m^2/C',
          optionC: 'N/C',
          optionD: 'J/C',
          correctOption: 'B',
          explanation: 'Electric flux Φ = E · A = (N/C) × m^2 = N·m^2/C (or Volt-meters).',
        },
        {
          question: 'According to Gauss's Law, the total electric flux through any closed surface is equal to:',
          optionA: 'Q / ε0',
          optionB: 'Q × ε0',
          optionC: 'E / Q',
          optionD: '4πε0 / Q',
          correctOption: 'A',
          explanation: 'Gauss's Law states that Φe = 1/ε0 × (total charge enclosed Q).',
        },
        {
          question: 'The electric field intensity inside a hollow charged spherical conductor is:',
          optionA: 'Maximum',
          optionB: 'Infinite',
          optionC: 'Zero',
          optionD: 'Uniform and positive',
          correctOption: 'C',
          explanation: 'Since no net charge resides inside the hollow interior, enclosing Gaussian surface has Q = 0, giving E = 0 (electrostatic shielding).',
        },
        {
          question: 'One electron-volt (1 eV) is equal to:',
          optionA: '1.602 × 10^-19 Joules',
          optionB: '9.11 × 10^-31 Joules',
          optionC: '3.0 × 10^8 Joules',
          optionD: '6.63 × 10^-34 Joules',
          correctOption: 'A',
          explanation: '1 eV is the kinetic energy gained or lost by an electron in crossing a potential difference of 1 Volt: 1 eV = 1.602 × 10^-19 C × 1 V = 1.602 × 10^-19 J.',
        },
        {
          question: 'When a dielectric material of relative permittivity εr is placed between the plates of a capacitor, its capacitance:',
          optionA: 'Decreases by factor εr',
          optionB: 'Increases by factor εr',
          optionC: 'Remains unchanged',
          optionD: 'Drops to zero',
          correctOption: 'B',
          explanation: 'C_med = εr × C_vac. The dielectric weakens the opposing electric field, allowing higher charge storage per volt.',
        },
      ],
    },
    // Mathematics Class 10
    {
      title: 'Daily Quiz: Mathematics Class 10 — Quadratic Equations',
      classGrade: '10',
      subject: 'Mathematics',
      chapter: 'Unit 1: Quadratic Equations',
      timeLimit: 600,
      questions: [
        {
          question: 'The standard form of a quadratic equation in one variable x is:',
          optionA: 'ax + b = 0',
          optionB: 'ax^2 + bx + c = 0, a ≠ 0',
          optionC: 'ax^3 + bx^2 + c = 0',
          optionD: 'a/x + b = c',
          correctOption: 'B',
          explanation: 'A polynomial equation of degree 2 in standard form is written as ax^2 + bx + c = 0 where a, b, c are real numbers and a ≠ 0.',
        },
        {
          question: 'The discriminant of the quadratic equation ax^2 + bx + c = 0 is:',
          optionA: 'b^2 - 4ac',
          optionB: 'b^2 + 4ac',
          optionC: '4ac - b^2',
          optionD: '√(b^2 - 4ac)',
          correctOption: 'A',
          explanation: 'Discriminant = b^2 - 4ac. Its value determines whether roots are real, equal, or complex conjugate.',
        },
        {
          question: 'If the discriminant is zero (b^2 - 4ac = 0), the roots of the quadratic equation are:',
          optionA: 'Real, unequal, and rational',
          optionB: 'Real, equal, and rational',
          optionC: 'Imaginary and distinct',
          optionD: 'Irrational and distinct',
          correctOption: 'B',
          explanation: 'When discriminant = 0, roots reduce to x = -b / (2a), meaning there is one repeated real rational root.',
        },
        {
          question: 'The roots of x^2 - 7x + 12 = 0 are:',
          optionA: '3, 4',
          optionB: '-3, -4',
          optionC: '2, 6',
          optionD: '-2, -6',
          correctOption: 'A',
          explanation: 'Factorizing: (x - 3)(x - 4) = 0 ⇒ x = 3 or x = 4.',
        },
        {
          question: 'The sum of the roots of 2x^2 + 6x - 8 = 0 is:',
          optionA: '3',
          optionB: '-3',
          optionC: '-4',
          optionD: '4',
          correctOption: 'B',
          explanation: 'Sum of roots = -b / a = -(6) / 2 = -3.',
        },
      ],
    },
  ];

  // Append the full class x subject quiz bank (src/data/quizzes-data.json):
  // one 10-question quiz for every remaining class+subject combination, so a
  // fresh seed has quizzes for ALL classes and subjects, not just Physics.
  // The same file is used by scripts/import-quizzes.mjs for production import.
  const extraQuizzes = require('../src/data/quizzes-data.json');
  for (const extra of extraQuizzes) {
    if (!quizzesData.some((q) => q.classGrade === extra.classGrade && q.subject === extra.subject)) {
      quizzesData.push(extra);
    }
  }

  for (const qData of quizzesData) {
    const quiz = await prisma.quiz.create({
      data: {
        title: qData.title,
        classGrade: qData.classGrade,
        subject: qData.subject,
        chapter: qData.chapter,
        timeLimit: qData.timeLimit,
        isDaily: true,
        questions: {
          create: qData.questions.map((q) => ({
            question: q.question,
            optionA: q.optionA,
            optionB: q.optionB,
            optionC: q.optionC,
            optionD: q.optionD,
            correctOption: q.correctOption,
            explanation: q.explanation,
            marks: 1,
          })),
        },
      },
    });

    // Create sample attempts for the quiz
    await prisma.quizAttempt.create({
      data: {
        userId: leadScholar.id,
        quizId: quiz.id,
        score: 5,
        totalQuestions: 5,
        percentage: 100,
        answersJson: JSON.stringify({ Q1: 'C', Q2: 'B', Q3: 'C', Q4: 'C', Q5: 'B' }),
        timeTakenSeconds: 145,
      },
    });

    await prisma.quizAttempt.create({
      data: {
        userId: student12.id,
        quizId: quiz.id,
        score: 4,
        totalQuestions: 5,
        percentage: 80,
        answersJson: JSON.stringify({ Q1: 'C', Q2: 'B', Q3: 'A', Q4: 'C', Q5: 'B' }),
        timeTakenSeconds: 210,
      },
    });
  }
  console.log('Seeded Quizzes, Questions, and Sample Attempts.');

  // 5. Seed Announcements
  const announcementsData = [
    {
      title: 'FBISE SSC Part I & II Annual Examination 2025 Date Sheet Announced',
      category: 'DATE_SHEET',
      content: 'The Federal Board of Intermediate and Secondary Education has officially notified the examination schedule for Matric (SSC Part 1 & 2). Theory papers will commence from March 18, 2025 across all domestic and international FBISE centers. Students can check roll number slips and examination centers via their registered institutes.',
      link: 'https://fbise.edu.pk',
      isPinned: true,
    },
    {
      title: 'New SLO-Based Model Papers & Marking Scheme Guidelines for HSSC 2025',
      category: 'SYLLABUS',
      content: 'In line with National Curriculum reforms, FBISE has transitioned to Student Learning Outcomes (SLO) conceptual examination model. Memorization-based questions have been replaced with critical thinking, analytical reasoning, and real-life scientific applications. Download the verified Model Papers on FBISE Study Hub.',
      link: '/model-papers',
      isPinned: true,
    },
    {
      title: 'AI Paper Checking System Now Active for All Federal Board Students',
      category: 'BOARD_UPDATE',
      content: 'FBISE Study Hub has integrated an AI-powered automated paper assessment engine calibrated against Federal Board marking schemes. Students can now submit written answers or upload photos of handwritten papers to receive step-by-step marks evaluation, mistake diagnosis, and targeted improvement plans.',
      link: '/ai-paper-check',
      isPinned: false,
    },
    {
      title: 'HSSC 2nd Annual Examination 2024 Results Gazette Published',
      category: 'RESULT',
      content: 'The Result Gazette for HSSC Part 1 & 2 Second Annual Examination 2024 is now available. Students can check their detailed mark sheets and apply for automated re-evaluation directly through their FBISE Study Hub dashboard.',
      link: 'https://fbise.edu.pk',
      isPinned: false,
    },
  ];

  for (const a of announcementsData) {
    await prisma.announcement.create({
      data: a,
    });
  }
  console.log('Seeded Announcements.');

  // 6. Seed Sample Checked Paper Report
  const sampleEvaluationReport = {
    subject: 'Physics',
    classGrade: '9',
    totalMaxMarks: 50,
    totalObtainedMarks: 44.5,
    percentage: 89,
    grade: 'A+',
    overallRemarks: 'Outstanding paper presentation! Your conceptual clarity on Newton's laws, vector resolution, and kinetic equations matches FBISE distinction criteria.',
    strongAreas: [
      'Precise statement of Newton's Second and Third Laws with vector notation',
      'Accurate graphical velocity-time deduction for 2nd equation of motion',
      'Proper SI base units in all intermediate calculation steps',
    ],
    weakAreas: [
      'Minor oversight: Forgot to box the final magnitude and direction of the momentum vector in Q3(b)',
      'Diagram for the hydraulic lift in Section C needs clear arrows indicating fluid pressure propagation',
    ],
    studyTips: [
      'Maintain this high standard of step-by-step mathematical derivation.',
      'Always draw a box around final numeric answers along with SI units.',
      'Practice drawing physics schematics with a 2B pencil for maximum optical scanner clarity.',
    ],
    rubricsEvaluation: {
      conceptualClarity: 10,
      presentationAndDiagrams: 9,
      fbiseKeywordAdherence: 9,
      timeAndStructureEfficiency: 9,
    },
    questionBreakdown: [
      {
        questionNumber: 'Q1',
        questionTitle: 'Section B: Differentiate between Scalar and Vector Quantities',
        maxMarks: 4,
        obtainedMarks: 4,
        studentAnswerExcerpt: 'Scalars possess only magnitude and suitable units (e.g., speed, work). Vectors require magnitude, unit, and a specific direction in space (e.g., displacement, force)...',
        markingCriteria: ['1 Mark definition', '2 Marks examples', '1 Mark vector representation'],
        mistakes: ['None. Comprehensive and textbook aligned.'],
        correctExplanation: 'FBISE standard requires definition, algebraic notation (bold / arrow cap), and two physical examples.',
        feedback: 'Flawless distinction.',
      },
      {
        questionNumber: 'Q2',
        questionTitle: 'Section B: Derive s = vit + 1/2 at^2 from Speed-Time Graph',
        maxMarks: 6,
        obtainedMarks: 5.5,
        studentAnswerExcerpt: 'Total distance s = Area under speed-time curve OABD = Area of rectangle OACD + Area of triangle ABC. Area of rect = vi * t. Area of tri = 1/2 * (BC) * (AC) = 1/2 * (at) * t...',
        markingCriteria: ['2 Marks graph', '3 Marks algebraic derivation', '1 Mark final boxed formula'],
        mistakes: ['Graph slope label slightly faint.'],
        correctExplanation: 'Always clearly label gradient of line AB as acceleration a = (vf - vi) / t.',
        feedback: 'Excellent step-by-step mathematical working.',
      },
      {
        questionNumber: 'Q3',
        questionTitle: 'Section C: Law of Conservation of Momentum (Descriptive)',
        maxMarks: 10,
        obtainedMarks: 9,
        studentAnswerExcerpt: 'In an isolated system without external forces, total linear momentum remains constant: m1u1 + m2u2 = m1v1 + m2v2. During collision, ball A exerts force F on ball B...',
        markingCriteria: ['2 Marks statement', '4 Marks derivation', '2 Marks Newton 3rd law linkage', '2 Marks isolated system conditions'],
        mistakes: ['Did not specify that mass m1 and m2 are rigid elastic spheres.'],
        correctExplanation: 'Include assumptions of frictionless surface and rigid non-deforming bodies.',
        feedback: 'Superior analytical depth.',
      },
    ],
  };

  await prisma.checkedPaper.create({
    data: {
      userId: leadScholar.id,
      paperId: seededPapers[0].id,
      subject: 'Physics',
      classGrade: '9',
      submissionType: 'TYPED',
      studentAnswersText: 'Comprehensive solved response for Physics SSC-I Annual Exam...',
      totalMarks: 50,
      obtainedMarks: 44.5,
      percentage: 89,
      grade: 'A+',
      evaluationReport: JSON.stringify(sampleEvaluationReport),
    },
  });

  // Seed sample bookmarks
  await prisma.bookmark.create({
    data: {
      userId: leadScholar.id,
      paperId: seededPapers[0].id,
    },
  });
  await prisma.bookmark.create({
    data: {
      userId: leadScholar.id,
      paperId: seededPapers[1].id,
    },
  });

  console.log('FBISE Study Hub Database Seed Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('Seed Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
