const Answer = require("../models/Answer");

exports.getStudentAnalytics = async (studentId) => {

  const answers = await Answer.find({ studentId });

  if (answers.length === 0)
    return {
      totalAttempts: 0,
      averageScore: 0,
      conceptMastery: {},
      weakConcepts: []
    };

  let totalScore = 0;
  let conceptStats = {};

  answers.forEach(a => {

    const finalScore = a.isOverridden
      ? a.teacherFinalScore
      : a.aiFinalScore;

    totalScore += finalScore;

   
    a.coveredConcepts.forEach(concept => {
      conceptStats[concept] = (conceptStats[concept] || 0) + 1;
    });
  });

  const averageScore =
    Math.round(totalScore / answers.length);


  const weakConcepts = Object.entries(conceptStats)
    .filter(([_, count]) => count < 2)
    .map(([concept]) => concept);

  return {
    totalAttempts: answers.length,
    averageScore,
    conceptMastery: conceptStats,
    weakConcepts
  };
};


exports.getTeacherAnalytics = async (examId) => {

  const answers = await Answer.find({ examId });

  if (answers.length === 0)
    return {
      totalStudents: 0,
      classAverage: 0,
      difficultyIndex: {},
      mostMissedConcepts: []
    };

  let totalScore = 0;
  let questionStats = {};
  let conceptMissStats = {};

  answers.forEach(a => {

    const finalScore = a.isOverridden
      ? a.teacherFinalScore
      : a.aiFinalScore;

    totalScore += finalScore;

   
    questionStats[a.questionId] =
      questionStats[a.questionId] || {
        totalScore: 0,
        count: 0
      };

    questionStats[a.questionId].totalScore += finalScore;
    questionStats[a.questionId].count += 1;

    
    a.missingConcepts.forEach(concept => {
      conceptMissStats[concept] =
        (conceptMissStats[concept] || 0) + 1;
    });
  });

  const classAverage =
    Math.round(totalScore / answers.length);

  
  const difficultyIndex = {};

  Object.keys(questionStats).forEach(qId => {
    const data = questionStats[qId];
    const avg = data.totalScore / data.count;

    difficultyIndex[qId] =
      avg < 40 ? "Hard"
      : avg < 70 ? "Medium"
      : "Easy";
  });

 
  const mostMissedConcepts =
    Object.entries(conceptMissStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(entry => entry[0]);

  return {
    totalStudents: answers.length,
    classAverage,
    difficultyIndex,
    mostMissedConcepts
  };
};
