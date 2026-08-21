import type { PrismaClient } from "../lib/generated/prisma/client"

type ContentBlock = { type: "paragraph" | "heading" | "note" | "tip" | "warning" | "list"; text?: string; items?: string[]; level?: number }

type LessonData = {
  id: string
  slug: string
  title: string
  minutes: number
  summary: string
  content: ContentBlock[]
  example?: { title: string; sourceCode: string; expectedOutput?: string; explanation?: string }
  exercise?: { title: string; instructions: string; starterCode?: string; expectedAnswer?: string; explanation?: string }
  quiz?: { prompt: string; options: string[]; correct: number }
}

type SectionData = { id: string; title: string; slug: string; description: string; lessons: LessonData[] }

type TutorialConfig = {
  famPrefix: string
  language: string
  slug: string
  title: string
  shortDescription: string
  description: string
  icon: string
  difficulty: "beginner" | "intermediate" | "advanced"
  publishedAt: string
  sections: SectionData[]
}

// --- Python Foundations (existing, unchanged) ------------------------------

const sections: SectionData[] = [
  {
    id: "f1100000-0000-0000-0000-000000000001",
    title: "Python Foundations",
    slug: "foundations",
    description: "Set up a practical mental model for reading and writing Python.",
    lessons: [
      {
        id: "f1200000-0000-0000-0000-000000000001", slug: "introduction", title: "Meet Python", minutes: 8,
        summary: "Discover what Python is good at and write a small first program.",
        content: [
          { type: "paragraph", text: "Python is a general-purpose programming language designed to express ideas clearly. It is used for web services, automation, data work, scientific computing, and teaching." },
          { type: "heading", level: 2, text: "Programs are precise instructions" },
          { type: "paragraph", text: "A Python program is a sequence of instructions. The interpreter reads those instructions and performs them in order. Small experiments are the fastest way to build confidence." },
          { type: "tip", text: "Type each example yourself. Small typing mistakes teach you how Python reports problems." },
        ] as ContentBlock[],
        example: { title: "A friendly first program", sourceCode: "learner = \"Tariro\"\nprint(f\"Welcome, {learner}!\")", expectedOutput: "Welcome, Tariro!", explanation: "The variable stores text and the f-string places it inside the message." },
        exercise: { title: "Introduce yourself", instructions: "Create a variable named city, then print a sentence saying where you are learning from.", starterCode: "city = \"\"\nprint()", expectedAnswer: "city = \"Bulawayo\"\nprint(f\"I am learning from {city}.\")" },
      },
      {
        id: "f1200000-0000-0000-0000-000000000002", slug: "setup", title: "Your Python Workspace", minutes: 10,
        summary: "Understand files, the interpreter, indentation, and useful error messages.",
        content: [
          { type: "paragraph", text: "Python source files normally end in .py. You can run one from a terminal with python filename.py, or use an editor that provides a Run button." },
          { type: "heading", level: 2, text: "Read errors from the bottom" },
          { type: "paragraph", text: "When Python cannot continue, it prints a traceback. The final line names the error and usually gives the clearest clue. The lines above show how execution reached it." },
          { type: "warning", text: "Indentation is part of Python syntax. Use four spaces for each indentation level and avoid mixing tabs with spaces." },
        ] as ContentBlock[],
        example: { title: "Comments and output", sourceCode: "# Zimbabwe has many brilliant future developers.\nprint(\"Workspace ready\")", expectedOutput: "Workspace ready", explanation: "Python ignores text after # on a comment line." },
      },
      {
        id: "f1200000-0000-0000-0000-000000000003", slug: "variables-and-data-types", title: "Variables and Data Types", minutes: 14,
        summary: "Represent names, numbers, true/false values, and convert between common types.",
        content: [
          { type: "paragraph", text: "A variable gives a value a useful name. Python determines the type from the assigned value, while you remain responsible for choosing names that explain the idea." },
          { type: "list", items: ["str stores text", "int stores whole numbers", "float stores decimal numbers", "bool stores True or False"] },
          { type: "note", text: "Money needs deliberate rounding rules. For real financial systems, use Decimal or store minor units rather than relying on binary floating-point values." },
        ] as ContentBlock[],
        example: { title: "A learner profile", sourceCode: "name = \"Nyasha\"\nage = 17\nprogress = 62.5\nis_active = True\n\nprint(type(name).__name__, age, progress, is_active)", expectedOutput: "str 17 62.5 True", explanation: "Each literal creates a different built-in type." },
        exercise: { title: "Calculate a total", instructions: "Store the price and quantity, multiply them, then print the total.", starterCode: "price = 4\nquantity = 3\n# Calculate and print total", expectedAnswer: "price = 4\nquantity = 3\ntotal = price * quantity\nprint(total)" },
        quiz: { prompt: "Which Python type represents a whole number?", options: ["str", "int", "float", "bool"], correct: 1 },
      },
    ],
  },
  {
    id: "f1100000-0000-0000-0000-000000000002",
    title: "Decisions and Repetition", slug: "control-flow", description: "Make programs respond to conditions and repeat useful work.",
    lessons: [
      {
        id: "f1200000-0000-0000-0000-000000000004", slug: "conditions", title: "Making Decisions", minutes: 13,
        summary: "Use comparisons, if, elif, and else to select behaviour.",
        content: [
          { type: "paragraph", text: "Conditions let a program choose a path. Comparisons such as >= produce Boolean values, and an if statement runs its indented block only when its condition is true." },
          { type: "tip", text: "Prefer a small number of clear branches. If a decision becomes difficult to read, move part of it into a well-named function." },
        ] as ContentBlock[],
        example: { title: "Classify a result", sourceCode: "mark = 73\n\nif mark >= 75:\n    result = \"Distinction\"\nelif mark >= 50:\n    result = \"Pass\"\nelse:\n    result = \"Keep practising\"\n\nprint(result)", expectedOutput: "Pass", explanation: "Python checks branches from top to bottom and uses the first matching branch." },
      },
      {
        id: "f1200000-0000-0000-0000-000000000005", slug: "loops", title: "Loops", minutes: 14,
        summary: "Repeat operations safely with for and while loops.",
        content: [
          { type: "paragraph", text: "A for loop visits each value in a collection. A while loop continues while a condition remains true. For loops are usually the clearer choice when the values are already known." },
          { type: "warning", text: "A while loop must eventually change something involved in its condition, otherwise it can run forever." },
        ] as ContentBlock[],
        example: { title: "Total weekly study time", sourceCode: "minutes = [25, 40, 30, 45, 20]\ntotal = 0\n\nfor session in minutes:\n    total += session\n\nprint(total)", expectedOutput: "160", explanation: "The accumulator starts at zero and grows during each iteration." },
      },
      {
        id: "f1200000-0000-0000-0000-000000000006", slug: "functions", title: "Functions", minutes: 16,
        summary: "Package reusable behaviour behind clear inputs and outputs.",
        content: [
          { type: "paragraph", text: "A function names a reusable operation. Parameters receive input and return sends a result back to the caller. Good functions usually do one coherent job." },
          { type: "note", text: "Printing displays a value for a person. Returning a value gives it back to the rest of the program. These are different responsibilities." },
        ] as ContentBlock[],
        example: { title: "Convert a percentage", sourceCode: "def completion(done, total):\n    if total == 0:\n        return 0\n    return round(done / total * 100)\n\nprint(completion(7, 10))", expectedOutput: "70", explanation: "The guard handles a zero total before division." },
      },
    ],
  },
  {
    id: "f1100000-0000-0000-0000-000000000003",
    title: "Working with Data", slug: "data", description: "Organise related values and build a small practical program.",
    lessons: [
      {
        id: "f1200000-0000-0000-0000-000000000007", slug: "collections", title: "Lists and Dictionaries", minutes: 17,
        summary: "Choose suitable structures for ordered values and labelled facts.",
        content: [
          { type: "paragraph", text: "Lists keep values in order and address them by position. Dictionaries connect unique keys to values, making them useful for records and lookups." },
          { type: "tip", text: "Model the meaning first: use a list for a sequence and a dictionary when labels are more useful than positions." },
        ] as ContentBlock[],
        example: { title: "Summarise subject marks", sourceCode: "marks = {\"Maths\": 81, \"English\": 74, \"Science\": 88}\n\nfor subject, mark in marks.items():\n    print(f\"{subject}: {mark}\")", expectedOutput: "Maths: 81\nEnglish: 74\nScience: 88", explanation: "items() provides each key and its associated value." },
      },
      {
        id: "f1200000-0000-0000-0000-000000000008", slug: "study-tracker-project", title: "Project: Study Tracker", minutes: 25,
        summary: "Combine variables, collections, loops, decisions, and functions in one original project.",
        content: [
          { type: "paragraph", text: "This project turns a list of study sessions into a useful summary. Start with the data, write one calculation at a time, and verify each result before adding another feature." },
          { type: "heading", level: 2, text: "A simple development rhythm" },
          { type: "list", items: ["Describe the result in plain language", "Choose data structures", "Write the smallest working version", "Test unusual inputs", "Improve names and presentation"] },
          { type: "note", text: "There is rarely one perfect solution. Prefer a correct, readable solution that another learner can explain." },
        ] as ContentBlock[],
        example: { title: "Complete tracker", sourceCode: "sessions = [\n    {\"subject\": \"Python\", \"minutes\": 35},\n    {\"subject\": \"SQL\", \"minutes\": 25},\n    {\"subject\": \"Python\", \"minutes\": 40},\n]\n\ndef total_minutes(items):\n    return sum(item[\"minutes\"] for item in items)\n\nprint(f\"Total study time: {total_minutes(sessions)} minutes\")", expectedOutput: "Total study time: 100 minutes", explanation: "The function isolates the calculation, while the final line handles presentation." },
        exercise: { title: "Extend the tracker", instructions: "Add a function that returns only sessions for a requested subject. Test it with Python.", starterCode: "def sessions_for_subject(items, subject):\n    # Return matching items\n    pass", expectedAnswer: "def sessions_for_subject(items, subject):\n    return [item for item in items if item[\"subject\"] == subject]" },
      },
    ],
  },
]

