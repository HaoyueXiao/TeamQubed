// ✅ Corrected Code.gs with explicit CORS and preflight OPTIONS handling

function doGet(e) {
  const action = e.parameter.action;
  if (action === 'login') return login(e);
  if (action === 'getCourses') return getCourses(e);
  return withCors(JSON.stringify({ success: false, message: 'Unknown GET action' }));
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const action = data.action;

  if (action === 'register') return register(data);
  if (action === 'addCourse') return addCourse(data);
  if (action === 'updateCourse') return updateCourse(data);
  if (action === 'deleteCourse') return deleteCourse(data);

  return withCors(JSON.stringify({ success: false, message: 'Unknown POST action' }));
}

// ✅ Explicitly handle OPTIONS requests (CORS preflight)
function doOptions(e) {
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeader("Access-Control-Allow-Origin", "*")
    .setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    .setHeader("Access-Control-Allow-Headers", "Content-Type");
}

// ✅ Helper function to return JSON responses with proper CORS headers
function withCors(content) {
  return ContentService.createTextOutput(content)
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader("Access-Control-Allow-Origin", "*")
    .setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    .setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function register(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Users');
  const users = sheet.getDataRange().getValues();
  const emailIndex = 3;

  for (let i = 1; i < users.length; i++) {
    if (users[i][emailIndex] === data.email) {
      return withCors(JSON.stringify({ success: false, message: 'Email already registered' }));
    }
  }

  const id = Date.now();
  sheet.appendRow([id, data.firstName, data.lastName, data.email, data.password, new Date().toISOString()]);

  return withCors(JSON.stringify({
    success: true,
    user: { id, firstName: data.firstName, lastName: data.lastName, name: `${data.firstName} ${data.lastName}`, email: data.email }
  }));
}

function login(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Users');
  const users = sheet.getDataRange().getValues();
  const email = e.parameter.email;
  const password = e.parameter.password;

  for (let i = 1; i < users.length; i++) {
    if (users[i][3] === email && users[i][4] === password) {
      return withCors(JSON.stringify({
        success: true,
        user: {
          id: users[i][0],
          firstName: users[i][1],
          lastName: users[i][2],
          name: `${users[i][1]} ${users[i][2]}`,
          email: users[i][3]
        }
      }));
    }
  }

  return withCors(JSON.stringify({ success: false, message: 'Invalid credentials' }));
}

function getCourses(e) {
  const userId = e.parameter.userId;
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Courses');
  const rows = sheet.getDataRange().getValues();
  const courses = [];

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][1]) === String(userId)) {
      courses.push({
        id: rows[i][0],
        userId: rows[i][1],
        name: rows[i][2],
        subject: rows[i][3],
        created: rows[i][4]
      });
    }
  }

  return withCors(JSON.stringify({ success: true, courses }));
}

function addCourse(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Courses');
  const id = Date.now();
  sheet.appendRow([id, data.userId, data.course.name, data.course.subject, new Date().toISOString()]);
  return withCors(JSON.stringify({ success: true }));
}

function updateCourse(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Courses');
  const rows = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(data.courseId)) {
      sheet.getRange(i + 1, 3).setValue(data.updatedCourse.name);
      sheet.getRange(i + 1, 4).setValue(data.updatedCourse.subject);
      return withCors(JSON.stringify({ success: true }));
    }
  }

  return withCors(JSON.stringify({ success: false, message: 'Course not found' }));
}

function deleteCourse(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Courses');
  const rows = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(data.courseId)) {
      sheet.deleteRow(i + 1);
      return withCors(JSON.stringify({ success: true }));
    }
  }

  return withCors(JSON.stringify({ success: false, message: 'Course not found' }));
}
