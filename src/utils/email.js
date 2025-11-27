import { API_BASE } from './spotify';

export const sendEmail = async (to, subject, htmlContent) => {
  try {
    const response = await fetch(`${API_BASE}/api/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, html: htmlContent }),
    });
    return await response.json();
  } catch (error) {
    console.error("Email failed:", error);
    return { success: false, error };
  }
};

export const generateBookingTemplate = (userName, classDetails) => {
  return `
    <div style="font-family: serif; color: #444; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #0d9488;">Booking Confirmed</h1>
      <p>Namaste ${userName},</p>
      <p>We are delighted to confirm your spot for <strong>${classDetails.title}</strong>.</p>
      <div style="background: #f5f5f4; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Date:</strong> ${new Date(classDetails.date).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${new Date(classDetails.date).toLocaleTimeString()}</p>
        <p><strong>Location:</strong> ${classDetails.location}</p>
      </div>
      <p>Please arrive 10 minutes early to settle in.</p>
      <p>With gratitude,<br/>Jocelyn</p>
    </div>
  `;
};