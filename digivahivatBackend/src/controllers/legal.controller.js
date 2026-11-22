/**
 * controllers/legal.controller.js
 *
 * Public legal, support, and privacy pages required for
 * Apple App Store and Google Play Store compliance.
 */

const baseStyles = `
  :root {
    --primary: #00AFEF;
    --secondary: #3E4095;
    --dark: #1E1E1E;
    --muted: #64748B;
    --border: #E2E8F0;
    --bg-subtle: #F8FAFC;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: var(--dark);
    background: #FFFFFF;
    line-height: 1.6;
    padding: 0;
  }
  .header {
    background: linear-gradient(135deg, #3E4095 0%, #00AFEF 100%);
    color: #FFFFFF;
    padding: 40px 24px;
    text-align: center;
  }
  .header h1 {
    font-size: 28px;
    font-weight: 800;
    letter-spacing: -0.5px;
    margin-bottom: 8px;
  }
  .header p {
    font-size: 14px;
    opacity: 0.9;
  }
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 36px 20px 60px;
  }
  .badge {
    display: inline-block;
    background: rgba(0, 175, 239, 0.12);
    color: #00AFEF;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.8px;
    padding: 4px 12px;
    border-radius: 20px;
    margin-bottom: 16px;
    text-transform: uppercase;
  }
  h2 {
    font-size: 20px;
    color: var(--secondary);
    margin: 28px 0 12px;
    font-weight: 700;
  }
  p, ul {
    margin-bottom: 16px;
    color: #334155;
    font-size: 15px;
  }
  ul {
    padding-left: 24px;
  }
  li {
    margin-bottom: 8px;
  }
  .card {
    background: var(--bg-subtle);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 20px;
    margin: 20px 0;
  }
  .card h3 {
    font-size: 16px;
    color: var(--dark);
    margin-bottom: 8px;
  }
  .contact-box {
    background: #F0F9FF;
    border: 1px solid #BAE6FD;
    border-radius: 12px;
    padding: 20px;
    margin-top: 32px;
  }
  .contact-box h3 {
    color: var(--secondary);
    font-size: 17px;
    margin-bottom: 8px;
  }
  .contact-box p {
    margin-bottom: 6px;
    font-size: 14px;
  }
  .contact-box a {
    color: #00AFEF;
    font-weight: 600;
    text-decoration: none;
  }
  .contact-box a:hover {
    text-decoration: underline;
  }
  .footer {
    text-align: center;
    border-top: 1px solid var(--border);
    padding: 24px 20px;
    font-size: 13px;
    color: var(--muted);
    background: #FFFFFF;
  }
  .footer a {
    color: var(--primary);
    text-decoration: none;
    margin: 0 10px;
  }
`;

exports.getPrivacyPolicy = (req, res) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Privacy Policy - DigiVahivat (Sky Society)</title>
  <style>${baseStyles}</style>
