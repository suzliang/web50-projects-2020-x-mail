document.addEventListener('DOMContentLoaded', function() {
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  // If submitted, send email
  document.querySelector('#compose-submit').addEventListener('click', (event) => {
    event.preventDefault();
    send_mail();
  });
  // By default, load the inbox
  load_mailbox('inbox');
});


function compose_email() {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}


function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';
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
      div.id = email.id;
      // If email unread, white bg. If email read, gray bg.
      if (email.read === true) {
        div.className = 'row bg-light text-dark border';
      } else {
        div.className = 'row bg-white text-dark border';
      }
      var recip = document.createElement('div');
      recip.className = 'col-sm-3';
      recip.id = email.id;
      recip.innerHTML = `${email.sender}`;
      var sub = document.createElement('div');
      sub.className = 'col-sm-6';
      sub.id = email.id;
      sub.innerHTML = `${email.subject}`;
      var time = document.createElement('div');
      time.className = 'col-sm-3';
      time.id = email.id;
      time.innerHTML = `${email.timestamp}`;

      div.appendChild(recip);
      div.appendChild(sub);
      div.appendChild(time);
      document.querySelector('#emails-view').append(div);

      // View email
      div.addEventListener("click", function(event) {
        console.log(event.target.id);
        if (mailbox === 'sent') {
          view_email_sent(event.target.id);
        } else {
          view_email(event.target.id);
        }
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
      load_mailbox('sent');
  })
  .catch((error) => {
    console.error('Error:', error);
  });
}


function view_email(email_id) {
  fetch(`/emails/${email_id}`, {
    method: 'GET',
  })
  .then(response => response.json())
  .then(email => {
      // Print email
      console.log(email);

      // Clears out view email history
      document.querySelector('#email-view').innerHTML = '';

      // Show email view and hide others
      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#email-view').style.display = 'block';
      document.querySelector('#compose-view').style.display = 'none';
      
      // Show email
      let div = document.createElement('div');
      div.className = 'row';
      var div0 = document.createElement('div');
      div0.className = 'col-sm-12';
      var s = document.createElement('p');
      s.innerHTML = `From: ${email.sender}`;
      var r = document.createElement('p');
      r.innerHTML = `To: ${email.recipients}`;
      var sub = document.createElement('p');
      sub.innerHTML = `Subject: ${email.subject}`;
      var t = document.createElement('p');
      t.innerHTML = `Timestamp: ${email.timestamp}`;

      div.appendChild(div0)
      div0.appendChild(s);
      div0.appendChild(r);
      div0.appendChild(sub);
      div0.appendChild(t);

      let div0_1 = document.createElement('div');
      div0_1.className = 'row';
      div0_1.style.borderBottom = "thin solid";
      var div1 = document.createElement('div');
      div1.className = 'btn-group';
      var rp = document.createElement('button');
      rp.className = 'btn btn-primary rounded mr-1';
      rp.type = 'submit';
      rp.id = 'reply';
      rp.innerHTML = 'Reply';
      rp.style.margin = '1px 10px 20px 10px';
      var a = document.createElement('button');
      a.className = 'btn btn-primary rounded mr-1';
      a.type = 'submit';
      a.id = 'archive';
      a.innerHTML = 'Archive';
      a.style.margin = '1px 10px 20px 10px';
      var ua = document.createElement('button');
      ua.className = 'btn btn-primary rounded mr-1';
      ua.type = 'submit';
      ua.id = 'unarchive';
      ua.innerHTML = 'Unarchive';
      ua.style.margin = '1px 10px 20px 10px';

      div0_1.appendChild(div1);
      div1.appendChild(rp);
      div1.appendChild(a);
      div1.appendChild(ua);

      let div2 = document.createElement('div');
      div2.className = 'row';
      var b = document.createElement('p');
      b.innerHTML = `${email.body}`;

      div2.appendChild(b);

      document.querySelector('#email-view').append(div);
      document.querySelector('#email-view').append(div0_1);
      document.querySelector('#email-view').append(div2);

      // Mark email as read
      read(email.id);

      // If reply clicked
      document.querySelector('#reply').addEventListener('click', function() {
        reply(email.id);
      }, false);

      // If archived/unarchived
      if (email.archived === true) {
        document.querySelector('#archive').style.display = 'none';
      } else {
        document.querySelector('#unarchive').style.display = 'none';
      }
      document.querySelector('#archive').addEventListener('click', function(){
        archive(email.id);
      });
      document.querySelector('#unarchive').addEventListener('click', function(){
        unarchive(email.id);
      });
  });
}