// --- JavaScript Foundations --------------------------------------------
// Syllabus scoped from Eloquent JavaScript (4th ed., Marijn Haverbeke) chapters
// 1-4 as a topic outline only; all prose, examples, and exercises below are
// original writing, not taken from that (CC BY-NC licensed) text.

const javascriptSections: SectionData[] = [
  {
    id: "f2100000-0000-0000-0000-000000000001",
    title: "JavaScript Foundations",
    slug: "foundations",
    description: "Get comfortable with values, types, and bindings.",
    lessons: [
      {
        id: "f2200000-0000-0000-0000-000000000001", slug: "introduction", title: "Meet JavaScript", minutes: 8,
        summary: "Discover where JavaScript runs and write a small first program.",
        content: [
          { type: "paragraph", text: "JavaScript is the programming language built into every web browser. It started as a way to make web pages interactive and has grown into a language used on servers, mobile apps, and more." },
          { type: "heading", level: 2, text: "Where your code runs" },
          { type: "paragraph", text: "You can run JavaScript in a browser's developer console, inside a script tag on a web page, or on a server with Node.js. All three run the same core language." },
          { type: "tip", text: "Open your browser, press F12, and type a line of JavaScript directly into the Console tab. Immediate feedback is the fastest way to learn." },
        ] as ContentBlock[],
        example: { title: "A friendly first program", sourceCode: "let learner = \"Tariro\";\nconsole.log(`Welcome, ${learner}!`);", expectedOutput: "Welcome, Tariro!", explanation: "console.log prints a value, and a template literal (backticks) inserts the variable into the message." },
        exercise: { title: "Introduce yourself", instructions: "Create a binding named city, then log a sentence saying where you are learning from.", starterCode: "let city = \"\";\nconsole.log();", expectedAnswer: "let city = \"Bulawayo\";\nconsole.log(`I am learning from ${city}.`);" },
      },
      {
        id: "f2200000-0000-0000-0000-000000000002", slug: "values-and-types", title: "Values and Types", minutes: 12,
        summary: "Meet JavaScript's basic types and the typeof operator.",
        content: [
          { type: "paragraph", text: "JavaScript has a small set of primitive types: number, string, boolean, undefined, and null. Every value belongs to exactly one of these, and typeof tells you which." },
          { type: "list", items: ["number covers both whole numbers and decimals", "string stores text inside quotes or backticks", "boolean is true or false", "undefined means a binding has no value yet", "null is an explicit \"no value\", set on purpose"] },
          { type: "note", text: "Unlike Python, JavaScript does not separate int and float. Every number, whole or decimal, shares the same number type." },
        ] as ContentBlock[],
        example: { title: "Checking types", sourceCode: "console.log(typeof 42);\nconsole.log(typeof \"Harare\");\nconsole.log(typeof true);\nconsole.log(typeof undefined);", expectedOutput: "number\nstring\nboolean\nundefined", explanation: "typeof returns a string naming the value's type." },
        exercise: { title: "Describe a learner", instructions: "Create bindings for a name (string), an age (number), and whether the learner is active (boolean), then log all three types.", starterCode: "let name = \"\";\nlet age = 0;\nlet isActive = true;\n// log the three types", expectedAnswer: "let name = \"Nyasha\";\nlet age = 17;\nlet isActive = true;\nconsole.log(typeof name, typeof age, typeof isActive);" },
      },
      {
        id: "f2200000-0000-0000-0000-000000000003", slug: "bindings", title: "Bindings: let, const, and var", minutes: 9,
        summary: "Choose the right keyword for naming a value.",
        content: [
          { type: "paragraph", text: "A binding gives a value a name. Modern JavaScript prefers let for values that change and const for values that should not be reassigned. var is an older form with looser rules, best avoided in new code." },
          { type: "warning", text: "const prevents reassignment, not mutation. A const array or object can still have its contents changed; only the binding itself is locked." },
        ] as ContentBlock[],
        example: { title: "Choosing the right keyword", sourceCode: "const school = \"Dzidza Hub\";\nlet streak = 3;\nstreak = streak + 1;\nconsole.log(school, streak);", expectedOutput: "Dzidza Hub 4", explanation: "school never changes, so const fits. streak changes, so it needs let." },
      },
      {
        id: "f2200000-0000-0000-0000-000000000004", slug: "operators-and-conversion", title: "Operators and Automatic Type Conversion", minutes: 11,
        summary: "Combine values with operators and avoid loose-equality surprises.",
        content: [
          { type: "paragraph", text: "Arithmetic operators (+, -, *, /, %) work as expected on numbers. The + operator also joins strings together, which is convenient but can surprise you when numbers and strings mix." },
          { type: "paragraph", text: "JavaScript automatically converts types in many situations. Prefer === and !== over == and != so comparisons check both value and type instead of guessing." },
        ] as ContentBlock[],
        example: { title: "Mixing numbers and text", sourceCode: "console.log(5 + 3);\nconsole.log(\"5\" + 3);\nconsole.log(5 === \"5\");\nconsole.log(5 == \"5\");", expectedOutput: "8\n53\nfalse\ntrue", explanation: "Adding a string to a number converts the number to text, while === refuses to treat a number and a string as equal." },
        quiz: { prompt: "Which comparison operator checks both value and type?", options: ["==", "===", "=", "!="], correct: 1 },
      },
    ],
  },
  {
    id: "f2100000-0000-0000-0000-000000000002",
    title: "Program Structure",
    slug: "program-structure",
    description: "Control the order code runs in and package it into functions.",
    lessons: [
      {
        id: "f2200000-0000-0000-0000-000000000005", slug: "expressions-and-statements", title: "Expressions, Statements, and Comments", minutes: 8,
        summary: "Tell expressions and statements apart, and document intent with comments.",
        content: [
          { type: "paragraph", text: "An expression produces a value, such as 3 + 4 or a function call. A statement is a complete instruction, often built from one or more expressions and ended with a semicolon." },
          { type: "paragraph", text: "// starts a single-line comment, and /* ... */ wraps a comment that can span multiple lines. Comments explain intent; they are ignored when the code runs." },
        ] as ContentBlock[],
        example: { title: "Reading a small program", sourceCode: "// Calculate a total price\nconst price = 4;\nconst quantity = 3;\nconst total = price * quantity; // an expression\nconsole.log(total);", expectedOutput: "12", explanation: "price * quantity is an expression; assigning it to total makes it part of a statement." },
      },
      {
        id: "f2200000-0000-0000-0000-000000000006", slug: "making-decisions", title: "Making Decisions", minutes: 13,
        summary: "Branch with if, else if, and else.",
        content: [
          { type: "paragraph", text: "if runs a block only when its condition is truthy. else if checks another condition, and else catches everything left over. Combine conditions with && (and), || (or), and ! (not)." },
          { type: "tip", text: "Keep conditions readable. If a condition needs several && and || together, consider naming the result first." },
        ] as ContentBlock[],
        example: { title: "Classify a result", sourceCode: "const mark = 73;\nlet result;\nif (mark >= 75) {\n  result = \"Distinction\";\n} else if (mark >= 50) {\n  result = \"Pass\";\n} else {\n  result = \"Keep practising\";\n}\nconsole.log(result);", expectedOutput: "Pass", explanation: "JavaScript checks branches top to bottom and stops at the first true condition." },
        exercise: { title: "Check eligibility", instructions: "Log \"Eligible\" when age is 18 or older, and \"Not yet\" otherwise. Test it with age = 16.", starterCode: "const age = 16;\n// write the condition", expectedAnswer: "const age = 16;\nif (age >= 18) {\n  console.log(\"Eligible\");\n} else {\n  console.log(\"Not yet\");\n}" },
      },
      {
        id: "f2200000-0000-0000-0000-000000000007", slug: "loops", title: "Loops", minutes: 13,
        summary: "Repeat work with for and while.",
        content: [
          { type: "paragraph", text: "A for loop is ideal when you know how many times to repeat, or when you are stepping through a counter. A while loop repeats as long as its condition stays true, which suits situations where the number of repeats is not known in advance." },
          { type: "warning", text: "A while loop must change something the condition depends on, or it will never stop." },
        ] as ContentBlock[],
        example: { title: "Total weekly study time", sourceCode: "const minutes = [25, 40, 30, 45, 20];\nlet total = 0;\nfor (let i = 0; i < minutes.length; i++) {\n  total += minutes[i];\n}\nconsole.log(total);", expectedOutput: "160", explanation: "The loop visits every index from 0 up to length - 1, adding each value to the running total." },
      },
      {
        id: "f2200000-0000-0000-0000-000000000008", slug: "functions-basics", title: "Functions Basics", minutes: 14,
        summary: "Declare, call, and return values from a function.",
        content: [
          { type: "paragraph", text: "A function packages reusable behaviour. function name(parameters) { ... } declares one, and return sends a value back to whoever called it. A function without return produces undefined." },
          { type: "note", text: "Calling a function runs its body immediately. Defining a function only describes what should happen when it is later called." },
        ] as ContentBlock[],
        example: { title: "Convert a percentage", sourceCode: "function completion(done, total) {\n  if (total === 0) return 0;\n  return Math.round((done / total) * 100);\n}\nconsole.log(completion(7, 10));", expectedOutput: "70", explanation: "The guard clause handles a zero total before the division runs." },
        quiz: { prompt: "What does a function return if it has no return statement?", options: ["null", "0", "undefined", "an empty string"], correct: 2 },
      },
    ],
  },
  {
    id: "f2100000-0000-0000-0000-000000000003",
    title: "Functions in Depth",
    slug: "functions-in-depth",
    description: "Treat functions as values and understand closures.",
    lessons: [
      {
        id: "f2200000-0000-0000-0000-000000000009", slug: "functions-as-values", title: "Functions as Values and Arrow Functions", minutes: 12,
        summary: "Write compact functions and pass them around like any other value.",
        content: [
          { type: "paragraph", text: "Functions in JavaScript are values, just like numbers or strings. You can store a function in a binding, pass it as an argument, or write it inline with arrow syntax." },
          { type: "paragraph", text: "An arrow function, (params) => expression, is a compact way to write small functions, especially ones passed into another function." },
        ] as ContentBlock[],
        example: { title: "Two ways to square a number", sourceCode: "function square(n) {\n  return n * n;\n}\nconst squareArrow = (n) => n * n;\nconsole.log(square(5), squareArrow(5));", expectedOutput: "25 25", explanation: "Both forms define equivalent functions; the arrow form skips the function keyword and braces for a single expression." },
      },
      {
        id: "f2200000-0000-0000-0000-000000000010", slug: "scope-and-closures", title: "Scope and Closures", minutes: 16,
        summary: "See how a function remembers the scope it was created in.",
        content: [
          { type: "paragraph", text: "A binding declared with let or const only exists inside the block, function, or file where it was created; this is its scope. A function remembers the scope it was created in, even after that outer function has finished running. This remembered scope is called a closure." },
          { type: "tip", text: "Closures are how counters, caches, and event handlers hold private state without exposing it as a global binding." },
        ] as ContentBlock[],
        example: { title: "A counter with private state", sourceCode: "function makeCounter() {\n  let count = 0;\n  return function () {\n    count += 1;\n    return count;\n  };\n}\nconst next = makeCounter();\nconsole.log(next(), next(), next());", expectedOutput: "1 2 3", explanation: "count lives inside makeCounter's scope. The returned function keeps access to it through a closure, and no outside code can reach count directly." },
        exercise: { title: "Build a step tracker", instructions: "Write makeStepTracker() that returns a function which adds 1 to a hidden total each time it is called and returns the new total. Call it three times.", starterCode: "function makeStepTracker() {\n  // your code\n}\nconst addStep = makeStepTracker();", expectedAnswer: "function makeStepTracker() {\n  let total = 0;\n  return function () {\n    total += 1;\n    return total;\n  };\n}\nconst addStep = makeStepTracker();\nconsole.log(addStep(), addStep(), addStep());" },
      },
    ],
  },
  {
    id: "f2100000-0000-0000-0000-000000000004",
    title: "Data Structures",
    slug: "data-structures",
    description: "Organise related values with arrays and objects, then build a small project.",
    lessons: [
      {
        id: "f2200000-0000-0000-0000-000000000011", slug: "arrays", title: "Arrays", minutes: 14,
        summary: "Store ordered values and transform them with built-in methods.",
        content: [
          { type: "paragraph", text: "An array stores an ordered list of values, accessed by a numeric index starting at 0. Built-in methods like push, map, and filter cover most everyday tasks without writing manual loops." },
          { type: "list", items: ["push adds a value to the end", "map transforms every value into a new array", "filter keeps only the values that pass a test"] },
        ] as ContentBlock[],
        example: { title: "Working with a list of marks", sourceCode: "const marks = [81, 74, 88, 59];\nconst passing = marks.filter((m) => m >= 60);\nconst asPercent = passing.map((m) => `${m}%`);\nconsole.log(asPercent.join(\", \"));", expectedOutput: "81%, 74%, 88%", explanation: "filter keeps values of 60 or higher, then map turns each mark into a percentage string." },
      },
      {
        id: "f2200000-0000-0000-0000-000000000012", slug: "objects", title: "Objects", minutes: 14,
        summary: "Group related values under named keys.",
        content: [
          { type: "paragraph", text: "An object groups related values under named keys, similar to a Python dictionary. Access a property with dot notation when the key is a fixed name, or bracket notation when the key comes from a variable." },
          { type: "paragraph", text: "Object.keys, Object.values, and Object.entries let you loop over an object's contents." },
        ] as ContentBlock[],
        example: { title: "A learner record", sourceCode: "const learner = { name: \"Rutendo\", course: \"JavaScript\", progress: 62 };\nconsole.log(`${learner.name} is ${learner.progress}% through ${learner.course}`);", expectedOutput: "Rutendo is 62% through JavaScript", explanation: "Dot notation reads each property by name, and the template literal weaves the values into a sentence." },
        exercise: { title: "Summarise a course", instructions: "Create an object with title, weeks, and free properties, then log a sentence using all three.", starterCode: "const course = {};\n// add properties and log a summary", expectedAnswer: "const course = { title: \"HTML Essentials\", weeks: 4, free: true };\nconsole.log(`${course.title} runs for ${course.weeks} weeks and is free: ${course.free}`);" },
      },
      {
        id: "f2200000-0000-0000-0000-000000000013", slug: "study-tracker-project", title: "Project: Study Session Tracker", minutes: 24,
        summary: "Combine bindings, arrays, objects, and functions in one original project.",
        content: [
          { type: "paragraph", text: "This project turns a list of study sessions into a useful summary, combining bindings, arrays, objects, and functions from this section." },
          { type: "heading", level: 2, text: "A simple development rhythm" },
          { type: "list", items: ["Describe the result in plain language", "Choose the data structures", "Write the smallest working version", "Test an edge case", "Improve names and presentation"] },
          { type: "note", text: "There is rarely one perfect solution. Prefer a correct, readable version that another learner could explain." },
        ] as ContentBlock[],
        example: { title: "Complete tracker", sourceCode: "const sessions = [\n  { subject: \"JavaScript\", minutes: 35 },\n  { subject: \"SQL\", minutes: 25 },\n  { subject: \"JavaScript\", minutes: 40 },\n];\n\nfunction totalMinutes(items) {\n  return items.reduce((sum, item) => sum + item.minutes, 0);\n}\n\nconsole.log(`Total study time: ${totalMinutes(sessions)} minutes`);", expectedOutput: "Total study time: 100 minutes", explanation: "reduce combines every session's minutes into a single running total, and the function keeps that logic reusable." },
        exercise: { title: "Filter by subject", instructions: "Write sessionsForSubject(items, subject) that returns only the sessions matching that subject. Test it with \"JavaScript\".", starterCode: "function sessionsForSubject(items, subject) {\n  // return matching items\n}", expectedAnswer: "function sessionsForSubject(items, subject) {\n  return items.filter((item) => item.subject === subject);\n}" },
        quiz: { prompt: "Which array method combines every item into a single accumulated value?", options: ["map", "filter", "reduce", "forEach"], correct: 2 },
      },
    ],
  },
]

