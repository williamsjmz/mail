let mailbox = 'inbox'

document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // Submit the form
  document.querySelector('form').onsubmit = send_email;

  // By default, load the inbox
  load_mailbox(mailbox);
});

function send_email() {

  // Gets the recipients, the subject and the body of the mail.
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  // Sends an email.
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
    if (result.error) {
      console.log(result);
    }else {
      console.log(result);
      load_mailbox('sent');
    }
  });

  // Stop form from submitting
  return false;
}

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

// Load selected mailbox
function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Load the mailbox
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    emails.forEach(add_mail);
  })

  // Stop form from submitting
  return false;
}

// Add a new email with given contents to the mailbox
function add_mail(email) {

  // Create new mail element
  const element = document.createElement('div');
  element.className = 'row';

  // Add an onclick event listener to the mail element
  element.addEventListener('click', event => view_email);

  // Asign background color and some style to the email element
  if (email.read) {
    element.className = 'btn btn-secondary';
  }else {
    element.className = 'btn btn-light';
  }

  // Add inner HTML to the email element
  element.innerHTML = `
    <div class="column" style="text-align: left;">
      <strong>${email.sender}</strong>
    </div>
    <div class="column" style="text-align: center;">
      ${email.subject}
    </div>
    <div class="column" style="text-align: right;">
      ${email.timestamp}
    </div>
  `;

  // Add email element to mailbox
  document.querySelector('#emails-view').append(element);
}