</head>
<body>
  <div class="header">
    <h1>Privacy Policy</h1>
    <p>DigiVahivat (Sky Society) • Residential Community Management</p>
  </div>
  <div class="container">
    <div class="badge">Last Updated: November 2026</div>

    <p>This Privacy Policy describes how <strong>DigiVahivat</strong> ("Sky Society", "we", "us", or "our") collects, uses, and protects your personal information when you use our mobile application and related services.</p>

    <h2>1. Information We Collect</h2>
    <p>We collect information necessary to manage residential society services:</p>
    <ul>
      <li><strong>Account Information:</strong> Name, 10-digit phone number, apartment/flat number, family member count, and encrypted password.</li>
      <li><strong>Visitor Management Data:</strong> Guest name, phone number, vehicle number, host flat number, expected arrival time, gate check-in/check-out timestamps, and passcode/QR tokens.</li>
      <li><strong>Emergency SOS Alerts:</strong> Emergency type, triggering resident details, flat number, and incident timestamps.</li>
      <li><strong>Society Management Records:</strong> Maintenance and event fee records, payment status, receipts, notices, and society helpdesk complaints.</li>
    </ul>

    <h2>2. Device Permissions We Request</h2>
    <p>Our mobile app requests the following optional permissions strictly to deliver core society security and management features:</p>
    <ul>
      <li><strong>Camera:</strong> Used exclusively at the security gate to scan visitor QR passes using Google Play Services / iOS native barcode scanning. We do not store or capture raw camera imagery without user intent.</li>
      <li><strong>Push Notifications:</strong> Used to deliver critical real-time alerts, including Emergency SOS panic alarms, urgent society notices, visitor gate arrivals, and maintenance payment confirmations.</li>
      <li><strong>Storage / Downloads:</strong> Used when downloading official PDF maintenance and contribution payment receipts.</li>
    </ul>

    <h2>3. How We Use Your Information</h2>
    <p>We use the collected information solely for society administration and resident safety:</p>
    <ul>
      <li>To authenticate residents, society administrators, and gate security personnel.</li>
      <li>To verify pre-approved visitors and prevent unauthorized access into the society.</li>
      <li>To broadcast immediate Emergency SOS panic alarms to guards and neighbors when assistance is requested.</li>
      <li>To track maintenance fees, generate receipts, and display society financial transparency.</li>
      <li>To notify residents of committee announcements and manage maintenance complaints.</li>
    </ul>

    <h2>4. Data Privacy, Sharing & Security</h2>
    <p><strong>We do not sell, rent, or trade your personal data.</strong></p>
    <ul>
      <li><strong>Society Scoping:</strong> Data is strictly scoped to your registered society. Residents and admins of one society cannot access records of another society.</li>
      <li><strong>Role-Based Access:</strong> Security guards have minimal access restricted to the Gate Visitor console and SOS monitor; they cannot view financial figures or resident administration controls.</li>
      <li><strong>Encryption:</strong> Passwords are cryptographically salted and hashed using bcrypt. All communication between the app and servers is encrypted in transit using industry-standard TLS/HTTPS.</li>
      <li><strong>Service Providers:</strong> We use Google Firebase Cloud Messaging (FCM) solely for delivering push notifications.</li>
    </ul>

    <h2>5. Account & Data Deletion (Apple Compliance)</h2>
    <p>In compliance with Apple App Store Review Guidelines, users have the right to request the complete deletion of their account and associated personal data.</p>
    <p>You may request account deletion at any time by:</p>
    <ul>
      <li>Contacting your society administrator who can remove your account from the Residents panel.</li>
      <li>Sending an email to <a href="mailto:support@digivahivat.com">support@digivahivat.com</a> with your registered phone number and flat number.</li>
    </ul>
    <p>Upon verification, your account and personal records will be permanently deleted from our active databases within 7 business days.</p>

    <div class="contact-box">
      <h3>Contact Us</h3>
      <p>If you have questions or concerns regarding this Privacy Policy, please contact our privacy team:</p>
      <p><strong>Email:</strong> <a href="mailto:support@digivahivat.com">support@digivahivat.com</a></p>
      <p><strong>Developer:</strong> Nehal Patel / DigiVahivat Team</p>
      <p><strong>App:</strong> DigiVahivat (Sky Society)</p>
    </div>
  </div>
  <div class="footer">
    &copy; 2026 DigiVahivat. All rights reserved.
    <br><br>
    <a href="/privacy-policy">Privacy Policy</a> •
    <a href="/support">Support Center</a> •
    <a href="/terms">Terms of Service</a>
  </div>
