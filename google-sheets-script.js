// Google Apps Script code for Google Sheets backend
// Deploy this as a web app in Google Apps Script

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // Get the active spreadsheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    
    if (data.type === 'request') {
      // Handle assignment requests
      const requestSheet = sheet.getSheetByName('Requests') || sheet.insertSheet('Requests');
      
      // Add headers if sheet is empty
      if (requestSheet.getLastRow() === 0) {
        requestSheet.getRange(1, 1, 1, 15).setValues([[
          'Timestamp', 'Full Name', 'Email', 'Phone', 'University', 
          'Assignment Type', 'Subject', 'Pages', 'Title', 'Description', 
          'Deadline', 'Urgency', 'Estimated Price (₹)', 'Status', 'Admin Notes'
        ]]);
        
        // Format headers
        const headerRange = requestSheet.getRange(1, 1, 1, 15);
        headerRange.setBackground('#2563eb');
        headerRange.setFontColor('white');
        headerRange.setFontWeight('bold');
      }
      
      // Add the request data
      requestSheet.appendRow([
        data.timestamp || new Date().toISOString(),
        data.fullName || '',
        data.email || '',
        data.phone || '',
        data.university || '',
        data.assignmentType || '',
        data.subject || '',
        data.pages || '',
        data.title || '',
        data.description || '',
        data.deadline || '',
        data.urgency || '',
        data.estimatedPrice || '',
        'Pending',
        ''
      ]);
      
      // Auto-resize columns
      requestSheet.autoResizeColumns(1, 15);
      
      // Send email notification
      sendEmailNotification(data);
      
    } else if (data.type === 'contact') {
      // Handle contact form submissions
      const contactSheet = sheet.getSheetByName('Contacts') || sheet.insertSheet('Contacts');
      
      // Add headers if sheet is empty
      if (contactSheet.getLastRow() === 0) {
        contactSheet.getRange(1, 1, 1, 5).setValues([[
          'Timestamp', 'Name', 'Email', 'Message', 'Status'
        ]]);
        
        // Format headers
        const headerRange = contactSheet.getRange(1, 1, 1, 5);
        headerRange.setBackground('#2563eb');
        headerRange.setFontColor('white');
        headerRange.setFontWeight('bold');
      }
      
      // Add the contact data
      contactSheet.appendRow([
        data.timestamp || new Date().toISOString(),
        data.name || '',
        data.email || '',
        data.message || '',
        'New'
      ]);
      
      // Auto-resize columns
      contactSheet.autoResizeColumns(1, 5);
      
      // Send contact email notification
      sendContactNotification(data);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({success: true}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error:', error);
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  // Handle GET requests (optional - for testing)
  return ContentService
    .createTextOutput('StudySprint API is running')
    .setMimeType(ContentService.MimeType.TEXT);
}

function sendEmailNotification(data) {
  try {
    const adminEmail = 'arshitpal408@gmail.com'; // Updated to match website contact email
    
    const subject = `🚀 New Assignment Request - ${data.subject}`;
    
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px;">
        <div style="background: linear-gradient(135deg, #2563eb, #3b82f6); color: white; padding: 30px; border-radius: 15px; text-align: center; margin-bottom: 20px;">
          <h1 style="margin: 0; font-size: 24px;">📚 StudySprint</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">New Assignment Request Received</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
          <h2 style="color: #2563eb; margin-bottom: 20px;">Student Information</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr><td style="padding: 8px 0; font-weight: bold; color: #1e293b;">Name:</td><td style="padding: 8px 0;">${data.fullName}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold; color: #1e293b;">Email:</td><td style="padding: 8px 0;">${data.email}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold; color: #1e293b;">Phone:</td><td style="padding: 8px 0;">${data.phone}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold; color: #1e293b;">University:</td><td style="padding: 8px 0;">${data.university || 'Not specified'}</td></tr>
          </table>
          
          <h2 style="color: #2563eb; margin-bottom: 20px;">Assignment Details</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr><td style="padding: 8px 0; font-weight: bold; color: #1e293b;">Type:</td><td style="padding: 8px 0;">${formatAssignmentType(data.assignmentType)}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold; color: #1e293b;">Subject:</td><td style="padding: 8px 0;">${data.subject}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold; color: #1e293b;">Title:</td><td style="padding: 8px 0;">${data.title || 'Not specified'}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold; color: #1e293b;">Pages:</td><td style="padding: 8px 0;">${data.pages}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold; color: #1e293b;">Deadline:</td><td style="padding: 8px 0;">${formatDate(data.deadline)}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold; color: #1e293b;">Urgency:</td><td style="padding: 8px 0;">${formatUrgency(data.urgency)}</td></tr>
          </table>
          
          <div style="background: linear-gradient(135deg, #2563eb, #3b82f6); color: white; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0;">💰 Estimated Price</h3>
            <p style="font-size: 24px; font-weight: bold; margin: 0;">₹${data.estimatedPrice}</p>
          </div>
          
          ${data.description ? `
          <h2 style="color: #2563eb; margin-bottom: 15px;">Description</h2>
          <div style="background: #f8fafc; padding: 15px; border-radius: 10px; border-left: 4px solid #2563eb;">
            <p style="margin: 0; line-height: 1.6;">${data.description}</p>
          </div>
          ` : ''}
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #64748b; margin: 0;">Submitted on ${formatDate(data.timestamp)}</p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #64748b;">
          <p>Please respond to this request within 2 hours for best customer experience.</p>
        </div>
      </div>
    `;
    
    MailApp.sendEmail({
      to: adminEmail,
      subject: subject,
      htmlBody: htmlBody
    });
    
    // Send confirmation email to student
    sendStudentConfirmation(data);
    
  } catch (error) {
    console.error('Email error:', error);
  }
}

function sendStudentConfirmation(data) {
  try {
    const studentSubject = '✅ Assignment Request Received - StudySprint';
    const studentBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; border-radius: 15px; text-align: center; margin-bottom: 20px;">
          <h1 style="margin: 0; font-size: 24px;">🚀 StudySprint</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Request Received Successfully!</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
          <h2 style="color: #10b981; margin-bottom: 20px;">Dear ${data.fullName},</h2>
          <p style="line-height: 1.6; color: #1e293b;">Thank you for choosing StudySprint! We have received your assignment request and our team will review it shortly.</p>
          
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #059669; margin: 0 0 15px 0;">📋 Your Request Summary</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 5px 0; font-weight: bold; color: #1e293b;">Subject:</td><td style="padding: 5px 0;">${data.subject}</td></tr>
              <tr><td style="padding: 5px 0; font-weight: bold; color: #1e293b;">Type:</td><td style="padding: 5px 0;">${formatAssignmentType(data.assignmentType)}</td></tr>
              <tr><td style="padding: 5px 0; font-weight: bold; color: #1e293b;">Pages:</td><td style="padding: 5px 0;">${data.pages}</td></tr>
              <tr><td style="padding: 5px 0; font-weight: bold; color: #1e293b;">Deadline:</td><td style="padding: 5px 0;">${formatDate(data.deadline)}</td></tr>
              <tr><td style="padding: 5px 0; font-weight: bold; color: #1e293b;">Estimated Price:</td><td style="padding: 5px 0; font-weight: bold; color: #059669;">₹${data.estimatedPrice}</td></tr>
            </table>
          </div>
          
          <h3 style="color: #2563eb; margin: 25px 0 15px 0;">🔄 What happens next?</h3>
          <div style="margin: 15px 0;">
            <div style="display: flex; align-items: center; margin: 10px 0;">
              <span style="background: #2563eb; color: white; width: 25px; height: 25px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 15px; font-weight: bold; font-size: 14px;">1</span>
              <span>Our team reviews your requirements (within 2 hours)</span>
            </div>
            <div style="display: flex; align-items: center; margin: 10px 0;">
              <span style="background: #2563eb; color: white; width: 25px; height: 25px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 15px; font-weight: bold; font-size: 14px;">2</span>
              <span>We send you a detailed quote and payment instructions</span>
            </div>
            <div style="display: flex; align-items: center; margin: 10px 0;">
              <span style="background: #2563eb; color: white; width: 25px; height: 25px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 15px; font-weight: bold; font-size: 14px;">3</span>
              <span>Once payment is confirmed, we start working immediately</span>
            </div>
            <div style="display: flex; align-items: center; margin: 10px 0;">
              <span style="background: #2563eb; color: white; width: 25px; height: 25px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 15px; font-weight: bold; font-size: 14px;">4</span>
              <span>Receive your completed assignment before the deadline</span>
            </div>
          </div>
          
          <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 10px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e;"><strong>📧 Important:</strong> Please check your email (including spam folder) for our response within 2 hours.</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #64748b;">Need immediate assistance?</p>
            <p style="margin: 5px 0;"><strong>📧 Email:</strong> info@studysprint.com</p>
            <p style="margin: 5px 0;"><strong>📱 Phone:</strong> +91 98765 43210</p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #64748b;">
          <p>Thank you for choosing StudySprint - Sprint Through Your Assignments! 🚀</p>
        </div>
      </div>
    `;
    
    MailApp.sendEmail({
      to: data.email,
      subject: studentSubject,
      htmlBody: studentBody
    });
    
  } catch (error) {
    console.error('Student email error:', error);
  }
}

function sendContactNotification(data) {
  try {
    const adminEmail = 'arshitpal408@gmail.com';
    const subject = `📞 New Contact Message from ${data.name}`;
    
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px;">
        <div style="background: linear-gradient(135deg, #2563eb, #3b82f6); color: white; padding: 30px; border-radius: 15px; text-align: center; margin-bottom: 20px;">
          <h1 style="margin: 0; font-size: 24px;">📞 StudySprint</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">New Contact Message</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
          <h2 style="color: #2563eb; margin-bottom: 20px;">Contact Details</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr><td style="padding: 8px 0; font-weight: bold; color: #1e293b;">Name:</td><td style="padding: 8px 0;">${data.name}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold; color: #1e293b;">Email:</td><td style="padding: 8px 0;">${data.email}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold; color: #1e293b;">Submitted:</td><td style="padding: 8px 0;">${formatDate(data.timestamp)}</td></tr>
          </table>
          
          <h2 style="color: #2563eb; margin-bottom: 15px;">Message</h2>
          <div style="background: #f8fafc; padding: 20px; border-radius: 10px; border-left: 4px solid #2563eb;">
            <p style="margin: 0; line-height: 1.6;">${data.message}</p>
          </div>
        </div>
      </div>
    `;
    
    MailApp.sendEmail({
      to: adminEmail,
      subject: subject,
      htmlBody: htmlBody
    });
    
  } catch (error) {
    console.error('Contact email error:', error);
  }
}

// Helper functions
function formatAssignmentType(type) {
  const types = {
    'handwritten': 'Handwritten Assignment',
    'charts': 'Charts & Diagrams',
    'presentation': 'PowerPoint Presentation',
    'project': 'Web Project',
    'math': 'Math & Science Work',
    'charts-paper': 'Charts Paper',
    'advanced-ppt': 'Advanced PPT',
    'website-project': 'Website Project',
    'other': 'Other'
  };
  return types[type] || type;
}

function formatUrgency(urgency) {
  const urgencies = {
    'standard': 'Standard (3+ days) - ₹2.5/page',
    'urgent': 'Urgent (1-2 days) - ₹3.0/page',
    'emergency': 'Emergency (24+ hours) - ₹4.0/page'
  };
  return urgencies[urgency] || urgency;
}

// Function to calculate specialized project pricing
function calculateSpecializedPrice(assignmentType, pages) {
  const specialPricing = {
    'charts-paper': 50,
    'advanced-ppt': 50,
    'website-project': 500
  };
  
  if (specialPricing[assignmentType]) {
    return specialPricing[assignmentType];
  }
  
  // Default page-based pricing
  const pageRates = {
    'standard': 2.5,
    'urgent': 3.0,
    'emergency': 4.0
  };
  
  return pages * (pageRates['standard'] || 2.5);
}

function formatDate(dateString) {
  if (!dateString) return 'Not specified';
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Function to get all requests (for admin dashboard if needed)
function getRequests() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const requestSheet = sheet.getSheetByName('Requests');
    
    if (!requestSheet) {
      return [];
    }
    
    const data = requestSheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);
    
    return rows.map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });
    
  } catch (error) {
    console.error('Error getting requests:', error);
    return [];
  }
}

// Function to update request status
function updateRequestStatus(rowIndex, status, adminNotes) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const requestSheet = sheet.getSheetByName('Requests');
    
    if (!requestSheet) {
      return false;
    }
    
    // Update status column (column 14)
    requestSheet.getRange(rowIndex + 2, 14).setValue(status);
    
    // Add admin notes if provided (column 15)
    if (adminNotes) {
      requestSheet.getRange(rowIndex + 2, 15).setValue(adminNotes);
    }
    
    return true;
    
  } catch (error) {
    console.error('Error updating status:', error);
    return false;
  }
}