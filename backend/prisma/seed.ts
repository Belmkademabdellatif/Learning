import { PrismaClient, UserRole, Difficulty, ProgrammingLanguage } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@codelearn.com' },
    update: {},
    create: {
      email: 'admin@codelearn.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      emailVerified: true,
    },
  });
  console.log('✅ Created admin user:', admin.email);

  // Create instructor
  const instructorPassword = await bcrypt.hash('instructor123', 12);
  const instructor = await prisma.user.upsert({
    where: { email: 'instructor@codelearn.com' },
    update: {},
    create: {
      email: 'instructor@codelearn.com',
      password: instructorPassword,
      firstName: 'John',
      lastName: 'Instructor',
      role: UserRole.INSTRUCTOR,
      emailVerified: true,
    },
  });
  console.log('✅ Created instructor user:', instructor.email);

  // Create student
  const studentPassword = await bcrypt.hash('student123', 12);
  const student = await prisma.user.upsert({
    where: { email: 'student@codelearn.com' },
    update: {},
    create: {
      email: 'student@codelearn.com',
      password: studentPassword,
      firstName: 'Jane',
      lastName: 'Student',
      role: UserRole.STUDENT,
      emailVerified: true,
    },
  });
  console.log('✅ Created student user:', student.email);

  // Create JavaScript Fundamentals Track
  const jsTrack = await prisma.track.upsert({
    where: { slug: 'javascript-fundamentals' },
    update: {},
    create: {
      title: 'JavaScript Fundamentals',
      slug: 'javascript-fundamentals',
      description: 'Master the fundamentals of JavaScript programming',
      difficulty: Difficulty.BEGINNER,
      estimatedHours: 20,
      tags: ['javascript', 'programming', 'web-development'],
      prerequisites: [],
      isPublished: true,
      createdById: instructor.id,
    },
  });
  console.log('✅ Created track:', jsTrack.title);

  // Create Lessons
  const lesson1 = await prisma.lesson.create({
    data: {
      title: 'Introduction to JavaScript',
      slug: 'introduction',
      description: 'Learn the basics of JavaScript',
      content: `# Introduction to JavaScript

JavaScript is a versatile programming language that powers the web.

## What is JavaScript?

JavaScript is a high-level, interpreted programming language that conforms to the ECMAScript specification.

## Your First Program

\`\`\`javascript
console.log("Hello, World!");
\`\`\`

This simple program prints "Hello, World!" to the console.

## Variables

Variables are containers for storing data values.

\`\`\`javascript
let name = "Alice";
const age = 25;
var city = "New York";
\`\`\`

- \`let\`: Block-scoped, can be reassigned
- \`const\`: Block-scoped, cannot be reassigned
- \`var\`: Function-scoped (legacy)

## Try it yourself!

Use the code editor below to experiment with JavaScript.`,
      orderIndex: 1,
      estimatedMinutes: 30,
      isPublished: true,
      trackId: jsTrack.id,
      createdById: instructor.id,
    },
  });

  const lesson2 = await prisma.lesson.create({
    data: {
      title: 'Functions and Control Flow',
      slug: 'functions-control-flow',
      description: 'Learn about functions and control structures',
      content: `# Functions and Control Flow

## Functions

Functions are reusable blocks of code.

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet("Alice"));
\`\`\`

## Arrow Functions

\`\`\`javascript
const add = (a, b) => a + b;
console.log(add(5, 3)); // 8
\`\`\`

## Conditionals

\`\`\`javascript
const age = 18;

if (age >= 18) {
  console.log("Adult");
} else {
  console.log("Minor");
}
\`\`\`

## Loops

\`\`\`javascript
for (let i = 0; i < 5; i++) {
  console.log(i);
}

const items = ["apple", "banana", "orange"];
items.forEach(item => console.log(item));
\`\`\``,
      orderIndex: 2,
      estimatedMinutes: 45,
      isPublished: true,
      trackId: jsTrack.id,
      createdById: instructor.id,
    },
  });

  console.log('✅ Created lessons:', lesson1.title, lesson2.title);

  // Create Challenges
  const challenge1 = await prisma.challenge.create({
    data: {
      title: 'Sum Two Numbers',
      description: 'Write a function that takes two numbers and returns their sum.',
      difficulty: Difficulty.BEGINNER,
      points: 10,
      language: ProgrammingLanguage.JAVASCRIPT,
      starterCode: `function sum(a, b) {
  // Your code here
}`,
      solutionCode: `function sum(a, b) {
  return a + b;
}`,
      testCases: [
        { input: { a: 1, b: 2 }, expected: 3, description: 'Sum of 1 and 2', isHidden: false },
        { input: { a: -5, b: 5 }, expected: 0, description: 'Sum of -5 and 5', isHidden: false },
        { input: { a: 100, b: 200 }, expected: 300, description: 'Sum of 100 and 200', isHidden: true },
      ],
      hints: [
        'Use the + operator to add two numbers',
        'Return the result using the return keyword',
      ],
      orderIndex: 1,
      lessonId: lesson1.id,
    },
  });

  const challenge2 = await prisma.challenge.create({
    data: {
      title: 'Check Even or Odd',
      description: 'Write a function that determines if a number is even or odd.',
      difficulty: Difficulty.BEGINNER,
      points: 10,
      language: ProgrammingLanguage.JAVASCRIPT,
      starterCode: `function isEven(num) {
  // Your code here
}`,
      solutionCode: `function isEven(num) {
  return num % 2 === 0;
}`,
      testCases: [
        { input: { num: 4 }, expected: true, description: '4 is even', isHidden: false },
        { input: { num: 7 }, expected: false, description: '7 is odd', isHidden: false },
        { input: { num: 0 }, expected: true, description: '0 is even', isHidden: true },
      ],
      hints: [
        'Use the modulo operator (%) to check divisibility',
        'A number is even if num % 2 === 0',
      ],
      orderIndex: 1,
      lessonId: lesson2.id,
    },
  });

  console.log('✅ Created challenges:', challenge1.title, challenge2.title);

  // Create Python Track
  const pythonTrack = await prisma.track.create({
    data: {
      title: 'Python for Beginners',
      slug: 'python-beginners',
      description: 'Start your programming journey with Python',
      difficulty: Difficulty.BEGINNER,
      estimatedHours: 15,
      tags: ['python', 'programming', 'data-science'],
      prerequisites: [],
      isPublished: true,
      createdById: instructor.id,
    },
  });
  console.log('✅ Created track:', pythonTrack.title);

  // Create system config
  await prisma.systemConfig.upsert({
    where: { key: 'certificate_generation_time' },
    update: {},
    create: {
      key: 'certificate_generation_time',
      value: '23:59',
      description: 'Time for daily certificate generation (HH:mm format)',
    },
  });

  await prisma.systemConfig.upsert({
    where: { key: 'platform_name' },
    update: {},
    create: {
      key: 'platform_name',
      value: 'CodeLearn',
      description: 'Platform name for certificates and emails',
    },
  });

  console.log('✅ Created system configuration');

  console.log('\n🎉 Seeding completed successfully!');
  console.log('\n📧 Test Credentials:');
  console.log('Admin: admin@codelearn.com / admin123');
  console.log('Instructor: instructor@codelearn.com / instructor123');
  console.log('Student: student@codelearn.com / student123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