</body>
</html>`;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
};

exports.getSupportPage = (req, res) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Support & Helpdesk - DigiVahivat (Sky Society)</title>
  <style>${baseStyles}</style>
</head>
<body>
  <div class="header">
    <h1>Help & Support Center</h1>
    <p>DigiVahivat (Sky Society) • Customer Support & Helpdesk</p>
  </div>
  <div class="container">
    <div class="badge">Official Support</div>

    <p>Welcome to the <strong>DigiVahivat</strong> Help & Support Center. We are here to assist residents, security guards, and society committee members with any questions or issues.</p>

    <div class="contact-box">
      <h3>Direct Customer Support</h3>
      <p>Our dedicated support team is available Monday through Saturday, 9:00 AM – 7:00 PM IST.</p>
      <p><strong>Email Support:</strong> <a href="mailto:support@digivahivat.com">support@digivahivat.com</a></p>
      <p><strong>Developer Contact:</strong> Nehal Patel</p>
      <p><strong>Response Time:</strong> Within 24 hours</p>
    </div>

    <h2>Frequently Asked Questions (FAQ)</h2>

    <div class="card">
      <h3>1. How do I log in to the app?</h3>
      <p>Your society administrator adds your apartment and phone number to the system. You can log in using your registered 10-digit mobile number and the initial password provided by your society admin. You can change your password at any time.</p>
    </div>

    <div class="card">
      <h3>2. How does the Visitor Management System (VMS) work?</h3>
      <p>Residents can pre-approve guests, cabs, or deliveries from the "Visitors" section. The app generates a 6-digit passcode and a QR code pass which can be shared via WhatsApp. When the guest arrives at the gate, the security guard scans the QR code or types the 6-digit passcode to verify and approve gate entry.</p>
    </div>

    <div class="card">
      <h3>3. How does Emergency SOS work?</h3>
      <p>In case of an urgent emergency (Medical, Fire, Crime, Gas Leak, Lift Breakdown), tap the red SOS button. The app instantly alerts all society security guards and neighbors with loud alarms and notifications detailing your flat number and emergency type.</p>
    </div>

    <div class="card">
      <h3>4. How do I download maintenance payment receipts?</h3>
      <p>Go to the "My Payment" tab to view all your past society maintenance contributions and event fees. Tap on any recorded payment to view and download your official PDF receipt directly to your device.</p>
    </div>

    <div class="card">
      <h3>5. How do I report an issue or complaint?</h3>
      <p>Navigate to the "Complain" tab to lodge an issue (plumbing, electrical, security, noise). You can mark complaints as Private (committee only) or Public (visible to society). Society administrators can update status in real-time.</p>
    </div>

    <div class="card">
      <h3>6. How do I request account deletion?</h3>
      <p>To delete your account and personal data, please contact your society administrator or send an email to <a href="mailto:support@digivahivat.com">support@digivahivat.com</a> with your registered phone number. Your account will be removed within 7 business days.</p>
    </div>
  </div>
  <div class="footer">
    &copy; 2026 DigiVahivat. All rights reserved.
    <br><br>
    <a href="/privacy-policy">Privacy Policy</a> •
    <a href="/support">Support Center</a> •
    <a href="/terms">Terms of Service</a>
  </div>
</body>
</html>`;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
};

exports.getTermsPage = (req, res) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Terms of Service - DigiVahivat (Sky Society)</title>
  <style>${baseStyles}</style>
</head>
<body>
  <div class="header">
    <h1>Terms of Service</h1>
    <p>DigiVahivat (Sky Society) • User Terms & Conditions</p>
  </div>
  <div class="container">
    <div class="badge">Effective: November 2026</div>

    <p>By using the <strong>DigiVahivat</strong> application, you agree to comply with and be bound by the following Terms of Service.</p>

    <h2>1. Acceptance of Terms</h2>
    <p>This application is provided for authorized residents, administrators, and security personnel of participating residential societies. By logging into the app, you confirm that you are an authorized resident or staff member of your society.</p>

    <h2>2. User Conduct & Security</h2>
    <p>Users agree to maintain the confidentiality of their login credentials and not share accounts. Any misuse of the Emergency SOS feature (e.g., deliberate false alarms) or Visitor pass generation is strictly prohibited and subject to society committee action.</p>

    <h2>3. Intellectual Property</h2>
    <p>All software, designs, logos, and trademarks related to DigiVahivat and Sky Society are the exclusive property of the developer and owners. All rights reserved &copy; 2026.</p>

    <h2>4. Termination</h2>
    <p>Society administrators reserve the right to revoke or deactivate user access upon a resident's departure from the society or in cases of policy violation.</p>

    <div class="contact-box">
      <h3>Questions?</h3>
      <p>Contact our legal and support team at <a href="mailto:support@digivahivat.com">support@digivahivat.com</a>.</p>
    </div>
  </div>
  <div class="footer">
    &copy; 2026 DigiVahivat. All rights reserved.
    <br><br>
    <a href="/privacy-policy">Privacy Policy</a> •
    <a href="/support">Support Center</a> •
    <a href="/terms">Terms of Service</a>
  </div>
</body>
</html>`;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
};
