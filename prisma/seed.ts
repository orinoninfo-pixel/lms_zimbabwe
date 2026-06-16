import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  await prisma.platformSetting.upsert({
    where: { key: "platformName" },
    update: { value: "Learnify" },
    create: { key: "platformName", value: "Learnify" },
  })
  await prisma.platformSetting.upsert({
    where: { key: "supportEmail" },
    update: { value: "support@learnify.co.zw" },
    create: { key: "supportEmail", value: "support@learnify.co.zw" },
  })
  await prisma.platformSetting.upsert({
    where: { key: "commissionRateBps" },
    update: { value: "1500" },
    create: { key: "commissionRateBps", value: "1500" },
  })
  await prisma.platformSetting.upsert({
    where: { key: "payoutMinimumZar" },
    update: { value: "20" },
    create: { key: "payoutMinimumZar", value: "20" },
  })

  await prisma.user.upsert({
    where: { email: "admin@lms.local" },
    update: { name: "Naledi Admin", role: "admin", status: "active" },
    create: { email: "admin@lms.local", name: "Naledi Admin", role: "admin", status: "active" },
  })

  const instructor = await prisma.user.upsert({
    where: { email: "instructor@lms.local" },
    update: { name: "Sarah Instructor", role: "instructor", status: "active" },
    create: { email: "instructor@lms.local", name: "Sarah Instructor", role: "instructor", status: "active" },
  })

  const student = await prisma.user.upsert({
    where: { email: "student@lms.local" },
    update: { name: "John Student", role: "student", status: "active" },
    create: { email: "student@lms.local", name: "John Student", role: "student", status: "active" },
  })

  const applicant = await prisma.user.upsert({
    where: { email: "applicant@lms.local" },
    update: { name: "Thabo Applicant", role: "student", status: "active" },
    create: { email: "applicant@lms.local", name: "Thabo Applicant", role: "student", status: "active" },
  })

  await prisma.instructorApplication.upsert({
    where: { userId: applicant.id },
    update: { status: "pending" },
    create: { userId: applicant.id, status: "pending" },
  })

  const [catIt, catBusiness, catDesign] = await Promise.all([
    prisma.category.upsert({
      where: { slug: "it-software" },
      update: { name: "IT & Software" },
      create: { name: "IT & Software", slug: "it-software" },
    }),
    prisma.category.upsert({
      where: { slug: "business" },
      update: { name: "Business" },
      create: { name: "Business", slug: "business" },
    }),
    prisma.category.upsert({
      where: { slug: "design" },
      update: { name: "Design" },
      create: { name: "Design", slug: "design" },
    }),
  ])

  const [catMath, catExamPrep, catHomeworkHelp, catHoliday] = await Promise.all([
    prisma.category.upsert({
      where: { slug: "mathematics" },
      update: { name: "Mathematics" },
      create: { name: "Mathematics", slug: "mathematics" },
    }),
    prisma.category.upsert({
      where: { slug: "exam-preparation" },
      update: { name: "Exam Preparation" },
      create: { name: "Exam Preparation", slug: "exam-preparation" },
    }),
    prisma.category.upsert({
      where: { slug: "homework-help" },
      update: { name: "Homework Help" },
      create: { name: "Homework Help", slug: "homework-help" },
    }),
    prisma.category.upsert({
      where: { slug: "holiday-catch-up" },
      update: { name: "Holiday Catch-up" },
      create: { name: "Holiday Catch-up", slug: "holiday-catch-up" },
    }),
  ])

  await prisma.category.createMany({
    data: [
      { name: "Mathematical Literacy", slug: "mathematical-literacy" },
      { name: "Physical Sciences", slug: "physical-sciences" },
      { name: "Life Sciences", slug: "life-sciences" },
      { name: "Accounting", slug: "accounting" },
      { name: "Business Studies", slug: "business-studies" },
      { name: "Economics", slug: "economics" },
      { name: "English", slug: "english" },
      { name: "Afrikaans", slug: "afrikaans" },
      { name: "Geography", slug: "geography" },
      { name: "History", slug: "history" },
      { name: "CAT", slug: "cat" },
      { name: "IT", slug: "it" },
    ],
    skipDuplicates: true,
  })

  const course1 = await prisma.course.upsert({
    where: { id: "11111111-1111-1111-1111-111111111111" },
    update: {
      title: "Complete Web Development Bootcamp",
      description: "Learn HTML, CSS, JavaScript, React, and Node.js by building real projects.",
      price: 899,
      instructorId: instructor.id,
      status: "approved",
      featured: true,
      categoryId: catIt.id,
    },
    create: {
      id: "11111111-1111-1111-1111-111111111111",
      title: "Complete Web Development Bootcamp",
      description: "Learn HTML, CSS, JavaScript, React, and Node.js by building real projects.",
      price: 899,
      instructorId: instructor.id,
      status: "approved",
      featured: true,
      categoryId: catIt.id,
    },
  })

  const course2 = await prisma.course.upsert({
    where: { id: "22222222-2222-2222-2222-222222222222" },
    update: {
      title: "Data Science with Python",
      description: "Learn Python, pandas, visualization, and fundamentals of machine learning.",
      price: 1099,
      instructorId: instructor.id,
      status: "pending",
      featured: false,
      categoryId: catBusiness.id,
    },
    create: {
      id: "22222222-2222-2222-2222-222222222222",
      title: "Data Science with Python",
      description: "Learn Python, pandas, visualization, and fundamentals of machine learning.",
      price: 1099,
      instructorId: instructor.id,
      status: "pending",
      featured: false,
      categoryId: catBusiness.id,
    },
  })

  const course3 = await prisma.course.upsert({
    where: { id: "33333333-3333-3333-3333-333333333333" },
    update: {
      title: "UI/UX Design Masterclass",
      description: "Design better products with practical UI/UX workflows and case studies.",
      price: 799,
      instructorId: instructor.id,
      status: "approved",
      featured: false,
      categoryId: catDesign.id,
    },
    create: {
      id: "33333333-3333-3333-3333-333333333333",
      title: "UI/UX Design Masterclass",
      description: "Design better products with practical UI/UX workflows and case studies.",
      price: 799,
      instructorId: instructor.id,
      status: "approved",
      featured: false,
      categoryId: catDesign.id,
    },
  })

  const pkgMath12Id = "abababab-0000-0000-0000-000000000001"
  const pkgMath10Id = "abababab-0000-0000-0000-000000000002"
  const pkgMath09Id = "abababab-0000-0000-0000-000000000003"
  const pkgMath08Id = "abababab-0000-0000-0000-000000000004"
  const pkgMathLit12Id = "abababab-0000-0000-0000-000000000005"
  const pkgPhys12Id = "abababab-0000-0000-0000-000000000006"
  const pkgLife12Id = "abababab-0000-0000-0000-000000000007"
  const pkgAcc12Id = "abababab-0000-0000-0000-000000000008"
  const pkgBus12Id = "abababab-0000-0000-0000-000000000009"
  const pkgEco12Id = "abababab-0000-0000-0000-00000000000a"
  const pkgEng12Id = "abababab-0000-0000-0000-00000000000b"
  const pkgMath11Id = "abababab-0000-0000-0000-00000000000c"

  await Promise.all([
    prisma.subjectPackage.upsert({
      where: { id: pkgMath12Id },
      update: {
        title: "Grade 12 Mathematics",
        subject: "Mathematics",
        grade: 12,
        term: 2,
        description: "ZIMSEC-aligned Grade 12 Maths support with live lessons, homework help, past papers, and revision resources.",
        price: 199,
        currency: "USD",
        isCapsAligned: true,
        includesLiveLessons: true,
        isExamPrep: true,
        isHolidayLearning: true,
        teacherId: instructor.id,
        categoryId: catMath.id,
      },
      create: {
        id: pkgMath12Id,
        title: "Grade 12 Mathematics",
        subject: "Mathematics",
        grade: 12,
        term: 2,
        description: "ZIMSEC-aligned Grade 12 Maths support with live lessons, homework help, past papers, and revision resources.",
        price: 199,
        currency: "USD",
        isCapsAligned: true,
        includesLiveLessons: true,
        isExamPrep: true,
        isHolidayLearning: true,
        teacherId: instructor.id,
        categoryId: catMath.id,
      },
    }),
    prisma.subjectPackage.upsert({
      where: { id: pkgMathLit12Id },
      update: {
        title: "Grade 12 Mathematical Literacy",
        subject: "Mathematical Literacy",
        grade: 12,
        term: 2,
        description: "Grade 12 Maths Lit support with practical examples, exam preparation, and revision notes.",
        price: 199,
        isCapsAligned: true,
        includesLiveLessons: true,
        isExamPrep: true,
        teacherId: instructor.id,
        categoryId: catMath.id,
      },
      create: {
        id: pkgMathLit12Id,
        title: "Grade 12 Mathematical Literacy",
        subject: "Mathematical Literacy",
        grade: 12,
        term: 2,
        description: "Grade 12 Maths Lit support with practical examples, exam preparation, and revision notes.",
        price: 199,
        isCapsAligned: true,
        includesLiveLessons: true,
        isExamPrep: true,
        teacherId: instructor.id,
        categoryId: catMath.id,
      },
    }),
    prisma.subjectPackage.upsert({
      where: { id: pkgPhys12Id },
      update: {
        title: "Grade 12 Physical Sciences",
        subject: "Physical Sciences",
        grade: 12,
        term: 2,
        description: "ZIMSEC-aligned Physics & Chemistry revision with homework support and ZIMSEC exam prep.",
        price: 199,
        currency: "USD",
        isCapsAligned: true,
        includesLiveLessons: true,
        isExamPrep: true,
        teacherId: instructor.id,
        categoryId: catExamPrep.id,
      },
      create: {
        id: pkgPhys12Id,
        title: "Grade 12 Physical Sciences",
        subject: "Physical Sciences",
        grade: 12,
        term: 2,
        description: "ZIMSEC-aligned Physics & Chemistry revision with homework support and ZIMSEC exam prep.",
        price: 199,
        currency: "USD",
        isCapsAligned: true,
        includesLiveLessons: true,
        isExamPrep: true,
        teacherId: instructor.id,
        categoryId: catExamPrep.id,
      },
    }),
    prisma.subjectPackage.upsert({
      where: { id: pkgLife12Id },
      update: {
        title: "Grade 12 Life Sciences",
        subject: "Life Sciences",
        grade: 12,
        term: 2,
        description: "Structured revision, diagrams, and exam preparation for Grade 12 Life Sciences.",
        price: 379,
        isCapsAligned: true,
        includesLiveLessons: true,
        isExamPrep: true,
        teacherId: instructor.id,
        categoryId: catExamPrep.id,
      },
      create: {
        id: pkgLife12Id,
        title: "Grade 12 Life Sciences",
        subject: "Life Sciences",
        grade: 12,
        term: 2,
        description: "Structured revision, diagrams, and exam preparation for Grade 12 Life Sciences.",
        price: 379,
        isCapsAligned: true,
        includesLiveLessons: true,
        isExamPrep: true,
        teacherId: instructor.id,
        categoryId: catExamPrep.id,
      },
    }),
    prisma.subjectPackage.upsert({
      where: { id: pkgAcc12Id },
      update: {
        title: "Grade 12 Accounting",
        subject: "Accounting",
        grade: 12,
        term: 2,
        description: "Master core Accounting topics with worked examples, homework support, and exam drills.",
        price: 379,
        isCapsAligned: true,
        includesLiveLessons: true,
        isExamPrep: true,
        teacherId: instructor.id,
        categoryId: catExamPrep.id,
      },
      create: {
        id: pkgAcc12Id,
        title: "Grade 12 Accounting",
        subject: "Accounting",
        grade: 12,
        term: 2,
        description: "Master core Accounting topics with worked examples, homework support, and exam drills.",
        price: 379,
        isCapsAligned: true,
        includesLiveLessons: true,
        isExamPrep: true,
        teacherId: instructor.id,
        categoryId: catExamPrep.id,
      },
    }),
    prisma.subjectPackage.upsert({
      where: { id: pkgBus12Id },
      update: {
        title: "Grade 12 Business Studies",
        subject: "Business Studies",
        grade: 12,
        term: 2,
        description: "Exam-focused revision notes and past paper practice for Business Studies.",
        price: 329,
        currency: "USD",
        isCapsAligned: true,
        includesLiveLessons: false,
        isExamPrep: true,
        teacherId: instructor.id,
        categoryId: catExamPrep.id,
      },
      create: {
        id: pkgBus12Id,
        title: "Grade 12 Business Studies",
        subject: "Business Studies",
        grade: 12,
        term: 2,
        description: "Exam-focused revision notes and past paper practice for Business Studies.",
        price: 329,
        currency: "USD",
        isCapsAligned: true,
        includesLiveLessons: false,
        isExamPrep: true,
        teacherId: instructor.id,
        categoryId: catExamPrep.id,
      },
    }),
    prisma.subjectPackage.upsert({
      where: { id: pkgEco12Id },
      update: {
        title: "Grade 12 Economics",
        subject: "Economics",
        grade: 12,
        term: 2,
        description: "ZIMSEC-aligned Economics revision with graphs, essay support, and exam preparation.",
        price: 329,
        currency: "USD",
        isCapsAligned: true,
        includesLiveLessons: false,
        isExamPrep: true,
        teacherId: instructor.id,
        categoryId: catExamPrep.id,
      },
      create: {
        id: pkgEco12Id,
        title: "Grade 12 Economics",
        subject: "Economics",
        grade: 12,
        term: 2,
        description: "ZIMSEC-aligned Economics revision with graphs, essay support, and exam preparation.",
        price: 329,
        currency: "USD",
        isCapsAligned: true,
        includesLiveLessons: false,
        isExamPrep: true,
        teacherId: instructor.id,
        categoryId: catExamPrep.id,
      },
    }),
    prisma.subjectPackage.upsert({
      where: { id: pkgEng12Id },
      update: {
        title: "Grade 12 English",
        subject: "English",
        grade: 12,
        term: 2,
        description: "Language, comprehension, and writing support with ZIMSEC-focused practice.",
        price: 199,
        currency: "USD",
        isCapsAligned: true,
        includesLiveLessons: true,
        isExamPrep: true,
        teacherId: instructor.id,
        categoryId: catExamPrep.id,
      },
      create: {
        id: pkgEng12Id,
        title: "Grade 12 English",
        subject: "English",
        grade: 12,
        term: 2,
        description: "Language, comprehension, and writing support with ZIMSEC-focused practice.",
        price: 199,
        currency: "USD",
        isCapsAligned: true,
        includesLiveLessons: true,
        isExamPrep: true,
        teacherId: instructor.id,
        categoryId: catExamPrep.id,
      },
    }),
    prisma.subjectPackage.upsert({
      where: { id: pkgMath11Id },
      update: {
        title: "Grade 11 Mathematics",
        subject: "Mathematics",
        grade: 11,
        term: 3,
        description: "Strengthen Grade 11 fundamentals and prepare for Grade 12 success.",
        price: 149,
        currency: "USD",
        isCapsAligned: true,
        includesLiveLessons: true,
        isExamPrep: false,
        teacherId: instructor.id,
        categoryId: catMath.id,
      },
      create: {
        id: pkgMath11Id,
        title: "Grade 11 Mathematics",
        subject: "Mathematics",
        grade: 11,
        term: 3,
        description: "Strengthen Grade 11 fundamentals and prepare for Grade 12 success.",
        price: 149,
        currency: "USD",
        isCapsAligned: true,
        includesLiveLessons: true,
        isExamPrep: false,
        teacherId: instructor.id,
        categoryId: catMath.id,
      },
    }),
    prisma.subjectPackage.upsert({
      where: { id: pkgMath10Id },
      update: {
        title: "Grade 10 Mathematics",
        subject: "Mathematics",
        grade: 10,
        term: 1,
        description: "Build confidence in algebra, functions, and geometry with structured support.",
        price: 129,
        currency: "USD",
        isCapsAligned: true,
        includesLiveLessons: true,
        teacherId: instructor.id,
        categoryId: catMath.id,
      },
      create: {
        id: pkgMath10Id,
        title: "Grade 10 Mathematics",
        subject: "Mathematics",
        grade: 10,
        term: 1,
        description: "Build confidence in algebra, functions, and geometry with structured support.",
        price: 129,
        currency: "USD",
        isCapsAligned: true,
        includesLiveLessons: true,
        teacherId: instructor.id,
        categoryId: catMath.id,
      },
    }),
    prisma.subjectPackage.upsert({
      where: { id: pkgMath09Id },
      update: {
        title: "Grade 9 Mathematics",
        subject: "Mathematics",
        grade: 9,
        term: 1,
        description: "ZIMSEC-aligned maths catch-up with worked examples and practice.",
        price: 99,
        currency: "USD",
        isCapsAligned: true,
        includesLiveLessons: true,
        isHolidayLearning: true,
        teacherId: instructor.id,
        categoryId: catHoliday.id,
      },
      create: {
        id: pkgMath09Id,
        title: "Grade 9 Mathematics",
        subject: "Mathematics",
        grade: 9,
        term: 1,
        description: "ZIMSEC-aligned maths catch-up with worked examples and practice.",
        price: 99,
        currency: "USD",
        isCapsAligned: true,
        includesLiveLessons: true,
        isHolidayLearning: true,
        teacherId: instructor.id,
        categoryId: catHoliday.id,
      },
    }),
    prisma.subjectPackage.upsert({
      where: { id: pkgMath08Id },
      update: {
        title: "Grade 8 Mathematics",
        subject: "Mathematics",
        grade: 8,
        term: 1,
        description: "Get ahead with key Grade 8 maths concepts and practice.",
        price: 99,
        currency: "USD",
        isCapsAligned: true,
        includesLiveLessons: true,
        isHolidayLearning: true,
        teacherId: instructor.id,
        categoryId: catHoliday.id,
      },
      create: {
        id: pkgMath08Id,
        title: "Grade 8 Mathematics",
        subject: "Mathematics",
        grade: 8,
        term: 1,
        description: "Get ahead with key Grade 8 maths concepts and practice.",
        price: 99,
        currency: "USD",
        isCapsAligned: true,
        includesLiveLessons: true,
        isHolidayLearning: true,
        teacherId: instructor.id,
        categoryId: catHoliday.id,
      },
    }),
  ])

  const math12Start = new Date()
  const math12End = new Date(math12Start)
  math12End.setMonth(math12End.getMonth() + 1)

  await prisma.subjectEnrollment.upsert({
    where: { userId_subjectPackageId: { userId: student.id, subjectPackageId: pkgMath12Id } },
    update: {
      status: "active",
      grade: 12,
      price: 199,
      currency: "USD",
      billingPeriod: "monthly",
      startDate: math12Start,
      endDate: math12End,
    },
    create: {
      userId: student.id,
      subjectPackageId: pkgMath12Id,
      status: "active",
      grade: 12,
      price: 199,
      currency: "USD",
      billingPeriod: "monthly",
      startDate: math12Start,
      endDate: math12End,
    },
  })

  await prisma.subjectEnrollment.upsert({
    where: { userId_subjectPackageId: { userId: student.id, subjectPackageId: pkgPhys12Id } },
    update: { status: "pending" },
    create: {
      userId: student.id,
      subjectPackageId: pkgPhys12Id,
      status: "pending",
      grade: 12,
      price: 199,
      currency: "USD",
      billingPeriod: "monthly",
    },
  })

  await prisma.liveLesson.createMany({
    data: [
      {
        id: "dddddddd-0000-0000-0000-000000000001",
        title: "Grade 12 Mathematics: Calculus Crash Session",
        subject: "Mathematics",
        grade: 12,
        status: "upcoming",
        startsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
        durationMinutes: 75,
        meetingLink: null,
        recordingUrl: null,
        teacherId: instructor.id,
        categoryId: catMath.id,
        subjectPackageId: pkgMath12Id,
      },
      {
        id: "dddddddd-0000-0000-0000-000000000002",
        title: "Grade 10 Maths: Algebra Foundations",
        subject: "Mathematics",
        grade: 10,
        status: "completed",
        startsAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
        durationMinutes: 60,
        meetingLink: null,
        recordingUrl: null,
        teacherId: instructor.id,
        categoryId: catMath.id,
        subjectPackageId: pkgMath10Id,
      },
    ],
    skipDuplicates: true,
  })

  await prisma.homeworkAssignment.createMany({
    data: [
      {
        id: "eeeeeeee-0000-0000-0000-000000000001",
        title: "Grade 12 Maths: Differentiation practice",
        description: "Complete questions 1–10 and show all working.",
        subject: "Mathematics",
        grade: 12,
        dueAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
        teacherId: instructor.id,
        subjectPackageId: pkgMath12Id,
      },
    ],
    skipDuplicates: true,
  })

  await prisma.homeworkSubmission.createMany({
    data: [
      {
        id: "eeeeeeee-0000-0000-0000-000000000101",
        assignmentId: "eeeeeeee-0000-0000-0000-000000000001",
        studentId: student.id,
        status: "submitted",
        answerText: "Answers submitted (placeholder).",
        submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
      },
    ],
    skipDuplicates: true,
  })

  await prisma.examResource.createMany({
    data: [
      {
        id: "ffffffff-0000-0000-0000-000000000001",
        title: "Mathematics Paper 1 (ZIMSEC) 2023",
        kind: "paper",
        subject: "Mathematics",
        grade: 12,
        year: 2023,
        term: 4,
        examType: "ZIMSEC",
        fileUrl: null,
        subjectPackageId: pkgMath12Id,
      },
      {
        id: "ffffffff-0000-0000-0000-000000000002",
        title: "Mathematics Paper 1 Memo (ZIMSEC) 2023",
        kind: "memo",
        subject: "Mathematics",
        grade: 12,
        year: 2023,
        term: 4,
        examType: "ZIMSEC",
        fileUrl: null,
        subjectPackageId: pkgMath12Id,
      },
    ],
    skipDuplicates: true,
  })

  await prisma.learningResource.createMany({
    data: [
      {
        id: "99999999-0000-0000-0000-000000000001",
        title: "Grade 12 Maths: Functions summary notes",
        kind: "notes",
        subject: "Mathematics",
        grade: 12,
        fileUrl: null,
        subjectPackageId: pkgMath12Id,
      },
      {
        id: "99999999-0000-0000-0000-000000000002",
        title: "Grade 12 Maths: Term 2 revision worksheet",
        kind: "worksheet",
        subject: "Mathematics",
        grade: 12,
        fileUrl: null,
        subjectPackageId: pkgMath12Id,
      },
    ],
    skipDuplicates: true,
  })

  await prisma.announcement.createMany({
    data: [
      {
        id: "12121212-0000-0000-0000-000000000001",
        title: "Holiday bootcamp schedule",
        body: "Holiday sessions will be posted in the Zimbabwe Learning Hub. Keep an eye on Live Lessons for upcoming dates.",
        grade: 12,
        subject: "Mathematics",
        authorId: instructor.id,
        subjectPackageId: pkgMath12Id,
      },
    ],
    skipDuplicates: true,
  })

  const [c1s1, c1s2] = await Promise.all([
    prisma.section.upsert({
      where: { id: "11111111-1111-1111-1111-111111111112" },
      update: { title: "Introduction", courseId: course1.id },
      create: { id: "11111111-1111-1111-1111-111111111112", title: "Introduction", courseId: course1.id },
    }),
    prisma.section.upsert({
      where: { id: "11111111-1111-1111-1111-111111111113" },
      update: { title: "Core Concepts", courseId: course1.id },
      create: { id: "11111111-1111-1111-1111-111111111113", title: "Core Concepts", courseId: course1.id },
    }),
  ])

  const [c2s1, c2s2] = await Promise.all([
    prisma.section.upsert({
      where: { id: "22222222-2222-2222-2222-222222222223" },
      update: { title: "Getting Started", courseId: course2.id },
      create: { id: "22222222-2222-2222-2222-222222222223", title: "Getting Started", courseId: course2.id },
    }),
    prisma.section.upsert({
      where: { id: "22222222-2222-2222-2222-222222222224" },
      update: { title: "Working with Data", courseId: course2.id },
      create: { id: "22222222-2222-2222-2222-222222222224", title: "Working with Data", courseId: course2.id },
    }),
  ])

  const [c3s1, c3s2] = await Promise.all([
    prisma.section.upsert({
      where: { id: "33333333-3333-3333-3333-333333333334" },
      update: { title: "Foundations", courseId: course3.id },
      create: { id: "33333333-3333-3333-3333-333333333334", title: "Foundations", courseId: course3.id },
    }),
    prisma.section.upsert({
      where: { id: "33333333-3333-3333-3333-333333333335" },
      update: { title: "Design Systems", courseId: course3.id },
      create: { id: "33333333-3333-3333-3333-333333333335", title: "Design Systems", courseId: course3.id },
    }),
  ])

  await prisma.lesson.createMany({
    data: [
      { id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1", sectionId: c1s1.id, title: "Welcome", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
      { id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2", sectionId: c1s1.id, title: "Setup", videoUrl: "https://www.w3schools.com/html/movie.mp4" },
      { id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3", sectionId: c1s2.id, title: "HTML & CSS Essentials", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
      { id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4", sectionId: c1s2.id, title: "JavaScript Basics", videoUrl: "https://www.w3schools.com/html/movie.mp4" },

      { id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1", sectionId: c2s1.id, title: "Course Overview", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
      { id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2", sectionId: c2s1.id, title: "Python Setup", videoUrl: "https://www.w3schools.com/html/movie.mp4" },
      { id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3", sectionId: c2s2.id, title: "Pandas Basics", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
      { id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb4", sectionId: c2s2.id, title: "Data Visualization", videoUrl: "https://www.w3schools.com/html/movie.mp4" },

      { id: "cccccccc-cccc-cccc-cccc-ccccccccccc1", sectionId: c3s1.id, title: "What is UX?", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
      { id: "cccccccc-cccc-cccc-cccc-ccccccccccc2", sectionId: c3s1.id, title: "UI Basics", videoUrl: "https://www.w3schools.com/html/movie.mp4" },
      { id: "cccccccc-cccc-cccc-cccc-ccccccccccc3", sectionId: c3s2.id, title: "Typography & Color", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
      { id: "cccccccc-cccc-cccc-cccc-ccccccccccc4", sectionId: c3s2.id, title: "Components & Tokens", videoUrl: "https://www.w3schools.com/html/movie.mp4" },
    ],
    skipDuplicates: true,
  })

  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: student.id, courseId: course1.id } },
    update: {},
    create: { userId: student.id, courseId: course1.id },
  })

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: student.id, courseId: course1.id } },
    select: { id: true },
  })

  if (enrollment) {
    const existingTx = await prisma.transaction.findFirst({
      where: { enrollmentId: enrollment.id, type: "enrollment" },
      select: { id: true },
    })
    if (!existingTx) {
      const commissionRateBps = 1500
      const commission = Math.round((course1.price * commissionRateBps) / 10_000)
      const payout = Math.max(0, course1.price - commission)
      const refBase = enrollment.id.replace(/-/g, "").slice(0, 12).toUpperCase()

      await prisma.transaction.create({
        data: {
          type: "enrollment",
          status: "succeeded",
          currency: "USD",
          amount: course1.price,
          userId: student.id,
          courseId: course1.id,
          enrollmentId: enrollment.id,
          reference: `ENR-${refBase}`,
          description: `Enrollment payment for ${course1.title}`,
        },
      })

      await prisma.transaction.create({
        data: {
          type: "commission",
          status: "succeeded",
          currency: "USD",
          amount: commission,
          courseId: course1.id,
          enrollmentId: enrollment.id,
          reference: `COM-${refBase}`,
          description: `Platform commission (${commissionRateBps / 100}%) for ${course1.title}`,
        },
      })

      await prisma.transaction.create({
        data: {
          type: "payout",
          status: "pending",
          currency: "USD",
          amount: payout,
          userId: instructor.id,
          courseId: course1.id,
          enrollmentId: enrollment.id,
          reference: `PAY-${refBase}`,
          description: `Payout due to instructor for ${course1.title}`,
        },
      })
    }
  }

  await prisma.subscription.upsert({
    where: { userId: student.id },
    update: { planName: "Free", status: "active" },
    create: { userId: student.id, planName: "Free", status: "active" },
  })

  await prisma.invoice.createMany({
    data: [
      {
        id: "bbbbbbbb-0000-0000-0000-000000000001",
        userId: student.id,
        currency: "USD",
        amount: 0,
        status: "paid",
        reference: "FREE-PLAN",
      },
    ],
    skipDuplicates: true,
  })

  await prisma.notification.createMany({
    data: [
      {
        id: "cccccccc-0000-0000-0000-000000000001",
        userId: student.id,
        title: "Welcome to Learnify",
        body: "Start a course, track your progress, and earn certificates as you learn.",
        href: "/dashboard",
      },
      {
        id: "cccccccc-0000-0000-0000-000000000002",
        userId: student.id,
        title: "Tip: Save courses to your wishlist",
        body: "Use the heart button on a course page to save it for later.",
        href: "/dashboard/wishlist",
      },
    ],
    skipDuplicates: true,
  })

  await prisma.report.createMany({
    data: [
      {
        id: "aaaaaaaa-0000-0000-0000-000000000001",
        type: "course_complaint",
        status: "open",
        reporterId: student.id,
        courseId: course1.id,
        message: "The audio quality is inconsistent in a few lessons. Please review and update the recordings.",
      },
      {
        id: "aaaaaaaa-0000-0000-0000-000000000002",
        type: "user_report",
        status: "open",
        reporterId: student.id,
        accusedUserId: instructor.id,
        message: "Instructor sent promotional messages outside the course platform. Please investigate.",
      },
    ],
    skipDuplicates: true,
  })
}

main()
  .finally(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    await prisma.$disconnect()
    throw e
  })
