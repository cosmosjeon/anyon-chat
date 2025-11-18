const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:54369';
const THREAD_ID = 'e98cf62f-90cb-4fb8-b276-4bdedd592d91';

// Predefined answers (using option 1 for choices)
const answers = [
  "학생들이 학습 스타일과 속도를 파악하기 어려워 비효율적인 학습을 하는 문제", // Q2
  "1", // Q3
  "개인화된 AI 학습 경로 추천", // Q4
  "1", // Q5
  "학생들의 학습 성과 30% 향상", // Q6
  "1", // Q7
  "AI 기반 학습 분석 시스템", // Q8
  "1", // Q9
  "6개월", // Q10
  "1", // Q11
  "구독 기반 모델", // Q12
  "1", // Q13
  "학생 및 학부모", // Q14
  "1", // Q15
];

async function sendMessage(message, questionNum) {
  console.log(`\n=== Question ${questionNum} ===`);
  console.log(`Sending: ${message}`);

  try {
    const response = await fetch(`${BASE_URL}/threads/${THREAD_ID}/runs/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        assistant_id: 'planning',
        input: {
          messages: [{
            role: 'human',
            content: message
          }]
        }
      })
    });

    const text = await response.text();

    // Parse streaming response
    const lines = text.split('\n');
    let latestMessage = null;
    let prdContent = null;
    let completenessScore = 0;
    let isComplete = false;

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.substring(6));
          if (data.messages && data.messages.length > 0) {
            latestMessage = data.messages[data.messages.length - 1];
          }
          if (data.prdContent) {
            prdContent = data.prdContent;
          }
          if (data.completenessScore !== undefined) {
            completenessScore = data.completenessScore;
          }
          if (data.isComplete !== undefined) {
            isComplete = data.isComplete;
          }
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }

    if (latestMessage && latestMessage.type === 'ai') {
      console.log(`\nAI Response:`);
      console.log(latestMessage.content.substring(0, 200) + '...');
    }

    console.log(`\nProgress: ${completenessScore}%`);
    console.log(`Complete: ${isComplete}`);

    if (isComplete) {
      console.log(`\n=== FINAL PRD ===`);
      console.log(prdContent);
      return true;
    }

    return false;

  } catch (error) {
    console.error(`Error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('Starting Planning Flow Test...');
  console.log(`Thread ID: ${THREAD_ID}`);

  for (let i = 0; i < answers.length; i++) {
    const isComplete = await sendMessage(answers[i], i + 2);

    if (isComplete) {
      console.log('\n=== Planning Flow Complete! ===');
      break;
    }

    // Wait a bit between questions
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

main();
