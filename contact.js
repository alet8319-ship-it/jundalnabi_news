// Mobile menu handled by script.js

// ===== EmailJS Integration =====
// Make sure to include EmailJS SDK in HTML:
// <script src="https://cdn.emailjs.com/dist/email.min.js"></script>
emailjs.init("support@codetoweb.tech"); // Replace with your EmailJS User ID

const form = document.querySelector('.contact-form');

form.addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent default form submission

    const name = form.name.value;
    const email = form.email.value;
    const message = form.message.value;

    // Send email via EmailJS
    emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", {
        from_name: name,
        from_email: email,
        message: message
    })
        .then(() => {
            alert("Message sent successfully!");
            form.reset();
        }, (err) => {
            alert("Failed to send message. Please try again later.");
            console.error(err);
        });
});
