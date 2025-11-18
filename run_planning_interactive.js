#!/usr/bin/env node

/**
 * Interactive Planning Agent Test
 * 터미널에서 직접 Planning Agent와 대화하며 PRD를 생성합니다.
 */

const readline = require('readline');
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:54369';
let threadId = null;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function createThread() {
  const response = await fetch(`${BASE_URL}/threads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assistant_id: 'planning' })
  });
  const data = await response.json();
  return data.thread_id;
}

async function sendMessage(message) {
  const response = await fetch(`${BASE_URL}/threads/${threadId}/runs/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      assistant_id: 'planning',
      input: {
        messages: message ? [{ role: 'human', content: message }] : []
      }
    })
  });

  const text = await response.text();
  const lines = text.split('\n');

  // Debug: show raw response
  console.log('\n[DEBUG] Raw response lines:', lines.length);
  console.log('[DEBUG] First 5 lines:', lines.slice(0, 5));
  console.log('[DEBUG] Last 5 lines:', lines.slice(-5));

  let latestAiMessage = null;
  let isComplete = false;
  let completenessScore = 0;
  let prdContent = null;
  let awaitingAnswer = true;
  let lastEventData = null;

  // Parse SSE format: combine multi-line data fields
  let currentEventData = '';
  let currentEvent = '';

  for (const line of lines) {
    if (line.startsWith('event: ')) {
      currentEvent = line.substring(7).trim();
      currentEventData = '';
    } else if (line.startsWith('data: ')) {
      currentEventData += line.substring(6);
    } else if (line === '' && currentEventData) {
      // End of event, try to parse accumulated data
      try {
        const data = JSON.parse(currentEventData);
        lastEventData = data;

        // LangGraph streaming can have data in different formats
        // Try: data.values.messages, data.updates.messages, or data.messages
        const stateMessages = data.values?.messages || data.updates?.messages || data.messages;

        if (stateMessages && stateMessages.length > 0) {
          const lastMessage = stateMessages[stateMessages.length - 1];
          if (lastMessage.type === 'ai' || lastMessage._getType?.() === 'ai') {
            latestAiMessage = lastMessage.content;
          }
        }

        // Also check nested values
        const stateValues = data.values || data.updates || data;

        if (stateValues.isComplete !== undefined) {
          isComplete = stateValues.isComplete;
        }

        if (stateValues.completenessScore !== undefined) {
          completenessScore = stateValues.completenessScore;
        }

        if (stateValues.prdContent) {
          prdContent = stateValues.prdContent;
        }

        if (stateValues.awaitingAnswer !== undefined) {
          awaitingAnswer = stateValues.awaitingAnswer;
        }
      } catch (e) {
        // Skip invalid JSON
        console.log('[DEBUG] Failed to parse event data:', e.message);
      }
      currentEventData = '';
    }
  }

  // Debug: show last event data if no message found
  if (!latestAiMessage && lastEventData) {
    console.log('\n[DEBUG] Last event data:', JSON.stringify(lastEventData, null, 2).substring(0, 500));
  }

  return {
    message: latestAiMessage,
    isComplete,
    completenessScore,
    prdContent,
    awaitingAnswer
  };
}

async function main() {
  console.log('\n=== Planning Agent Interactive Test ===\n');
  console.log('LangGraph Planning Agent를 시작합니다...\n');

  try {
    // Create thread
    console.log('Thread 생성 중...');
    threadId = await createThread();
    console.log(`✓ Thread 생성 완료: ${threadId}\n`);

    // Start conversation
    console.log('첫 메시지를 불러오는 중...\n');
    let result = await sendMessage(null);

    if (!result.message) {
      console.log('⚠️  AI 응답을 받지 못했습니다. 빈 메시지로 다시 시도...\n');
      result = await sendMessage('');
    }

    let iterationCount = 0;
    const maxIterations = 50; // Prevent infinite loop

    while (!result.isComplete && iterationCount < maxIterations) {
      iterationCount++;

      // Show AI message
      if (result.message) {
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📋 AI:');
        console.log(result.message);
        console.log(`\n📊 진행률: ${result.completenessScore}%`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      } else {
        console.log('\n⚠️  AI 응답이 없습니다. 계속 진행합니다...\n');
      }

      // If not waiting for answer, automatically continue
      if (!result.awaitingAnswer) {
        console.log('⏩ 자동으로 다음 단계를 진행합니다...\n');
        result = await sendMessage('');
        continue;
      }

      // Get user input
      const userInput = await question('💬 You: ');

      if (userInput.toLowerCase() === 'quit' || userInput.toLowerCase() === 'exit') {
        console.log('\n👋 종료합니다.');
        break;
      }

      if (!userInput.trim()) {
        console.log('⚠️  빈 입력입니다. 다시 입력해주세요.');
        continue;
      }

      // Send user message
      console.log('\n전송 중...');
      result = await sendMessage(userInput);
    }

    if (iterationCount >= maxIterations) {
      console.log('\n⚠️  최대 반복 횟수에 도달했습니다.');
    }

    // Show final PRD
    if (result.isComplete && result.prdContent) {
      console.log('\n\n╔═══════════════════════════════════════╗');
      console.log('║   🎉 PRD 생성 완료!                  ║');
      console.log('╚═══════════════════════════════════════╝\n');
      console.log(`최종 완성도: ${result.completenessScore}%\n`);
      console.log('━━━━━━━━━━ FINAL PRD ━━━━━━━━━━\n');
      console.log(result.prdContent);
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    } else if (result.isComplete) {
      console.log('\n✓ 완료되었지만 PRD 내용이 없습니다.');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    rl.close();
  }
}

// Check if LangGraph server is running
console.log('LangGraph 서버 연결 확인 중...');
fetch(`${BASE_URL}/threads`)
  .then(() => {
    console.log('✓ 서버 연결 성공\n');
    main();
  })
  .catch((error) => {
    console.error('❌ LangGraph 서버가 실행 중이지 않습니다.');
    console.error(`Error: ${error.message}`);
    console.error('\n다음 명령어로 서버를 먼저 시작하세요:');
    console.error('  yarn langgraphjs dev --port 54369 --no-browser');
    process.exit(1);
  });
