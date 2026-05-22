const nodemailer = require('nodemailer');

/**
 * Nodemailer transporter configured for Gmail SMTP.
 * Uses app-specific password from environment variables.
 */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ─── Restaurant branding constants ───────────────────────────────────────────
const BRAND_GREEN = '#2D5A27';
const BRAND_GOLD  = '#FBC02D';
const RESTAURANT_NAME    = 'Food Garden';
const RESTAURANT_ADDRESS = '17, Lavelle Road, Ashok Nagar, Bengaluru 560001';
const RESTAURANT_PHONE   = '+91 80 3521 6789';
const RESTAURANT_EMAIL   = 'hello@foodgarden.in';

/**
 * Generates the shared email header with Food Garden branding.
 */
const emailHeader = () => `
  <div style="background-color: ${BRAND_GREEN}; padding: 30px 20px; text-align: center;">
    <h1 style="margin: 0; color: ${BRAND_GOLD}; font-family: 'Georgia', serif; font-size: 32px;">
      🌿 ${RESTAURANT_NAME}
    </h1>
    <p style="margin: 5px 0 0; color: #C8E6C9; font-size: 14px; letter-spacing: 2px;">
      AUTHENTIC INDIAN CUISINE
    </p>
  </div>
`;

/**
 * Generates the shared email footer with restaurant contact info.
 */
const emailFooter = () => `
  <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-top: 3px solid ${BRAND_GOLD};">
    <p style="margin: 0 0 5px; color: ${BRAND_GREEN}; font-weight: bold; font-size: 16px;">
      ${RESTAURANT_NAME}
    </p>
    <p style="margin: 0 0 5px; color: #666; font-size: 13px;">
      ${RESTAURANT_ADDRESS}
    </p>
    <p style="margin: 0 0 5px; color: #666; font-size: 13px;">
      📞 ${RESTAURANT_PHONE} &nbsp;|&nbsp; ✉️ ${RESTAURANT_EMAIL}
    </p>
    <p style="margin: 10px 0 0; color: #999; font-size: 11px;">
      © ${new Date().getFullYear()} ${RESTAURANT_NAME}. All rights reserved.
    </p>
  </div>
`;

// ─── Email Functions ─────────────────────────────────────────────────────────

/**
 * Send a beautifully branded reservation confirmation email to the guest.
 * @param {Object} reservation - The reservation document from MongoDB
 */
