
// ... existing code ...
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Contact Form Endpoint
app.post('/api/contact', apiLimiter, async (req, res) => {
    const { name, email, subject, message } = req.body;
    
    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Name, email, and message are required.' });
    }

    try {
        // Email to Admin
        const adminHtml = emailLayout(
            `New Inquiry: ${subject || 'General Question'}`,
            `<h2 style="margin-top:0;">New Contact Form Submission</h2>
             <p><strong>Name:</strong> ${name}</p>
             <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
             <p><strong>Subject:</strong> ${subject}</p>
             <div class="divider"></div>
             <p><strong>Message:</strong></p>
             <p style="white-space: pre-wrap; background: #fafafa; padding: 15px; border-radius: 8px;">${message}</p>`
        );

        await sendEmail(process.env.EMAIL_USER, `Contact: ${subject || 'New Inquiry'}`, adminHtml);

        res.json({ success: true, message: 'Message sent successfully' });
    } catch (e) {
        console.error("Contact form error:", e);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

app.post('/api/newsletter/subscribe', async (req, res) => {
// ... existing code ...
