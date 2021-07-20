document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // Submit the form
  document.querySelector('form').onsubmit = send_email;

  // By default, load the inbox
  load_mailbox('inbox');
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
      show_view('#alert-invalid-values');
    }else {
      console.log(result);
      load_mailbox('sent', true);
    }
  });

  // Stop form from submitting
  return false;
}

function compose_email() {

  // Show compose view and hide other views
  show_view('#compose-view', '#emails-view', '#email-view', '#alert-invalid-values');

  // Get the email
  const email = arguments[0];

  if (email.id) {

    console.log(email.sender);
    console.log(email.recipients);
    console.log(email.subject);
    console.log(email.timestamps);

    // Refill the composition fields
    if (email.recipients.includes(email.sender))
      document.querySelector('#compose-recipients').value = `${email.recipients}`;
    else
      document.querySelector('#compose-recipients').value = `${email.sender},${email.recipients}`;


    if (email.subject.includes('Re:'))
      document.querySelector('#compose-subject').value = `${email.subject}`;
    else
      document.querySelector('#compose-subject').value = `Re: ${email.subject}`;

    document.querySelector('#compose-body').placeholder = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;

  } else {
    
    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
  }
}

// Load selected mailbox
function load_mailbox(mailbox) {
  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `
    <div id="alert-sent" class="alert alert-success" style="display: none">
      <strong>Success!</strong> the e-mail has been sent.
    </div>
    <div id="alert-archived" class="archived alert alert-success" style="display: none">
      <strong>Success!</strong> the e-mail has been archived.
    </div>
    <div id="alert-unarchived" class="unarchived alert alert-success" style="display: none">
      <strong>Success!</strong> the e-mail has been unarchived.
    </div>
    <h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>
  `;

  if(mailbox === 'sent' && arguments[1] === true) {
    show_view('#alert-sent', '#alert-archived', '#alert-unarchived');
  } else if (mailbox === 'inbox' && arguments[1] === true) {
    show_view('#alert-archived', '#alert-sent', '#alert-unarchived');
  } else if (mailbox === 'inbox' && arguments[1] === false) {
    show_view('#alert-unarchived', '#alert-sent', '#alert-archived');
  }
  
  // Show the mailbox and hide other views
  show_view('#emails-view', '#compose-view', '#email-view', '#alert-invalid-values');

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
  element.className = "row";

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
    element.className = "row btn btn-secondary";
  }else {
    element.className = "row btn btn-light";
  }

  // Add inner HTML to the email element
  element.innerHTML = `
    <div class="col-4" style="text-align: left">
      <strong>${email.sender}</strong>
    </div>
    <div class="col-4" style="text-align: left">
      ${email.subject}
    </div>
    <div class="col-4" style="text-align: right">
      ${email.timestamp}
    </div>
  `;

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

  // Create elements
  const email_element = document.createElement('div');
  const reply = document.createElement('button');
  const archive = document.createElement('button');
  const hr = document.createElement('hr');
  const body = document.createElement('div');

  // Add event listener to the Archive button
  archive.addEventListener('click', function() {

    // If the email is already archived
    if (email.archived) {

      // Then now is unarchived
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: false
        })
      })

      // Load the inbox mailbox
      load_mailbox('inbox', false);
    } else {

      // If not, then now is archived
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: true
        })
      })
      
      // Load the inbox mailbox
      load_mailbox('inbox', true);
    }

    // Stop form from submitting
    return false;

  });

  // Add event listener to the Reply button
  reply.addEventListener('click', function() {
    compose_email(email);
  });

  // Getting the div with id=email-view
  const email_view = document.querySelector('#email-view');

  // Add classes to the elements
  reply.className = "reply btn btn-sm btn-outline-primary";
  archive.className = "archive btn btn-sm btn-outline-primary"

  // Add inner HTML to the buttons and the body
  reply.innerHTML = 'Reply';

  if (email.archived)
    archive.innerHTML = 'Unarchive';
  else
    archive.innerHTML = 'Archive';

  body.innerHTML = `${email.body}`;


  // Add inner HTML to the email element
  email_element.innerHTML = `
    <div>
      <strong>From</strong>: ${email.sender}
    </div>
    <div>
      <strong>To</strong>: ${email.recipients}
    </div>
    <div>
      <strong>Subject</strong>: ${email.subject}
    </div>
    <div>
      <strong>Timestamp</strong>: ${email.timestamp}
    </div>
  `;

  // Add elements to the div with id = email-view 
  email_view.append(email_element);
  email_view.append(reply);
  email_view.append(archive);
  email_view.append(hr);
  email_view.append(body);

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