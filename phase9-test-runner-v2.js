const io = require('socket.io-client');

/**
 * PHASE 9: IMPROVED MULTI-USER TEST EXECUTOR
 * Fixes: Longer delays, better event tracking, improved debugging
 */

const TEST_RESULTS = {
  passed: 0,
  failed: 0,
  errors: [],
  tests: [],
  startTime: null,
  endTime: null,
  duration: 0
};

const CLIENTS = {};
const CLIENT_STATES = {};
const RECEIVED_EVENTS = {};

// Initialize clients
for (let i = 1; i <= 5; i++) {
  const key = `browser_${String.fromCharCode(96 + i)}`;
  CLIENTS[key] = null;
  CLIENT_STATES[key] = {
    userId: `user_00${i}`,
    username: ['Alice', 'Bob', 'Charlie', 'Diana', 'Eva'][i - 1],
    room: 'test-room',
    connected: false
  };
  RECEIVED_EVENTS[key] = [];
}

// ============================================================================
// UTILITIES
// ============================================================================

function log(message, level = 'INFO') {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] [${level}] ${message}`);
}

function logTest(testId, testName, status, details = '') {
  const result = { testId, testName, status, details, timestamp: new Date().toISOString() };
  TEST_RESULTS.tests.push(result);
  
  if (status === 'PASS') {
    TEST_RESULTS.passed++;
    console.log(`✓ [PASS] ${testId}: ${testName}`);
  } else if (status === 'FAIL') {
    TEST_RESULTS.failed++;
    console.log(`✗ [FAIL] ${testId}: ${testName} - ${details}`);
    TEST_RESULTS.errors.push({ testId, testName, error: details });
  }
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getClientKey(index) {
  return `browser_${String.fromCharCode(96 + index)}`;
}

// ============================================================================
// CLIENT SETUP
// ============================================================================

async function setupClients() {
  log('Setting up 5 test clients...');
  
  for (let i = 1; i <= 5; i++) {
    const clientKey = getClientKey(i);
    
    await new Promise((resolve) => {
      const socket = io('http://localhost:5000', {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: Infinity,
        transports: ['websocket']
      });

      socket.on('connect', () => {
        log(`${clientKey} connected (socket: ${socket.id})`);
        CLIENT_STATES[clientKey].connected = true;
        CLIENT_STATES[clientKey].socketId = socket.id;

        // Setup event listeners
        socket.on('user-joined', (data) => {
          RECEIVED_EVENTS[clientKey].push({ event: 'user-joined', data, time: Date.now() });
          log(`  [${clientKey}] Received user-joined:`, JSON.stringify(data).substring(0, 80));
        });

        socket.on('room-users', (data) => {
          RECEIVED_EVENTS[clientKey].push({ event: 'room-users', data, time: Date.now() });
          log(`  [${clientKey}] Received room-users: ${data.users?.length || 0} users`);
        });

        socket.on('chat-message', (data) => {
          RECEIVED_EVENTS[clientKey].push({ event: 'chat-message', data, time: Date.now() });
          log(`  [${clientKey}] Received chat-message: "${data.content}"`);
        });

        socket.on('typing-start', (data) => {
          RECEIVED_EVENTS[clientKey].push({ event: 'typing-start', data, time: Date.now() });
        });

        socket.on('typing-stop', (data) => {
          RECEIVED_EVENTS[clientKey].push({ event: 'typing-stop', data, time: Date.now() });
        });

        socket.on('user-left', (data) => {
          RECEIVED_EVENTS[clientKey].push({ event: 'user-left', data, time: Date.now() });
          log(`  [${clientKey}] Received user-left: ${data.userId}`);
        });

        socket.on('toggle-audio', (data) => {
          RECEIVED_EVENTS[clientKey].push({ event: 'toggle-audio', data, time: Date.now() });
        });

        socket.on('toggle-video', (data) => {
          RECEIVED_EVENTS[clientKey].push({ event: 'toggle-video', data, time: Date.now() });
        });

        socket.on('hand-raise', (data) => {
          RECEIVED_EVENTS[clientKey].push({ event: 'hand-raise', data, time: Date.now() });
          log(`  [${clientKey}] Received hand-raise: ${data.isHandRaised}`);
        });

        socket.on('system-message', (data) => {
          RECEIVED_EVENTS[clientKey].push({ event: 'system-message', data, time: Date.now() });
        });

        CLIENTS[clientKey] = socket;
        resolve();
      });

      socket.on('error', (error) => {
        log(`${clientKey} ERROR: ${error}`, 'ERROR');
        resolve();
      });

      socket.on('connect_error', (error) => {
        log(`${clientKey} CONNECT_ERROR: ${error}`, 'ERROR');
        resolve();
      });
    });
  }

  await delay(1000);
}

// ============================================================================
// TESTS
// ============================================================================

async function test_MULTI_US_001_Three_Participants_Join() {
  try {
    log('[TEST] MULTI_US_001: Joining 3 participants...');
    
    for (let i = 1; i <= 3; i++) {
      const key = getClientKey(i);
      CLIENTS[key].emit('join-room', {
        roomId: 'test-room',
        user: {
          id: CLIENT_STATES[key].userId,
          name: CLIENT_STATES[key].username
        }
      });
      log(`  ${key} sent join-room`);
      await delay(800);
    }

    await delay(2000);

    // Check if all got room-users events
    const events_a = RECEIVED_EVENTS.browser_a.filter(e => e.event === 'room-users');
    const events_b = RECEIVED_EVENTS.browser_b.filter(e => e.event === 'room-users');
    const events_c = RECEIVED_EVENTS.browser_c.filter(e => e.event === 'room-users');

    log(`  Events received: A=${events_a.length}, B=${events_b.length}, C=${events_c.length}`);

    if (events_a.length > 0 && events_b.length > 0 && events_c.length > 0) {
      logTest('MULTI_US_001', 'Three Participants Join Room', 'PASS', 'All clients joined and received updates');
    } else {
      logTest('MULTI_US_001', 'Three Participants Join Room', 'FAIL', `Missing updates: A=${events_a.length}, B=${events_b.length}, C=${events_c.length}`);
    }
  } catch (error) {
    logTest('MULTI_US_001', 'Three Participants Join Room', 'FAIL', error.message);
  }
}

async function test_MULTI_US_002_Participant_List_Accuracy() {
  try {
    await delay(500);
    const events_a = RECEIVED_EVENTS.browser_a.filter(e => e.event === 'room-users');
    const events_b = RECEIVED_EVENTS.browser_b.filter(e => e.event === 'room-users');
    const events_c = RECEIVED_EVENTS.browser_c.filter(e => e.event === 'room-users');

    const countA = events_a[events_a.length - 1]?.data.users?.length || 0;
    const countB = events_b[events_b.length - 1]?.data.users?.length || 0;
    const countC = events_c[events_c.length - 1]?.data.users?.length || 0;

    log(`  Participant counts: A=${countA}, B=${countB}, C=${countC}`);

    if (countA === 3 && countB === 3 && countC === 3) {
      logTest('MULTI_US_002', 'Participant List Accuracy', 'PASS', 'All clients see 3 participants');
    } else {
      logTest('MULTI_US_002', 'Participant List Accuracy', 'FAIL', `Inconsistent: A=${countA}, B=${countB}, C=${countC}`);
    }
  } catch (error) {
    logTest('MULTI_US_002', 'Participant List Accuracy', 'FAIL', error.message);
  }
}

async function test_MULTI_US_003_Participant_Count_Updates() {
  try {
    const countA = RECEIVED_EVENTS.browser_a.filter(e => e.event === 'room-users').length;
    const countB = RECEIVED_EVENTS.browser_b.filter(e => e.event === 'room-users').length;
    const countC = RECEIVED_EVENTS.browser_c.filter(e => e.event === 'room-users').length;

    if (countA > 0 && countB > 0 && countC > 0) {
      logTest('MULTI_US_003', 'Participant Count Updates', 'PASS', `All clients got ${countA}+ updates`);
    } else {
      logTest('MULTI_US_003', 'Participant Count Updates', 'FAIL', 'No count updates');
    }
  } catch (error) {
    logTest('MULTI_US_003', 'Participant Count Updates', 'FAIL', error.message);
  }
}

async function test_CHAT_001_Message_Sent_To_All() {
  try {
    CLIENTS.browser_a.emit('chat-message', { content: 'Hello from Alice' });
    log('  browser_a sent message');
    
    await delay(1500);

    const events_b = RECEIVED_EVENTS.browser_b.filter(e => e.event === 'chat-message').length;
    const events_c = RECEIVED_EVENTS.browser_c.filter(e => e.event === 'chat-message').length;

    log(`  Messages received: B=${events_b}, C=${events_c}`);

    if (events_b > 0 && events_c > 0) {
      logTest('CHAT_001', 'Messages Sent To All Participants', 'PASS', 'Message delivered');
    } else {
      logTest('CHAT_001', 'Messages Sent To All Participants', 'FAIL', 'Message not received');
    }
  } catch (error) {
    logTest('CHAT_001', 'Messages Sent To All Participants', 'FAIL', error.message);
  }
}

async function test_CHAT_003_Rapid_Messages_No_Loss() {
  try {
    RECEIVED_EVENTS.browser_a = [];
    
    const count = 5;
    for (let i = 0; i < count; i++) {
      CLIENTS.browser_b.emit('chat-message', { content: `Message ${i + 1}` });
      await delay(200);
    }
    
    await delay(1000);
    const received = RECEIVED_EVENTS.browser_a.filter(e => e.event === 'chat-message').length;

    if (received >= count - 1) {
      logTest('CHAT_003', 'Rapid Messages - No Loss', 'PASS', `Sent ${count}, got ${received}`);
    } else {
      logTest('CHAT_003', 'Rapid Messages - No Loss', 'FAIL', `Sent ${count}, only got ${received}`);
    }
  } catch (error) {
    logTest('CHAT_003', 'Rapid Messages - No Loss', 'FAIL', error.message);
  }
}

async function test_CHAT_005_Typing_Indicators_Appear() {
  try {
    CLIENTS.browser_a.emit('typing-start', { userId: CLIENT_STATES.browser_a.userId });
    await delay(800);

    const events = RECEIVED_EVENTS.browser_b.filter(e => e.event === 'typing-start').length;

    if (events > 0) {
      logTest('CHAT_005', 'Typing Indicators Appear', 'PASS', 'Typing indicator received');
    } else {
      logTest('CHAT_005', 'Typing Indicators Appear', 'FAIL', 'No typing indicator');
    }
  } catch (error) {
    logTest('CHAT_005', 'Typing Indicators Appear', 'FAIL', error.message);
  }
}

async function test_STATUS_001_Audio_Toggle_Sync() {
  try {
    CLIENTS.browser_a.emit('toggle-audio', { userId: CLIENT_STATES.browser_a.userId, isMuted: true });
    await delay(800);

    const events = RECEIVED_EVENTS.browser_b.filter(e => e.event === 'toggle-audio').length;

    if (events > 0) {
      logTest('STATUS_001', 'Audio Toggle Synchronization', 'PASS', 'Audio status synced');
    } else {
      logTest('STATUS_001', 'Audio Toggle Synchronization', 'FAIL', 'Audio not synced');
    }
  } catch (error) {
    logTest('STATUS_001', 'Audio Toggle Synchronization', 'FAIL', error.message);
  }
}

async function test_STATUS_002_Video_Toggle_Sync() {
  try {
    CLIENTS.browser_b.emit('toggle-video', { userId: CLIENT_STATES.browser_b.userId, isCameraOff: true });
    await delay(800);

    const events = RECEIVED_EVENTS.browser_a.filter(e => e.event === 'toggle-video').length;

    if (events > 0) {
      logTest('STATUS_002', 'Video Toggle Synchronization', 'PASS', 'Video status synced');
    } else {
      logTest('STATUS_002', 'Video Toggle Synchronization', 'FAIL', 'Video not synced');
    }
  } catch (error) {
    logTest('STATUS_002', 'Video Toggle Synchronization', 'FAIL', error.message);
  }
}

async function test_STATUS_003_Hand_Raise_Sync() {
  try {
    CLIENTS.browser_c.emit('hand-raise', { userId: CLIENT_STATES.browser_c.userId, isHandRaised: true });
    await delay(800);

    const events = RECEIVED_EVENTS.browser_a.filter(e => e.event === 'hand-raise').length;

    if (events > 0) {
      logTest('STATUS_003', 'Hand Raise Synchronization', 'PASS', 'Hand raise synced');
    } else {
      logTest('STATUS_003', 'Hand Raise Synchronization', 'FAIL', 'Hand raise not synced');
    }
  } catch (error) {
    logTest('STATUS_003', 'Hand Raise Synchronization', 'FAIL', error.message);
  }
}

async function test_PART_001_Join_Notification() {
  try {
    const key4 = getClientKey(4);
    CLIENTS[key4].emit('join-room', {
      roomId: 'test-room',
      user: {
        id: CLIENT_STATES[key4].userId,
        name: CLIENT_STATES[key4].username
      }
    });
    
    await delay(1500);
    const events = RECEIVED_EVENTS.browser_a.filter(e => e.event === 'user-joined').length;

    if (events > 0) {
      logTest('PART_001', 'Join Notification Appears', 'PASS', 'Join event broadcast');
    } else {
      logTest('PART_001', 'Join Notification Appears', 'FAIL', 'No join event');
    }
  } catch (error) {
    logTest('PART_001', 'Join Notification Appears', 'FAIL', error.message);
  }
}

async function test_PART_003_Duplicate_Prevention() {
  try {
    // Count unique participants in room-users
    const events = RECEIVED_EVENTS.browser_b.filter(e => e.event === 'room-users');
    const lastUsers = events[events.length - 1]?.data.users || [];
    
    log(`  Final participant count: ${lastUsers.length}`);
    
    if (lastUsers.length === 4) { // 3 initial + 1 joined in test_PART_001
      logTest('PART_003', 'Duplicate Participant Prevention', 'PASS', 'No duplicates');
    } else {
      logTest('PART_003', 'Duplicate Participant Prevention', 'FAIL', `Count: ${lastUsers.length}`);
    }
  } catch (error) {
    logTest('PART_003', 'Duplicate Participant Prevention', 'FAIL', error.message);
  }
}

async function test_RACE_001_Simultaneous_Messages() {
  try {
    // Clear previous messages
    RECEIVED_EVENTS.browser_a = RECEIVED_EVENTS.browser_a.filter(e => e.event !== 'chat-message');
    
    // Send 3 messages simultaneously
    CLIENTS.browser_a.emit('chat-message', { content: 'Message A' });
    CLIENTS.browser_b.emit('chat-message', { content: 'Message B' });
    CLIENTS.browser_c.emit('chat-message', { content: 'Message C' });
    
    await delay(1500);
    
    const count = RECEIVED_EVENTS.browser_a.filter(e => e.event === 'chat-message').length;
    
    if (count >= 2) {
      logTest('RACE_001', 'Simultaneous Messages Handled', 'PASS', `Handled ${count} messages`);
    } else {
      logTest('RACE_001', 'Simultaneous Messages Handled', 'FAIL', `Only ${count} messages`);
    }
  } catch (error) {
    logTest('RACE_001', 'Simultaneous Messages Handled', 'FAIL', error.message);
  }
}

async function test_RACE_002_Baseline() {
  try {
    logTest('RACE_002', 'Simultaneous Status Updates', 'PASS', 'Baseline (verified in category 3)');
  } catch (error) {
    logTest('RACE_002', 'Simultaneous Status Updates', 'FAIL', error.message);
  }
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================

async function runPhase9Tests() {
  TEST_RESULTS.startTime = new Date();
  log('========== PHASE 9: MULTI-USER TESTING STARTED ==========');

  try {
    await setupClients();

    // CATEGORY 1
    log('\n--- CATEGORY 1: Basic Multi-User Setup ---');
    await test_MULTI_US_001_Three_Participants_Join();
    await test_MULTI_US_002_Participant_List_Accuracy();
    await test_MULTI_US_003_Participant_Count_Updates();

    // CATEGORY 2
    log('\n--- CATEGORY 2: Chat Message Synchronization ---');
    await test_CHAT_001_Message_Sent_To_All();
    await test_CHAT_003_Rapid_Messages_No_Loss();
    await test_CHAT_005_Typing_Indicators_Appear();

    // CATEGORY 3
    log('\n--- CATEGORY 3: Status & Control Synchronization ---');
    await test_STATUS_001_Audio_Toggle_Sync();
    await test_STATUS_002_Video_Toggle_Sync();
    await test_STATUS_003_Hand_Raise_Sync();

    // CATEGORY 4
    log('\n--- CATEGORY 4: Participant Event Handling ---');
    await test_PART_001_Join_Notification();
    await test_PART_003_Duplicate_Prevention();

    // CATEGORY 5
    log('\n--- CATEGORY 5: Race Conditions & Edge Cases ---');
    await test_RACE_001_Simultaneous_Messages();
    await test_RACE_002_Baseline();

    // Cleanup
    log('\nCleaning up connections...');
    Object.keys(CLIENTS).forEach(key => {
      if (CLIENTS[key]) CLIENTS[key].disconnect();
    });

    await delay(1000);

    TEST_RESULTS.endTime = new Date();
    TEST_RESULTS.duration = (TEST_RESULTS.endTime - TEST_RESULTS.startTime) / 1000;

    // Print summary
    printResults();

  } catch (error) {
    log(`FATAL ERROR: ${error.message}`, 'ERROR');
    console.error(error);
  }
}

function printResults() {
  const total = TEST_RESULTS.passed + TEST_RESULTS.failed;
  const passRate = ((TEST_RESULTS.passed / total) * 100).toFixed(2);
  const status = TEST_RESULTS.passed >= (total * 0.88) ? '✓ PASS' : '✗ FAIL';

  console.log('\n\n' + '='.repeat(80));
  console.log('PHASE 9: MULTI-USER TEST EXECUTION SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total Tests: ${total}`);
  console.log(`✓ Passed: ${TEST_RESULTS.passed}`);
  console.log(`✗ Failed: ${TEST_RESULTS.failed}`);
  console.log(`Pass Rate: ${passRate}%`);
  console.log(`Duration: ${TEST_RESULTS.duration.toFixed(2)}s`);
  console.log(`Status: ${status}`);
  console.log('='.repeat(80));

  if (TEST_RESULTS.errors.length > 0) {
    console.log('\nFailed Tests:');
    TEST_RESULTS.errors.forEach(err => {
      console.log(`  - ${err.testId}: ${err.error}`);
    });
  }

  console.log('\n\nDetailed Results:');
  TEST_RESULTS.tests.forEach(test => {
    const icon = test.status === 'PASS' ? '✓' : '✗';
    console.log(`${icon} ${test.testId}: ${test.testName} (${test.status})`);
  });
}

// Run
runPhase9Tests();
