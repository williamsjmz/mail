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
  show_view('#compose-view', '#emails-view', '#email-view');

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

// Load selected mailbox
function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  show_view('#emails-view', '#compose-view', '#email-view');

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
  element.addEventListener('click', () => {

    // Mark the mail as read
    fetch(`emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        read: true
      })
    })

    // Charge new mail info and show it
    fetch(`emails/${email.id}`)
    .then(response => response.json())
    .then(email => view_email(email))
  });

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

  // Adding some style 
  element.style.width = '100%';
  element.style.margin = '5px';

  // Add email element to mailbox
  document.querySelector('#emails-view').append(element);

  // Stop form from submitting
  return false;
}

function view_email(email) {

  // Clear the inner HTML
  document.querySelector('#email-view').innerHTML = '';

  // Show the mail view and hide other views
  show_view('#email-view', '#compose-view', '#emails-view');

  // Create a new form element
  const form = document.createElement('form');
  form.id = 'email-form';

  // Add inner HTML to the form element
  form.innerHTML = `
    <h3>View Mail</h3>

    <div class="form-group" id="email-sender">
      From: <input disabled class="form-control" value="${email.sender}">
    </div>

    <div class="form-group" id="email-recipients">
      To: <input disabled class="form-control" value="${email.recipients}">
    </div>

    <div class="form-group" id="email-subject">
      Subject: <input disabled class="form-control" value="${email.subject}">
    </div>

    <div class="form-group" id="email-timestamp">
      Date: <input disabled class="form-control" value="${email.timestamp}">
    </div>

    <textarea disabled class="form-control" id="email-body">${email.body}</textarea>
  `;

  // Add email view to the email-view div
  document.querySelector('#email-view').append(form);

  // Stop form from submitting
  return false;
}

function show_view() {
  for (var i = 0; i < arguments.length; i++) {
    if (i === 0)
      document.querySelector(arguments[i]).style.display = 'block';
    else
      document.querySelector(arguments[i]).style.display = 'none';
  }
}