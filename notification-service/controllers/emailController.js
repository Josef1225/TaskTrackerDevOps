const { sendEmail } = require('../services/emailService');

const sendEmailController = async (req, res) => {
  const { to, subject, message, html } = req.body;

  if (!to || !subject || (!message && !html)) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    await sendEmail({ to, subject, text: message, html });
    res.status(200).json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send email', error: error.message });
  }
};

module.exports = { sendEmailController };