import type { PrismaClient } from "../lib/generated/prisma/client"

type ContentBlock = { type: "paragraph" | "heading" | "note" | "tip" | "warning" | "list"; text?: string; items?: string[]; level?: number }

const sections = [
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
}
