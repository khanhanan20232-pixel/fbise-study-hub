/** @type {import('next').NextConfig} */
// The seeded paper files under /uploads/papers/ were placeholder dummies.
// Each paper link now redirects to the REAL official FBISE model paper PDF
// for that subject & class, hosted on fbise.edu.pk (collected 2026-10-27).
const FBISE = {
  phy9: 'https://www.fbise.edu.pk/ModelPaper/2025/Assessment%20Frameworks/SSC-I/Final%20Assessment%20Framework%20Model%20Question%20Paper%20Physics%20SSC-I.pdf',
  phy10: 'https://www.fbise.edu.pk/ModelPaper/2024New/physics/Model_Question_Paper_Physics_SSC_II_2024.pdf',
  phy11: 'https://www.fbise.edu.pk/ModelPaper/2025/Assessment%20Frameworks/HSSC-I/Final%20Assessment%20Framework%20Model%20Question%20Paper%20Physics%20HSSC-I.pdf',
  phy12: 'https://www.fbise.edu.pk/ModelPaper/2024New/physics/Model_Question_Paper_Physics_HSSC_II_2024.pdf',
  chem9: 'https://www.fbise.edu.pk/ModelPaper/2025/Assessment%20Frameworks/SSC-I/Final%20Assessment%20Framework%20Model%20Question%20Paper%20Chemistry%20SSC-I.pdf',
  chem10: 'https://www.fbise.edu.pk/ModelPaper/2024New/chemistry/Model_Question_Paper_Chemistry_SSC_II_2024.pdf',
  chem11: 'https://www.fbise.edu.pk/ModelPaper/2025/Assessment%20Frameworks//HSSC-I/Final%20Assessment%20Framework%20Model%20Question%20Paper%20Chemistry%20HSSC-I_.pdf',
  chem12: 'https://www.fbise.edu.pk/ModelPaper/2024New/chemistry/Model_Question_Paper_Chemistry_HSSC_II_2024.pdf',
  bio9: 'https://www.fbise.edu.pk/ModelPaper/2025/Assessment%20Frameworks/SSC-I/Final%20Assessment%20Framework%20Model%20Question%20Paper%20Biology%20SSC-I.pdf',
  bio10: 'https://www.fbise.edu.pk/ModelPaper/2024New/bio/Model_Question_Paper_Biology%20SSC-II.pdf',
  bio11: 'https://www.fbise.edu.pk/ModelPaper/2025/Assessment%20Frameworks/HSSC-I/Final%20Assessment%20Framework%20Model%20Question%20Paper%20Biology%20HSSC-I.pdf',
  bio12: 'https://www.fbise.edu.pk/ModelPaper/2024New/bio/Model_Question_Paper_Biology_HSSC_II_2024.pdf',
  math9: 'https://www.fbise.edu.pk/ModelPaper/2024New/maths/Final_Assessment_Framework_Model_Question_Paper_Mathematics_SSC-I.pdf',
  math10: 'https://www.fbise.edu.pk/ModelPaper/2025/Assessment%20Frameworks/SSC-II/Final%20Assessment%20Framework%20%2B%20Model%20Question%20Paper%20Mathematics%20SSC-II.pdf',
  math11: 'https://www.fbise.edu.pk/ModelPaper/2024New/maths/Final_Assessment_Framework_Model_Question_Paper_Mathematics_HSSC-I_.pdf',
  math12: 'https://www.fbise.edu.pk/ModelPaper/2025/Assessment%20Frameworks/HSSC-II/Final%20Assessment%20Framework%20%2B%20Model%20Question%20Paper%20Mathematics%20HSSC-II.pdf',
  cs9: 'https://www.fbise.edu.pk/ModelPaper/2025/Assessment%20Frameworks/SSC-I/Final%20Assessment%20Framework%20Model%20Question%20Paper%20Computer%20Science%20SSC-I.pdf',
  cs10: 'https://www.fbise.edu.pk/ModelPaper/2024New/computer/Model_Question_Paper_Computer_Science_SSC_II_2024.pdf',
  cs11: 'https://www.fbise.edu.pk/ModelPaper/2025/Assessment%20Frameworks//HSSC-I/Final%20Assessment%20Framework%20Model%20Question%20Paper%20Computer%20Science%20HSSC-I.pdf',
  cs12: 'https://www.fbise.edu.pk/ModelPaper/2024New/computer/Model_Question_Paper_Computer_Science_HSSC_II_2024.pdf',
  eng9: 'https://www.fbise.edu.pk/ModelPaper/2025/Assessment%20Frameworks/SSC-I/Final%20Assessment%20Framework%20%2B%20Model%20Question%20Paper%20English%20SSC-I.pdf',
  pakSsc: 'https://www.fbise.edu.pk/ModelPaper/2025/Assessment%20Frameworks/SSC-II/Final%20Assessment%20Framework%20%2B%20Model%20Question%20Paper%20Pakistan%20Studies%20SSC-II.pdf',
  pak12: 'https://www.fbise.edu.pk/ModelPaper/2025/Assessment%20Frameworks/HSSC-II/Final%20Assessment%20Framework%20%2B%20Model%20Question%20Paper%20Pakistan%20Studies%20HSSC-II.pdf',
};

const paper = (file, dest) => ({
  source: `/uploads/papers/${file}`,
  destination: dest,
  permanent: false,
});

const nextConfig = {
  async redirects() {
    return [
      paper('physics_9_2024_annual.pdf', FBISE.phy9),
      paper('physics_9_model_2024.pdf', FBISE.phy9),
      paper('math_9_2024_annual.pdf', FBISE.math9),
      paper('chemistry_9_2023_annual.pdf', FBISE.chem9),
      paper('biology_9_2024_annual.pdf', FBISE.bio9),
      paper('cs_9_2024_annual.pdf', FBISE.cs9),
      paper('english_9_2024_annual.pdf', FBISE.eng9),
      paper('pakstudies_9_2024_annual.pdf', FBISE.pakSsc),
      paper('physics_10_2024_annual.pdf', FBISE.phy10),
      paper('physics_10_model_2024.pdf', FBISE.phy10),
      paper('math_10_2024_annual.pdf', FBISE.math10),
      paper('chemistry_10_2024_annual.pdf', FBISE.chem10),
      paper('biology_10_model_2024.pdf', FBISE.bio10),
      paper('cs_10_2024_annual.pdf', FBISE.cs10),
      paper('physics_11_2024_annual.pdf', FBISE.phy11),
      paper('physics_11_model_2024.pdf', FBISE.phy11),
      paper('math_11_2024_annual.pdf', FBISE.math11),
      paper('chemistry_11_2024_annual.pdf', FBISE.chem11),
      paper('biology_11_2024_annual.pdf', FBISE.bio11),
      paper('cs_11_2024_annual.pdf', FBISE.cs11),
      paper('physics_12_2024_annual.pdf', FBISE.phy12),
      paper('physics_12_model_2024.pdf', FBISE.phy12),
      paper('math_12_2024_annual.pdf', FBISE.math12),
      paper('chemistry_12_2024_annual.pdf', FBISE.chem12),
      paper('biology_12_2024_annual.pdf', FBISE.bio12),
      paper('pakstudies_12_2024_annual.pdf', FBISE.pak12),
    ];
  },
};

module.exports = nextConfig;
