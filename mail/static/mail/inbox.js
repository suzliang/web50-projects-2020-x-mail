document.addEventListener('DOMContentLoaded', function() {
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  // If submitted, send email
  document.querySelector('input[type="submit"]').addEventListener('click', send_mail);

  // By default, load the inbox
  load_mailbox('inbox');
});


function compose_email() {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}


function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Load mailbox
  fetch(`/emails/${mailbox}`, {
    method: 'GET'
  })
  .then(response => response.json())
  .then(emails => {
    // Print emails
    console.log(emails);

    for (var i = 0; i < emails.length; i++) {
      email = emails[i];
      let div = document.createElement('div');
      div.className = 'row border';
      var recip = document.createElement('div');
      recip.className = 'col-sm-3';
      recip.innerHTML = `${email.sender}`;
      var sub = document.createElement('div');
      sub.className = 'col-sm-6';
      sub.innerHTML = `${email.subject}`;
      var time = document.createElement('div');
      time.className = 'col-sm-3';
      time.innerHTML = `${email.timestamp}`;

      div.appendChild(recip);
      div.appendChild(sub);
      div.appendChild(time);
      document.querySelector('#emails-view').append(div);
      // If email unread, white bg. If email read, gray bg.

      div.addEventListener('click', function() {
        console.log('This email has been clicked!', `${email.subject}`);
        view_email(email.id);
      });
    }
  });
}


function send_mail() {
  // POST
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value,
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log('Success: ', result);
  })
  .catch((error) => {
    console.error('Error:', error);
  });

  // Load sent mailbox
  load_mailbox('sent');
  return false;
}


function view_email(email_id) {
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    credentials: "same-origin",
    headers: {
      "X-CSRFToken": getCookie("csrftoken"),
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      read: true
    }),
  })
  .then(response => response.json())
  .then(email => {
      // Print email
      console.log(email);

      // ... do something else with email ...
  });
}


function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i].trim();
          // Does this cookie string begin with the name we want?
          if (cookie.substring(0, name.length + 1) === (name + '=')) {
              cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
              break;
          }
      }
  }
  return cookieValue;
}