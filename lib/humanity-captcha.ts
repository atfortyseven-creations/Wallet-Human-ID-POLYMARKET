export type CaptchaChallenge = {
  id: string;
  question: string;
  options: string[];
  // The hashed answer prevents client-side bots from easily finding the correct option
  // by simply inspecting the React state.
  answerHash: string;
  salt: string;
};

const COLORS = ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Black', 'White', 'Cyan', 'Magenta'];
const ANIMALS = ['Dog', 'Cat', 'Elephant', 'Tiger', 'Lion', 'Bear', 'Wolf', 'Fox', 'Rabbit', 'Deer'];
const FRUITS = ['Apple', 'Banana', 'Orange', 'Grape', 'Mango', 'Strawberry', 'Pineapple', 'Watermelon', 'Kiwi', 'Peach'];

// Deterministic hash to avoid storing plain-text answers in client memory
function hashAnswer(answer: string, salt: string): string {
  // Using simple hashing for client-side matching. In browser, we use subtle crypto,
  // but for generating the initial challenge, we can just use a basic hash.
  let str = answer.toLowerCase().trim() + salt;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

function getRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(array: T[]): T[] {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

export function generateCaptchaChallenge(): CaptchaChallenge {
  const types = ['MATH_ADD', 'MATH_SUB', 'MATH_MUL', 'LOGIC_CATEGORY', 'TEXT_POS', 'REVERSE_WORD'];
  const type = getRandom(types);
  
  let question = '';
  let correctAnswer = '';
  let wrongAnswers: string[] = [];

  switch (type) {
    case 'MATH_ADD': {
      const a = Math.floor(Math.random() * 50) + 10;
      const b = Math.floor(Math.random() * 50) + 10;
      question = `What is the sum of ${a} and ${b}?`;
      correctAnswer = (a + b).toString();
      while (wrongAnswers.length < 3) {
        const w = (a + b + Math.floor(Math.random() * 20) - 10).toString();
        if (w !== correctAnswer && !wrongAnswers.includes(w)) wrongAnswers.push(w);
      }
      break;
    }
    case 'MATH_SUB': {
      const a = Math.floor(Math.random() * 50) + 50;
      const b = Math.floor(Math.random() * 40) + 10;
      question = `If you subtract ${b} from ${a}, what is the result?`;
      correctAnswer = (a - b).toString();
      while (wrongAnswers.length < 3) {
        const w = (a - b + Math.floor(Math.random() * 10) - 5).toString();
        if (w !== correctAnswer && !wrongAnswers.includes(w)) wrongAnswers.push(w);
      }
      break;
    }
    case 'MATH_MUL': {
      const a = Math.floor(Math.random() * 10) + 2;
      const b = Math.floor(Math.random() * 10) + 2;
      question = `What is ${a} multiplied by ${b}?`;
      correctAnswer = (a * b).toString();
      while (wrongAnswers.length < 3) {
        const w = (a * b + Math.floor(Math.random() * 10) - 5).toString();
        if (w !== correctAnswer && !wrongAnswers.includes(w)) wrongAnswers.push(w);
      }
      break;
    }
    case 'LOGIC_CATEGORY': {
      const categories = [
        { name: 'color', items: COLORS, wrongItems: [...ANIMALS, ...FRUITS] },
        { name: 'animal', items: ANIMALS, wrongItems: [...COLORS, ...FRUITS] },
        { name: 'fruit', items: FRUITS, wrongItems: [...COLORS, ...ANIMALS] }
      ];
      const cat = getRandom(categories);
      question = `Which of the following is a ${cat.name}?`;
      correctAnswer = getRandom(cat.items);
      const shuffledWrong = shuffle([...cat.wrongItems]);
      wrongAnswers = shuffledWrong.slice(0, 3);
      break;
    }
    case 'TEXT_POS': {
      const words = ['SOVEREIGN', 'LEDGER', 'HUMANITY', 'ENCLAVE', 'NETWORK', 'PRIVACY', 'AZTEC', 'SHIELD'];
      const word = getRandom(words);
      const pos = Math.floor(Math.random() * word.length);
      const ordinals = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth'];
      question = `What is the ${ordinals[pos]} letter of the word "${word}"?`;
      correctAnswer = word[pos];
      
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
      const shuffledAlphabet = shuffle(alphabet.filter(c => c !== correctAnswer));
      wrongAnswers = shuffledAlphabet.slice(0, 3);
      break;
    }
    case 'REVERSE_WORD': {
      const words = ['NODE', 'HASH', 'BLOCK', 'CHAIN', 'KEY', 'PEER'];
      const word = getRandom(words);
      question = `What is "${word}" spelled backwards?`;
      correctAnswer = word.split('').reverse().join('');
      wrongAnswers = [
        shuffle(word.split('')).join(''),
        shuffle(word.split('')).join(''),
        shuffle(word.split('')).join('')
      ].filter(w => w !== correctAnswer);
      // Ensure 3 unique wrong answers
      while (wrongAnswers.length < 3) {
        const w = shuffle(word.split('')).join('');
        if (w !== correctAnswer && !wrongAnswers.includes(w)) wrongAnswers.push(w);
      }
      break;
    }
  }

  const salt = Math.random().toString(36).substring(2, 10);
  const answerHash = hashAnswer(correctAnswer, salt);
  const options = shuffle([correctAnswer, ...wrongAnswers]);

  return {
    id: Math.random().toString(36).substring(2, 10),
    question,
    options,
    answerHash,
    salt
  };
}

export function verifyCaptchaAnswer(answer: string, salt: string, expectedHash: string): boolean {
  return hashAnswer(answer, salt) === expectedHash;
}