const sendReservationConfirmation = async (reservation) => {
  try {
    const htmlContent = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        ${emailHeader()}

        <div style="padding: 30px 25px;">
          <h2 style="color: ${BRAND_GREEN}; margin: 0 0 10px;">Reservation Confirmed! 🎉</h2>
          <p style="color: #555; font-size: 15px; line-height: 1.6;">
            Dear <strong>${reservation.fullname}</strong>,
          </p>
          <p style="color: #555; font-size: 15px; line-height: 1.6;">
            Thank you for choosing <strong>${RESTAURANT_NAME}</strong>! We're delighted to confirm your table reservation.
          </p>

          <!-- Booking Details Card -->
          <div style="background-color: #E8F5E9; border-left: 4px solid ${BRAND_GREEN}; border-radius: 4px; padding: 20px; margin: 20px 0;">
            <h3 style="color: ${BRAND_GREEN}; margin: 0 0 15px; font-size: 18px;">
              📋 Booking Details
            </h3>
            <table style="width: 100%; font-size: 14px; color: #444;">
              <tr>
                <td style="padding: 6px 0; font-weight: bold; width: 120px;">📅 Date:</td>
                <td style="padding: 6px 0;">${reservation.date}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold;">🕐 Time:</td>
                <td style="padding: 6px 0;">${reservation.time}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold;">👥 Guests:</td>
                <td style="padding: 6px 0;">${reservation.guests}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold;">💺 Seating:</td>
                <td style="padding: 6px 0; text-transform: capitalize;">${reservation.seating}</td>
              </tr>
              ${reservation.occasion ? `
              <tr>
                <td style="padding: 6px 0; font-weight: bold;">🎊 Occasion:</td>
                <td style="padding: 6px 0;">${reservation.occasion}</td>
              </tr>` : ''}
              ${reservation.comments ? `
              <tr>
                <td style="padding: 6px 0; font-weight: bold;">💬 Notes:</td>
                <td style="padding: 6px 0;">${reservation.comments}</td>
              </tr>` : ''}
            </table>
          </div>

          <p style="color: #555; font-size: 14px; line-height: 1.6;">
            If you need to modify or cancel your reservation, please call us at
            <strong>${RESTAURANT_PHONE}</strong> or reply to this email.
          </p>

          <div style="text-align: center; margin: 25px 0 10px;">
            <span style="display: inline-block; background-color: ${BRAND_GOLD}; color: ${BRAND_GREEN}; padding: 12px 30px; border-radius: 25px; font-weight: bold; font-size: 14px;">
              We look forward to welcoming you!
            </span>
          </div>
        </div>

        ${emailFooter()}
      </div>
    `;

    await transporter.sendMail({
      from: `"${RESTAURANT_NAME}" <${process.env.EMAIL_USER}>`,
      to: reservation.email,
      subject: `✅ Reservation Confirmed — ${RESTAURANT_NAME}`,
      html: htmlContent
    });

    console.log(`📧 Confirmation email sent to ${reservation.email}`);
  } catch (error) {
    console.error('❌ Failed to send reservation confirmation email:', error.message);
    // Don't throw — email failure should not crash the server
  }
};

/**
 * Send a notification email to the restaurant about a new contact message.
 * @param {Object} contact - The contact document from MongoDB
 */
const sendContactNotification = async (contact) => {
  try {
    const htmlContent = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        ${emailHeader()}

        <div style="padding: 30px 25px;">
          <h2 style="color: ${BRAND_GREEN}; margin: 0 0 15px;">📩 New Contact Message</h2>

          <div style="background-color: #FFF8E1; border-left: 4px solid ${BRAND_GOLD}; border-radius: 4px; padding: 20px; margin: 15px 0;">
            <table style="width: 100%; font-size: 14px; color: #444;">
              <tr>
                <td style="padding: 6px 0; font-weight: bold; width: 100px;">Name:</td>
                <td style="padding: 6px 0;">${contact.fullname}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold;">Email:</td>
                <td style="padding: 6px 0;">${contact.email}</td>
              </tr>
              ${contact.phone ? `
              <tr>
                <td style="padding: 6px 0; font-weight: bold;">Phone:</td>
                <td style="padding: 6px 0;">${contact.phone}</td>
              </tr>` : ''}
              ${contact.topic ? `
              <tr>
                <td style="padding: 6px 0; font-weight: bold;">Topic:</td>
                <td style="padding: 6px 0;">${contact.topic}</td>
              </tr>` : ''}
            </table>
          </div>

          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin: 15px 0;">
            <p style="margin: 0 0 5px; font-weight: bold; color: ${BRAND_GREEN};">Message:</p>
            <p style="margin: 0; color: #555; line-height: 1.6; white-space: pre-wrap;">${contact.message}</p>
          </div>
        </div>

        ${emailFooter()}
      </div>
    `;

    await transporter.sendMail({
      from: `"${RESTAURANT_NAME} Website" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `📩 New Contact: ${contact.topic || 'General Inquiry'} — ${contact.fullname}`,
      html: htmlContent
    });

    console.log(`📧 Contact notification sent to admin for message from ${contact.fullname}`);
  } catch (error) {
    console.error('❌ Failed to send contact notification email:', error.message);
  }
};

/**
 * Send a brief alert email to the admin about new reservations or messages.
 * @param {string} type - Alert type: 'reservation' or 'contact'
 * @param {Object} data - The reservation or contact document
 */
const sendAdminAlert = async (type, data) => {
  try {
    let subject, body;

    if (type === 'reservation') {
      subject = `🔔 New Reservation — ${data.fullname} (${data.date} at ${data.time})`;
      body = `
        <p><strong>New reservation received:</strong></p>
        <ul>
          <li><strong>Name:</strong> ${data.fullname}</li>
          <li><strong>Date:</strong> ${data.date}</li>
          <li><strong>Time:</strong> ${data.time}</li>
          <li><strong>Guests:</strong> ${data.guests}</li>
          <li><strong>Phone:</strong> ${data.phone}</li>
        </ul>
        <p>Log in to the admin dashboard to manage this reservation.</p>
      `;
    } else if (type === 'contact') {
      subject = `🔔 New Message — ${data.fullname}`;
      body = `
        <p><strong>New contact message received:</strong></p>
        <ul>
          <li><strong>From:</strong> ${data.fullname} (${data.email})</li>
          <li><strong>Topic:</strong> ${data.topic || 'General'}</li>
        </ul>
        <p><strong>Preview:</strong> ${data.message.substring(0, 150)}${data.message.length > 150 ? '...' : ''}</p>
        <p>Log in to the admin dashboard to read the full message.</p>
      `;
    } else {
      return; // Unknown alert type — silently skip
    }

    await transporter.sendMail({
      from: `"${RESTAURANT_NAME} Alert" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: subject,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; max-width: 500px;">
          <div style="border-left: 4px solid ${BRAND_GOLD}; padding-left: 15px;">
            ${body}
          </div>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">${RESTAURANT_NAME} Admin Alert System</p>
        </div>
      `
    });

    console.log(`🔔 Admin alert (${type}) sent`);
  } catch (error) {
    console.error(`❌ Failed to send admin alert (${type}):`, error.message);
  }
};

module.exports = {
  sendReservationConfirmation,
  sendContactNotification,
  sendAdminAlert
};