// --- HTML Essentials -----------------------------------------------------
// Topic outline supplied by the user (a standard beginner HTML curriculum);
// all prose, examples, and exercises below are original writing.

const htmlSections: SectionData[] = [
  {
    id: "f3100000-0000-0000-0000-000000000001",
    title: "Getting Started with HTML",
    slug: "getting-started",
    description: "Write your first page and learn how elements and attributes work.",
    lessons: [
      {
        id: "f3200000-0000-0000-0000-000000000001", slug: "introduction", title: "What Is HTML?", minutes: 7,
        summary: "Understand what HTML does and how to start writing it.",
        content: [
          { type: "paragraph", text: "HTML (HyperText Markup Language) describes the structure of a web page: headings, paragraphs, links, images, and more. A browser reads HTML and renders it as the page you see." },
          { type: "paragraph", text: "You do not need special software to write HTML. Any plain text editor works; browsers open .html files directly, and many free editors add helpful features like colour-coded tags and live previews." },
          { type: "tip", text: "Save a file as index.html, open it in a browser, edit it, save again, and refresh to see your changes." },
        ] as ContentBlock[],
        example: { title: "A one-line page", sourceCode: "<p>Hello, web!</p>", expectedOutput: "Hello, web!", explanation: "A browser reads the <p> tag and displays its text as a paragraph." },
      },
      {
        id: "f3200000-0000-0000-0000-000000000002", slug: "first-page", title: "Your First Web Page", minutes: 10,
        summary: "Learn the doctype, html, head, and body that every page starts with.",
        content: [
          { type: "paragraph", text: "Every HTML page starts with a doctype declaration, followed by an <html> element containing a <head> and a <body>. The head holds information about the page; the body holds what visitors see." },
          { type: "list", items: ["<!DOCTYPE html> tells the browser to use modern standards", "<head> holds the title and other page metadata", "<body> holds the visible content"] },
        ] as ContentBlock[],
        example: { title: "A complete minimal page", sourceCode: "<!DOCTYPE html>\n<html>\n<head>\n  <title>My First Page</title>\n</head>\n<body>\n  <h1>Welcome</h1>\n  <p>This is my first web page.</p>\n</body>\n</html>", expectedOutput: "Welcome\nThis is my first web page.", explanation: "The browser renders the heading and paragraph from the body; the title only appears in the browser tab." },
        exercise: { title: "Build a bio page skeleton", instructions: "Write a complete HTML page with the title \"About Me\" and a heading with your name.", starterCode: "<!DOCTYPE html>\n<html>\n<head>\n  \n</head>\n<body>\n  \n</body>\n</html>", expectedAnswer: "<!DOCTYPE html>\n<html>\n<head>\n  <title>About Me</title>\n</head>\n<body>\n  <h1>Tariro Moyo</h1>\n</body>\n</html>" },
      },
      {
        id: "f3200000-0000-0000-0000-000000000003", slug: "elements-and-attributes", title: "Elements and Attributes", minutes: 9,
        summary: "Learn how tags, content, and attributes fit together.",
        content: [
          { type: "paragraph", text: "An HTML element usually has an opening tag, content, and a closing tag, such as <p>text</p>. Some elements, like <img> and <br>, are self-closing and hold no inner content." },
          { type: "paragraph", text: "An attribute adds extra information to an opening tag, written as name=\"value\". Attributes never appear on the closing tag." },
          { type: "note", text: "Elements can nest inside each other, but they must close in the reverse order they opened." },
        ] as ContentBlock[],
        example: { title: "An element with an attribute", sourceCode: "<p lang=\"en\">Welcome to Dzidza Hub.</p>", expectedOutput: "Welcome to Dzidza Hub.", explanation: "lang is an attribute that tells the browser (and assistive technology) the paragraph's language." },
      },
      {
        id: "f3200000-0000-0000-0000-000000000004", slug: "headings-and-paragraphs", title: "Headings and Paragraphs", minutes: 9,
        summary: "Structure text with heading levels and paragraphs.",
        content: [
          { type: "paragraph", text: "<h1> through <h6> create headings of decreasing importance. Use exactly one <h1> per page for the main title, then step down through the levels to show structure." },
          { type: "paragraph", text: "<p> creates a paragraph. Browsers add space above and below it automatically; extra blank lines or spaces in your source code are collapsed and ignored." },
        ] as ContentBlock[],
        example: { title: "A structured section", sourceCode: "<h1>Learn HTML</h1>\n<h2>Why it matters</h2>\n<p>HTML is the foundation every web page is built on.</p>", expectedOutput: "Learn HTML\nWhy it matters\nHTML is the foundation every web page is built on.", explanation: "The heading levels show that \"Why it matters\" is a subsection of \"Learn HTML\"." },
        quiz: { prompt: "Which heading tag should appear only once, for a page's main title?", options: ["<h6>", "<h1>", "<p>", "<head>"], correct: 1 },
      },
    ],
  },
  {
    id: "f3100000-0000-0000-0000-000000000002",
    title: "Formatting Text and Colour",
    slug: "formatting-text",
    description: "Emphasise text, leave comments, and add your first styles.",
    lessons: [
      {
        id: "f3200000-0000-0000-0000-000000000005", slug: "formatting-and-quotations", title: "Text Formatting and Quotations", minutes: 8,
        summary: "Emphasise words and mark up quotations.",
        content: [
          { type: "paragraph", text: "<strong> marks text as important (usually shown bold), and <em> marks text with stress emphasis (usually shown italic). <br> forces a line break, and <hr> draws a horizontal divider." },
          { type: "paragraph", text: "<blockquote> sets off a longer quoted passage, while the shorter, inline <q> tag wraps a quotation within a sentence." },
        ] as ContentBlock[],
        example: { title: "Emphasising key words", sourceCode: "<p><strong>Warning:</strong> save your work <em>before</em> closing the editor.</p>", expectedOutput: "Warning: save your work before closing the editor.", explanation: "strong and em change meaning, not just appearance; screen readers announce them differently from plain text." },
      },
      {
        id: "f3200000-0000-0000-0000-000000000006", slug: "comments-and-colors", title: "Comments and Colours", minutes: 8,
        summary: "Leave notes in your markup and describe colours precisely.",
        content: [
          { type: "paragraph", text: "An HTML comment, <!-- like this -->, is ignored by the browser. Use comments to leave notes for yourself or teammates." },
          { type: "paragraph", text: "Colours can be named (\"tomato\"), written as hex codes (#ff6347), or written with rgb(). Hex and rgb give precise control; named colours are quick for prototyping." },
        ] as ContentBlock[],
        example: { title: "A commented, coloured heading", sourceCode: "<!-- Section: hero banner -->\n<h1 style=\"color: #2563eb;\">Dzidza Hub</h1>", expectedOutput: "Dzidza Hub", explanation: "The comment never renders. The style attribute sets the heading's text colour using a hex code." },
      },
      {
        id: "f3200000-0000-0000-0000-000000000007", slug: "introducing-css", title: "Introducing CSS", minutes: 12,
        summary: "See the three ways to attach CSS to an HTML page.",
        content: [
          { type: "paragraph", text: "CSS controls how HTML looks. You can add it three ways: inline with the style attribute, inside a <style> block in the head, or linked from a separate .css file with <link>." },
          { type: "tip", text: "Inline styles are fine for quick experiments. Real projects almost always use a <style> block or a linked stylesheet, so the look of many elements can change from one place." },
        ] as ContentBlock[],
        example: { title: "Styling with a style block", sourceCode: "<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    p { color: teal; font-size: 18px; }\n  </style>\n</head>\n<body>\n  <p>Styled from the head.</p>\n</body>\n</html>", expectedOutput: "Styled from the head.", explanation: "The rule inside <style> applies to every <p> element on the page, without repeating the style attribute." },
        exercise: { title: "Link a stylesheet", instructions: "Add a <link> tag inside <head> that connects an external stylesheet named styles.css.", starterCode: "<head>\n  <title>My Page</title>\n</head>", expectedAnswer: "<head>\n  <title>My Page</title>\n  <link rel=\"stylesheet\" href=\"styles.css\">\n</head>" },
      },
    ],
  },
  {
    id: "f3100000-0000-0000-0000-000000000003",
    title: "Links, Images, and Media",
    slug: "links-images-media",
    description: "Connect pages together and embed images, audio, and video.",
    lessons: [
      {
        id: "f3200000-0000-0000-0000-000000000008", slug: "links-and-paths", title: "Links and File Paths", minutes: 10,
        summary: "Point to other pages with absolute and relative paths.",
        content: [
          { type: "paragraph", text: "<a href=\"...\"> creates a hyperlink. An absolute URL (https://example.com) points anywhere on the web; a relative path (about.html or images/photo.jpg) points to another file in your own project." },
          { type: "list", items: ["href points to the destination", "target=\"_blank\" opens the link in a new tab", "A path starting with / begins at the site's root"] },
        ] as ContentBlock[],
        example: { title: "Internal and external links", sourceCode: "<a href=\"about.html\">About us</a>\n<a href=\"https://developer.mozilla.org\" target=\"_blank\">MDN Docs</a>", expectedOutput: "About us\nMDN Docs", explanation: "The first link uses a relative path within the same project; the second opens an external site in a new tab." },
        exercise: { title: "Link to a section", instructions: "Write a link to a page named contact.html with the visible text \"Contact\".", expectedAnswer: "<a href=\"contact.html\">Contact</a>" },
      },
      {
        id: "f3200000-0000-0000-0000-000000000009", slug: "images-favicon-title", title: "Images, Favicon, and Page Title", minutes: 10,
        summary: "Embed pictures and set the details shown in a browser tab.",
        content: [
          { type: "paragraph", text: "<img src=\"...\" alt=\"...\"> embeds a picture. alt describes the image for people using screen readers and appears if the image fails to load; never leave it out." },
          { type: "paragraph", text: "A favicon is the small icon shown in a browser tab, added with a <link rel=\"icon\"> tag in the head. The <title> element sets the text shown in that same tab." },
        ] as ContentBlock[],
        example: { title: "An image with alt text", sourceCode: "<img src=\"logo.png\" alt=\"Dzidza Hub logo\" width=\"120\">", expectedOutput: "[Dzidza Hub logo]", explanation: "width sets a display size in pixels; alt is the text shown if logo.png cannot be found." },
      },
      {
        id: "f3200000-0000-0000-0000-000000000010", slug: "audio-and-video", title: "Audio and Video", minutes: 9,
        summary: "Embed playable media directly in a page.",
        content: [
          { type: "paragraph", text: "<audio controls> and <video controls> embed playable media without any extra plugin. The controls attribute shows a built-in play bar; multiple <source> elements let the browser pick a format it supports." },
          { type: "note", text: "Always provide fallback text between the opening and closing tag for browsers that cannot play the media." },
        ] as ContentBlock[],
        example: { title: "Embedding a video", sourceCode: "<video controls width=\"320\">\n  <source src=\"intro.mp4\" type=\"video/mp4\">\n  Your browser does not support video playback.\n</video>", expectedOutput: "[video player]", explanation: "The browser tries each <source> in order and falls back to the plain text if none can play." },
        quiz: { prompt: "Which attribute makes an image accessible to screen readers?", options: ["src", "width", "alt", "title"], correct: 2 },
      },
    ],
  },
  {
    id: "f3100000-0000-0000-0000-000000000004",
    title: "Structuring a Page",
    slug: "structuring-content",
    description: "Organise content with tables, lists, containers, and semantic layout.",
    lessons: [
      {
        id: "f3200000-0000-0000-0000-000000000011", slug: "tables", title: "Tables", minutes: 9,
        summary: "Present tabular data with table, tr, th, and td.",
        content: [
          { type: "paragraph", text: "A table is built from <table>, rows with <tr>, header cells with <th>, and data cells with <td>. Use tables for genuinely tabular data, not for page layout." },
        ] as ContentBlock[],
        example: { title: "A small results table", sourceCode: "<table>\n  <tr><th>Subject</th><th>Mark</th></tr>\n  <tr><td>Maths</td><td>81</td></tr>\n  <tr><td>English</td><td>74</td></tr>\n</table>", expectedOutput: "Subject Mark\nMaths 81\nEnglish 74", explanation: "<th> cells render as bold headers by default, while <td> cells hold ordinary data." },
      },
      {
        id: "f3200000-0000-0000-0000-000000000012", slug: "lists", title: "Lists", minutes: 8,
        summary: "Group related items with ordered and unordered lists.",
        content: [
          { type: "paragraph", text: "<ul> creates an unordered (bulleted) list, <ol> creates an ordered (numbered) list, and each item inside either one is an <li>. Lists can nest to represent sub-items." },
        ] as ContentBlock[],
        example: { title: "Ordered steps", sourceCode: "<ol>\n  <li>Write the HTML</li>\n  <li>Add styles</li>\n  <li>Test in a browser</li>\n</ol>", expectedOutput: "1. Write the HTML\n2. Add styles\n3. Test in a browser", explanation: "<ol> numbers its items automatically; reordering the <li> elements renumbers the list." },
      },
      {
        id: "f3200000-0000-0000-0000-000000000013", slug: "block-inline-div", title: "Block, Inline, and the div Element", minutes: 10,
        summary: "Understand the two ways elements occupy space on a page.",
        content: [
          { type: "paragraph", text: "Block-level elements, such as <p>, <h1>, and <div>, start on a new line and take the full available width. Inline elements, such as <span>, <a>, and <strong>, flow within a line of text." },
          { type: "paragraph", text: "<div> is a generic block container with no meaning of its own; it exists to group other elements so you can style or position them together." },
        ] as ContentBlock[],
        example: { title: "Grouping with div and span", sourceCode: "<div>\n  <p>Score: <span style=\"color: green;\">92</span></p>\n</div>", expectedOutput: "Score: 92", explanation: "The div groups the paragraph as a block; the span colours just the number inline, without breaking the line." },
      },
      {
        id: "f3200000-0000-0000-0000-000000000014", slug: "classes-and-id", title: "Classes and Id", minutes: 10,
        summary: "Target elements for styling with class and id.",
        content: [
          { type: "paragraph", text: "A class attribute labels an element for reuse; the same class can appear on many elements, and CSS or JavaScript can target them all at once with .classname. An id must be unique on the page and is targeted with #idname." },
          { type: "tip", text: "Reach for a class first. Save id for a single, specific element, such as one you need to link to or select in JavaScript." },
        ] as ContentBlock[],
        example: { title: "Styling by class", sourceCode: "<style>\n  .highlight { background: yellow; }\n</style>\n<p class=\"highlight\">Important note</p>\n<p>Regular text</p>", expectedOutput: "Important note\nRegular text", explanation: "Every element with class=\"highlight\" receives the yellow background, while other elements are unaffected." },
        exercise: { title: "Give an element a unique id", instructions: "Add an id of \"main-heading\" to this <h1> element.", starterCode: "<h1>Dzidza Hub</h1>", expectedAnswer: "<h1 id=\"main-heading\">Dzidza Hub</h1>" },
      },
      {
        id: "f3200000-0000-0000-0000-000000000015", slug: "semantic-layout", title: "Semantic Layout", minutes: 12,
        summary: "Use header, nav, main, and footer to describe a page's regions.",
        content: [
          { type: "paragraph", text: "Semantic elements describe the role of their content, not just its box on the page: <header>, <nav>, <main>, <section>, <article>, and <footer> replace generic divs where a more specific meaning fits." },
          { type: "paragraph", text: "Semantic markup helps search engines and assistive technology understand a page, on top of any visual styling you add separately." },
        ] as ContentBlock[],
        example: { title: "A semantic page skeleton", sourceCode: "<body>\n  <header><h1>Dzidza Hub</h1></header>\n  <nav><a href=\"/courses\">Courses</a></nav>\n  <main>\n    <section>\n      <h2>Free Learning</h2>\n    </section>\n  </main>\n  <footer><p>&copy; 2026 Dzidza Hub</p></footer>\n</body>", expectedOutput: "Dzidza Hub\nCourses\nFree Learning\n© 2026 Dzidza Hub", explanation: "Each region has a clear role: header, nav, main content, and footer, instead of unlabelled divs." },
        quiz: { prompt: "Which element should wrap a page's primary, non-repeated content?", options: ["<header>", "<main>", "<nav>", "<footer>"], correct: 1 },
      },
    ],
  },
  {
    id: "f3100000-0000-0000-0000-000000000005",
    title: "Forms and Interactivity",
    slug: "forms-and-interactivity",
    description: "Collect input, connect JavaScript, and make pages responsive.",
    lessons: [
      {
        id: "f3200000-0000-0000-0000-000000000016", slug: "buttons-and-iframes", title: "Buttons and Iframes", minutes: 8,
        summary: "Add clickable controls and embed another page.",
        content: [
          { type: "paragraph", text: "<button> creates a clickable control; its type attribute (button, submit, or reset) decides what it does inside a form. <iframe> embeds another web page inside the current one, such as a map or a video." },
        ] as ContentBlock[],
        example: { title: "A simple button", sourceCode: "<button type=\"button\">Enroll now</button>", expectedOutput: "[Enroll now]", explanation: "type=\"button\" keeps this button from submitting any surrounding form; it only responds to JavaScript you attach to it." },
      },
      {
        id: "f3200000-0000-0000-0000-000000000017", slug: "building-a-form", title: "Building a Form", minutes: 11,
        summary: "Group inputs and labels inside a form.",
        content: [
          { type: "paragraph", text: "<form> wraps a group of inputs that get sent together. action sets where the data goes, and method sets how (usually get or post). Pair every input with a <label> so users know what to type." },
        ] as ContentBlock[],
        example: { title: "A short sign-up form", sourceCode: "<form action=\"/subscribe\" method=\"post\">\n  <label for=\"email\">Email</label>\n  <input type=\"email\" id=\"email\" name=\"email\">\n  <button type=\"submit\">Subscribe</button>\n</form>", expectedOutput: "Email [input] [Subscribe]", explanation: "The label's for attribute matches the input's id, so clicking the label focuses the input." },
      },
      {
        id: "f3200000-0000-0000-0000-000000000018", slug: "input-types-and-attributes", title: "Input Types and Attributes", minutes: 12,
        summary: "Pick the right input type and add built-in validation.",
        content: [
          { type: "paragraph", text: "The type attribute changes what an <input> does: text, email, password, number, date, checkbox, and radio each show a different control and, for some, built-in validation." },
          { type: "list", items: ["required stops submission until the field is filled in", "placeholder shows faint example text inside an empty field", "maxlength limits how many characters can be typed"] },
        ] as ContentBlock[],
        example: { title: "A validated number field", sourceCode: "<input type=\"number\" name=\"age\" min=\"13\" max=\"120\" required>", expectedOutput: "[number input]", explanation: "The browser refuses to submit the form if age is left empty or falls outside 13 to 120." },
        exercise: { title: "Add a password field", instructions: "Write a labelled password input with the name \"password\", required, and a minimum length of 8.", expectedAnswer: "<label for=\"password\">Password</label>\n<input type=\"password\" id=\"password\" name=\"password\" required minlength=\"8\">" },
      },
      {
        id: "f3200000-0000-0000-0000-000000000019", slug: "bringing-in-javascript", title: "Bringing In JavaScript", minutes: 11,
        summary: "Attach behaviour to a page with the script tag.",
        content: [
          { type: "paragraph", text: "A <script> tag adds JavaScript to a page, either inline or via src=\"file.js\". Placing scripts just before </body>, or adding the defer attribute, lets the page's HTML load first." },
        ] as ContentBlock[],
        example: { title: "Reacting to a click", sourceCode: "<button id=\"greet\">Say hello</button>\n<script>\n  document.getElementById(\"greet\").addEventListener(\"click\", () => {\n    alert(\"Hello from JavaScript!\");\n  });\n</script>", expectedOutput: "[button that alerts on click]", explanation: "The script finds the button by its id and attaches a click handler, a pattern covered in more depth in the JavaScript Foundations tutorial." },
      },
      {
        id: "f3200000-0000-0000-0000-000000000020", slug: "responsive-and-entities", title: "Responsive Pages and Entities", minutes: 10,
        summary: "Fit pages to small screens and write reserved characters safely.",
        content: [
          { type: "paragraph", text: "The viewport meta tag, <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">, tells mobile browsers to match the page width to the screen instead of zooming out to fit a desktop layout." },
          { type: "paragraph", text: "Some characters have special meaning in HTML, so entities represent them safely: &lt; for <, &gt; for >, &amp; for &, and &nbsp; for a non-breaking space." },
        ] as ContentBlock[],
        example: { title: "A responsive head with an entity", sourceCode: "<head>\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n</head>\n<body>\n  <p>Prices start at &pound;5.</p>\n</body>", expectedOutput: "Prices start at £5.", explanation: "&pound; renders as the pound sign; writing the raw symbol can break some file encodings, so the entity is the safer choice." },
        quiz: { prompt: "Which entity displays a literal < character on the page?", options: ["&amp;", "&lt;", "&gt;", "&nbsp;"], correct: 1 },
      },
    ],
  },
  {
    id: "f3100000-0000-0000-0000-000000000006",
    title: "Beyond the Basics",
    slug: "beyond-the-basics",
    description: "Glimpse graphics and browser APIs, then build a complete page.",
    lessons: [
      {
        id: "f3200000-0000-0000-0000-000000000021", slug: "canvas-svg-and-apis", title: "A Glimpse of Canvas, SVG, and Web APIs", minutes: 9,
        summary: "See what graphics and browser APIs make possible beyond markup.",
        content: [
          { type: "paragraph", text: "<canvas> gives JavaScript a blank area to draw pixels on, useful for charts, games, and generated graphics. <svg> instead describes shapes with markup, so they stay sharp at any size and can be styled with CSS." },
          { type: "paragraph", text: "Modern browsers also expose Web APIs beyond markup and styling: geolocation can request a visitor's approximate location, drag-and-drop lets users move elements around the page, and web storage saves small amounts of data between visits." },
          { type: "note", text: "These are deliberately introduced only briefly here. Each one is a substantial topic on its own, worth a dedicated tutorial once you are comfortable with core HTML, CSS, and JavaScript." },
        ] as ContentBlock[],
        example: { title: "A shape drawn with SVG", sourceCode: "<svg width=\"100\" height=\"100\">\n  <circle cx=\"50\" cy=\"50\" r=\"40\" fill=\"#2563eb\" />\n</svg>", expectedOutput: "[blue circle]", explanation: "SVG shapes are elements in the page, so they can be selected and styled the same way as any other HTML." },
      },
      {
        id: "f3200000-0000-0000-0000-000000000022", slug: "profile-page-project", title: "Project: Personal Profile Page", minutes: 22,
        summary: "Combine structure, text, links, an image, a list, and a form into one page.",
        content: [
          { type: "paragraph", text: "This project combines structure, text, a list, and a form into one original page, using only what this tutorial has covered." },
          { type: "heading", level: 2, text: "A simple development rhythm" },
          { type: "list", items: ["Sketch the sections on paper first", "Add the semantic structure before any styling", "Fill in real content", "Check the page still makes sense with images turned off", "Add small style touches last"] },
        ] as ContentBlock[],
        example: { title: "A complete profile page", sourceCode: "<!DOCTYPE html>\n<html>\n<head>\n  <title>Tariro Moyo</title>\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n</head>\n<body>\n  <header>\n    <h1>Tariro Moyo</h1>\n    <p>Aspiring web developer, Bulawayo.</p>\n  </header>\n  <main>\n    <section>\n      <h2>Skills</h2>\n      <ul>\n        <li>HTML</li>\n        <li>CSS</li>\n      </ul>\n    </section>\n    <section>\n      <h2>Contact</h2>\n      <form>\n        <label for=\"message\">Message</label>\n        <input type=\"text\" id=\"message\" name=\"message\">\n        <button type=\"submit\">Send</button>\n      </form>\n    </section>\n  </main>\n  <footer><p>&copy; 2026 Tariro Moyo</p></footer>\n</body>\n</html>", expectedOutput: "Tariro Moyo\nAspiring web developer, Bulawayo.\nSkills\nHTML\nCSS\nContact\nMessage [input] [Send]\n© 2026 Tariro Moyo", explanation: "Every tag here was covered earlier in this tutorial: semantic layout, headings, a list, and a labelled form." },
        exercise: { title: "Add a projects section", instructions: "Add a new <section> after Skills with an <h2>Projects</h2> heading and an unordered list containing one project name.", starterCode: "<section>\n  <h2>Skills</h2>\n  <ul>\n    <li>HTML</li>\n    <li>CSS</li>\n  </ul>\n</section>\n<!-- add your section here -->", expectedAnswer: "<section>\n  <h2>Projects</h2>\n  <ul>\n    <li>Personal profile page</li>\n  </ul>\n</section>" },
      },
    ],
  },
]

function sumMinutes(sectionList: SectionData[]): number {
  return sectionList.reduce((sum, section) => sum + section.lessons.reduce((s, lesson) => s + lesson.minutes, 0), 0)
}

const javascriptConfig: TutorialConfig = {
  famPrefix: "f2",
  language: "javascript",
  slug: "javascript",
  title: "JavaScript Foundations",
  shortDescription: "Learn JavaScript through clear explanations and practical, browser-ready examples.",
  description: "Build reliable JavaScript foundations with original, step-by-step lessons covering values, control flow, functions, closures, and data structures, finishing with a small project.",
  icon: "Braces",
  difficulty: "beginner",
  publishedAt: "2026-08-21T00:00:00Z",
  sections: javascriptSections,
}

const htmlConfig: TutorialConfig = {
  famPrefix: "f3",
  language: "html",
  slug: "html",
  title: "HTML Essentials",
  shortDescription: "Learn to structure real web pages, from your first tag to a complete profile page.",
  description: "Work through original, step-by-step HTML lessons covering document structure, text, links and media, layout, forms, and a glimpse of graphics and browser APIs, finishing with a project.",
  icon: "FileCode2",
  difficulty: "beginner",
  publishedAt: "2026-08-21T00:00:00Z",
  sections: htmlSections,
}

async function seedGenericTutorial(prisma: PrismaClient, config: TutorialConfig) {
  const fam = config.famPrefix
  const tutorialId = `${fam}000000-0000-0000-0000-000000000001`
  const tutorial = await prisma.tutorial.upsert({
    where: { slug: config.slug },
    update: { title: config.title, shortDescription: config.shortDescription, description: config.description, icon: config.icon, difficulty: config.difficulty, estimatedDuration: sumMinutes(config.sections), status: "published", publishedAt: new Date(config.publishedAt) },
    create: { id: tutorialId, slug: config.slug, title: config.title, shortDescription: config.shortDescription, description: config.description, icon: config.icon, difficulty: config.difficulty, estimatedDuration: sumMinutes(config.sections), status: "published", publishedAt: new Date(config.publishedAt) },
  })

  for (const [sectionOrder, sectionData] of config.sections.entries()) {
    const section = await prisma.tutorialSection.upsert({
      where: { id: sectionData.id },
      update: { tutorialId: tutorial.id, title: sectionData.title, slug: sectionData.slug, description: sectionData.description, order: sectionOrder },
      create: { id: sectionData.id, tutorialId: tutorial.id, title: sectionData.title, slug: sectionData.slug, description: sectionData.description, order: sectionOrder },
    })
    for (const [lessonOrder, lessonData] of sectionData.lessons.entries()) {
      const lesson = await prisma.tutorialLesson.upsert({
        where: { id: lessonData.id },
        update: { sectionId: section.id, title: lessonData.title, slug: lessonData.slug, summary: lessonData.summary, content: lessonData.content, order: lessonOrder, estimatedMinutes: lessonData.minutes, isPublished: true },
        create: { id: lessonData.id, sectionId: section.id, title: lessonData.title, slug: lessonData.slug, summary: lessonData.summary, content: lessonData.content, order: lessonOrder, estimatedMinutes: lessonData.minutes, isPublished: true },
      })
      const marker = `${fam}20`
      if (lessonData.example) {
        const exampleId = lesson.id.replace(marker, `${fam}30`)
        await prisma.tutorialCodeExample.upsert({
          where: { id: exampleId },
          update: { lessonId: lesson.id, title: lessonData.example.title, language: config.language, sourceCode: lessonData.example.sourceCode, expectedOutput: lessonData.example.expectedOutput, explanation: lessonData.example.explanation, order: 0 },
          create: { id: exampleId, lessonId: lesson.id, title: lessonData.example.title, language: config.language, sourceCode: lessonData.example.sourceCode, expectedOutput: lessonData.example.expectedOutput, explanation: lessonData.example.explanation, order: 0 },
        })
      }
      if (lessonData.exercise) {
        const exerciseId = lesson.id.replace(marker, `${fam}40`)
        await prisma.tutorialExercise.upsert({
          where: { id: exerciseId },
          update: { lessonId: lesson.id, ...lessonData.exercise, order: 0 },
          create: { id: exerciseId, lessonId: lesson.id, ...lessonData.exercise, order: 0 },
        })
      }
      if (lessonData.quiz) {
        const quizId = lesson.id.replace(marker, `${fam}50`)
        const questionId = lesson.id.replace(marker, `${fam}60`)
        const optionBase = lesson.id.replace(marker, `${fam}70`)
        const quiz = await prisma.tutorialQuiz.upsert({ where: { lessonId: lesson.id }, update: { title: "Quick check" }, create: { id: quizId, lessonId: lesson.id, title: "Quick check" } })
        const question = await prisma.tutorialQuizQuestion.upsert({ where: { id: questionId }, update: { quizId: quiz.id, prompt: lessonData.quiz.prompt, order: 0 }, create: { id: questionId, quizId: quiz.id, prompt: lessonData.quiz.prompt, order: 0 } })
        for (const [optionOrder, text] of lessonData.quiz.options.entries()) {
          const id = `${optionBase.slice(0, -1)}${optionOrder}`
          await prisma.tutorialQuizOption.upsert({ where: { id }, update: { questionId: question.id, text, isCorrect: optionOrder === lessonData.quiz.correct, order: optionOrder }, create: { id, questionId: question.id, text, isCorrect: optionOrder === lessonData.quiz.correct, order: optionOrder } })
        }
      }
    }
  }
}

export async function seedTutorials(prisma: PrismaClient) {
  const tutorial = await prisma.tutorial.upsert({
    where: { slug: "python" },
    update: { title: "Python Foundations", shortDescription: "Learn Python through clear explanations and practical Zimbabwean examples.", description: "Build reliable programming foundations with original, step-by-step lessons, exercises, and a practical study-tracker project.", icon: "Code2", difficulty: "beginner", estimatedDuration: 117, status: "published", publishedAt: new Date("2026-08-19T00:00:00Z") },
    create: { id: "f1000000-0000-0000-0000-000000000001", slug: "python", title: "Python Foundations", shortDescription: "Learn Python through clear explanations and practical Zimbabwean examples.", description: "Build reliable programming foundations with original, step-by-step lessons, exercises, and a practical study-tracker project.", icon: "Code2", difficulty: "beginner", estimatedDuration: 117, status: "published", publishedAt: new Date("2026-08-19T00:00:00Z") },
  })

  for (const [sectionOrder, sectionData] of sections.entries()) {
    const section = await prisma.tutorialSection.upsert({
      where: { id: sectionData.id },
      update: { tutorialId: tutorial.id, title: sectionData.title, slug: sectionData.slug, description: sectionData.description, order: sectionOrder },
      create: { id: sectionData.id, tutorialId: tutorial.id, title: sectionData.title, slug: sectionData.slug, description: sectionData.description, order: sectionOrder },
    })
    for (const [lessonOrder, lessonData] of sectionData.lessons.entries()) {
      const lesson = await prisma.tutorialLesson.upsert({
        where: { id: lessonData.id },
        update: { sectionId: section.id, title: lessonData.title, slug: lessonData.slug, summary: lessonData.summary, content: lessonData.content, order: lessonOrder, estimatedMinutes: lessonData.minutes, isPublished: true },
        create: { id: lessonData.id, sectionId: section.id, title: lessonData.title, slug: lessonData.slug, summary: lessonData.summary, content: lessonData.content, order: lessonOrder, estimatedMinutes: lessonData.minutes, isPublished: true },
      })
      if ("example" in lessonData && lessonData.example) {
        const exampleId = lesson.id.replace("f120", "f130")
        await prisma.tutorialCodeExample.upsert({
          where: { id: exampleId },
          update: { lessonId: lesson.id, title: lessonData.example.title, language: "python", sourceCode: lessonData.example.sourceCode, expectedOutput: lessonData.example.expectedOutput, explanation: lessonData.example.explanation, order: 0 },
          create: { id: exampleId, lessonId: lesson.id, title: lessonData.example.title, language: "python", sourceCode: lessonData.example.sourceCode, expectedOutput: lessonData.example.expectedOutput, explanation: lessonData.example.explanation, order: 0 },
        })
      }
      if ("exercise" in lessonData && lessonData.exercise) {
        await prisma.tutorialExercise.upsert({
          where: { id: lesson.id.replace("f120", "f140") },
          update: { lessonId: lesson.id, ...lessonData.exercise, order: 0 },
          create: { id: lesson.id.replace("f120", "f140"), lessonId: lesson.id, ...lessonData.exercise, order: 0 },
        })
      }
      if ("quiz" in lessonData && lessonData.quiz) {
        const quiz = await prisma.tutorialQuiz.upsert({ where: { lessonId: lesson.id }, update: { title: "Quick check" }, create: { id: lesson.id.replace("f120", "f150"), lessonId: lesson.id, title: "Quick check" } })
        const question = await prisma.tutorialQuizQuestion.upsert({ where: { id: lesson.id.replace("f120", "f160") }, update: { quizId: quiz.id, prompt: lessonData.quiz.prompt, order: 0 }, create: { id: lesson.id.replace("f120", "f160"), quizId: quiz.id, prompt: lessonData.quiz.prompt, order: 0 } })
        for (const [optionOrder, text] of lessonData.quiz.options.entries()) {
          const id = `f1700000-0000-0000-0000-00000000000${optionOrder + 1}`
          await prisma.tutorialQuizOption.upsert({ where: { id }, update: { questionId: question.id, text, isCorrect: optionOrder === lessonData.quiz.correct, order: optionOrder }, create: { id, questionId: question.id, text, isCorrect: optionOrder === lessonData.quiz.correct, order: optionOrder } })
        }
      }
    }
  }

  await seedGenericTutorial(prisma, javascriptConfig)
  await seedGenericTutorial(prisma, htmlConfig)
}
