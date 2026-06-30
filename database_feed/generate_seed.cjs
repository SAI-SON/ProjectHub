const fs = require('fs');

const depts = [
  { code: 'IT', name: 'Information Technology', count: 60 },
  { code: 'AI', name: 'Artificial Intelligence & Data Science', count: 60 },
  { code: 'CS', name: 'Computer Science Engineering', count: 120 },
  { code: 'IO', name: 'Internet of Things', count: 60 },
  { code: 'EC', name: 'Electronics & Communication Engineering', count: 60 },
  { code: 'EE', name: 'Electrical & Electronics Engineering', count: 60 },
];

const students = {};

depts.forEach(dept => {
  for (let i = 1; i <= dept.count; i++) {
    const paddedNum = String(i).padStart(3, '0');
    const studentId = `23${dept.code}${paddedNum}`;
    
    // Assign section based on count (60 students per section)
    const section = i <= 60 ? 'A' : 'B';
    
    students[studentId] = {
      studentId: studentId,
      name: `Student Name`, // As requested in format
      email: `${studentId.toLowerCase()}@projecthub.edu`,
      role: 'student',
      department: dept.name,
      section: section,
      year: '4',
      status: 'active',
      createdAt: {
        _firestore_timestamp: "serverTimestamp()"
      }
    };
  }
});

const studentsArray = Object.values(students).map(s => ({
  ...s,
  createdAt: "serverTimestamp()"
}));

fs.writeFileSync('students_seed.json', JSON.stringify(studentsArray, null, 2));
console.log(`Generated ${studentsArray.length} students in students_seed.json`);