function view_email_sent(email_id) {
  fetch(`/emails/${email_id}`, {
    method: 'GET',
  })
  .then(response => response.json())
  .then(email => {
      // Print email
      console.log(email);

      // Clears out view email history
      document.querySelector('#email-view').innerHTML = '';

      // Show email view and hide others
      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#email-view').style.display = 'block';
      document.querySelector('#compose-view').style.display = 'none';
      
      // Show email
      let div = document.createElement('div');
      div.className = 'row';
      var div0 = document.createElement('div');
      div0.className = 'col-sm-12';
      var s = document.createElement('p');
      s.innerHTML = `From: ${email.sender}`;
      var r = document.createElement('p');
      r.innerHTML = `To: ${email.recipients}`;
      var sub = document.createElement('p');
      sub.innerHTML = `Subject: ${email.subject}`;
      var t = document.createElement('p');
      t.innerHTML = `Timestamp: ${email.timestamp}`;

      div.appendChild(div0)
      div0.appendChild(s);
      div0.appendChild(r);
      div0.appendChild(sub);
      div0.appendChild(t);

      let div0_1 = document.createElement('div');
      div0_1.className = 'row';
      div0_1.style.borderBottom = "thin solid";
      var div1 = document.createElement('div');
      div1.className = 'btn-group';
      var rp = document.createElement('button');
      rp.className = 'btn btn-primary rounded mr-1';
      rp.type = 'submit';
      rp.id = 'reply';
      rp.innerHTML = 'Reply';
      rp.style.margin = '1px 10px 20px 10px';

      div0_1.appendChild(div1);
      div1.appendChild(rp);

      let div2 = document.createElement('div');
      div2.className = 'row';
      var b = document.createElement('p');
      b.innerHTML = `${email.body}`;

      div2.appendChild(b);

      document.querySelector('#email-view').append(div);
      document.querySelector('#email-view').append(div0_1);
      document.querySelector('#email-view').append(div2);

      // Mark email as read
      read(email.id);

      // If reply clicked
      document.querySelector('#reply').addEventListener('click', function() {
        reply(email.id);
      }, false);
  });
}


function read(email_id) {
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
    })
  })
}


function archive(email_id) {
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    credentials: "same-origin",
    headers: {
      "X-CSRFToken": getCookie("csrftoken"),
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      read: false,
      archived: true,
    })
  })
  console.log('Archived email: ', email_id);
  load_mailbox('inbox');
}


function unarchive(email_id) {
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    credentials: "same-origin",
    headers: {
      "X-CSRFToken": getCookie("csrftoken"),
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      read: false,
      archived: false,
    })
  })
  console.log('Unarchived email: ', email_id);
  load_mailbox('inbox');
}


function reply(email_id) {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Pre-fill composition fields
  fetch(`/emails/${email_id}`, {
    method: 'GET',
  })
  .then(response => response.json())
  .then(email => {
      // Print email
      console.log(email);
      document.querySelector('#compose-recipients').value = `${email.sender}`;
      if ((email.subject).indexOf('Re:') != -1) {
        document.querySelector('#compose-subject').value = `${email.subject}`;
      } else {
        document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
      }
      document.querySelector('#compose-body').value = `"On ${email.timestamp} ${email.sender} wrote: ${email.body}"`;
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