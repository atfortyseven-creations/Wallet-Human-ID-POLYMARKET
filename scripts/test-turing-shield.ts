import { runAcademicIntegrityAnalysis } from '../lib/academic-integrity-engine';

async function runTests() {
  console.log('--- TEST 1: ORIGINAL HUMAN TEXT ---');
  const humanText = `
    The rapid evolution of zero-knowledge cryptography has fundamentally 
    altered our understanding of privacy in distributed systems. 
    By allowing a prover to demonstrate the validity of a statement 
    without revealing any underlying data, zk-SNARKs provide a powerful 
    mechanism for scaling blockchain networks and ensuring data confidentiality.
    This research investigates the performance trade-offs of pairing-friendly 
    elliptic curves when applied to recursive SNARK composition.
    As we delve into the micro-benchmarks, it becomes evident that 
    the computational overhead of the prover remains a significant bottleneck 
    for real-time applications.
  `;
  const res1 = await runAcademicIntegrityAnalysis(humanText, 'TEST-01', () => {});
  console.log(JSON.stringify(res1, null, 2));

  console.log('\n\n--- TEST 2: HEAVILY OBFUSCATED AI TEXT (ZERO-WIDTH & HOMOGLYPHS) ---');
  // Obfuscated: "z​e​r​o​-k​n​o​w​l​e​d​g​e" (with zero-width chars)
  // Homoglyphs: cоmputаtіоnаl (Cyrillic o, a, i, a)
  const aiText = `
    In conclusion, the z\u200B\u200Be\u200Br\u200Bo-knowledge paradigms 
    are essential. Furthermore, it is important to note that the cоmputаtіоnаl 
    overhead is a multifaceted challenge. 
    Additionally, we can observe that scaling solutions must be prioritized.
    Consequently, the integration of these cryptographic primitives 
    facilitates a paradigm shift.
    It is crucial to emphasize that this multifaceted approach 
    will undoubtedly revolutionize the landscape of digital privacy.
  `;
  const res2 = await runAcademicIntegrityAnalysis(aiText, 'TEST-02', () => {});
  console.log(JSON.stringify(res2, null, 2));

  console.log('\n\n--- TEST 3: EXACT MOSS K-GRAM MATCH (PLAGIARISM) ---');
  // Copying the exact phrasing from the human text to trigger winnowing match
  const plagiarizedText = `
    Some introduction text here.
    By allowing a prover to demonstrate the validity of a statement 
    without revealing any underlying data, zk-SNARKs provide a powerful 
    mechanism for scaling blockchain networks and ensuring data confidentiality.
    This research investigates the performance trade-offs of pairing-friendly 
    elliptic curves when applied to recursive SNARK composition.
    Conclusion here.
  `;
  const res3 = await runAcademicIntegrityAnalysis(plagiarizedText, 'TEST-03', () => {});
  console.log(JSON.stringify(res3, null, 2));
}

runTests().catch(console.error);
