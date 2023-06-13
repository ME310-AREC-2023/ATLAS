// Helper function to format date
function formatDate(date) {
    // Get the UTC offset in minutes
    const offsetMinutes = date.getTimezoneOffset();
    
    // Convert the offset to milliseconds
    const offsetMilliseconds = offsetMinutes * 60 * 1000;
    
    // Adjust the date by subtracting the offset
    const pstDate = new Date(date.getTime() - offsetMilliseconds);
    
    if (pstDate.toDateString() === new Date().toDateString()) {
      // If date is today, return the time
      return pstDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      // If date is not today, return formatted date
      const options = { day: '2-digit', month: 'short' };
      return pstDate.toLocaleDateString('en-US', options);
    }
}

let emailID = "";
let resolvedCurrent = 0;
let highlightedItemId = null;

document.addEventListener('DOMContentLoaded', (event) => {
    function fetchData() {
        fetch('FeedbackFetch.php')
        .then(response => response.json())
        .then(data => {
            let preSet = [];
            let complaints = [];

            let currentDate = new Date();
            currentDate.setMinutes(currentDate.getMinutes() - currentDate.getTimezoneOffset()); // Convert to UTC
        
            data.forEach(record => {
                complaints.push(record);
            });

            preSet.sort((a, b) => {
                return new Date(b.time) - new Date(a.time);
            });

            complaints.sort((a, b) => {
                return new Date(b.time) - new Date(a.time);
            });

            document.querySelector('#preSet').innerHTML = ''; // Clear the existing list
            document.querySelector('#complaints').innerHTML = ''; // Clear the existing list

            // Store the number of list items
            preSet.forEach(record => {
                let date = new Date(record.time);
                let displayTime = formatDate(date);
                let resolvedStatus = record.resolved == 1 ? '' : 'bold'; // Apply bold font if unresolved
                //let backgroundColor = record.resolved == 1 ? '' : 'background-color: white;'; // Apply white background if unresolved
                let dotIcon = record.resolved == 1 ? '' : '<span class="dot"></span>'; // Add blue circular dot if unresolved
                let item = `<li id="${record.id}" class="thread" style="padding-top: 25px;" onclick="updateAlertDetail('${record.name}', '${displayTime}', '${record.email}', '${record.type}', '${record.immediacy}', '${record.subject}', '${record.resolved}'); highlightItem(this)"><div style="display: flex; justify-content: space-between;"><span class="time">${dotIcon}${displayTime}</span><span class="title" style="font-weight: ${resolvedStatus}">${record.immediacy}</span><span class="title"><strong>${record.type}</strong></span></div></li>`;
                document.querySelector('#complaints').innerHTML += item;
            });

            complaints.forEach(record => {
                let date = new Date(record.time);
                let displayTime = formatDate(date);
                let resolvedStatus = record.resolved == 1 ? '' : 'bold'; // Apply bold font if unresolved
                //let backgroundColor = record.resolved == 1 ? '' : 'background-color: white;'; // Apply white background if unresolved
                let dotIcon = record.resolved == 1 ? '' : '<span class="dot"></span>'; // Add blue circular dot if unresolved
                let item = `<li id="${record.id}" class="thread" style="padding-top: 25px;" onclick="updateAlertDetail('${record.name}', '${displayTime}', '${record.email}', '${record.type}', '${record.immediacy}', '${record.subject}', '${record.resolved}'); highlightItem(this)"><div style="display: flex; justify-content: space-between;"><span class="time">${dotIcon}${displayTime}</span><span class="title" style="font-weight: ${resolvedStatus}">${record.immediacy}</span><span class="title"><strong>${record.type}</strong></span></div></li>`;
                document.querySelector('#complaints').innerHTML += item;
            });

            if (highlightedItemId) {
                let item = document.getElementById(highlightedItemId);
                if (item) {
                    item.style.backgroundColor = '#ffce92';
                }
            }

            // Store the number of list items
            const numberOfPreSets = preSet.length;
            const numberOfComplaints = complaints.length;

            // Use this value in the HTML
            const PreSetCountElements = document.querySelectorAll('.preSet-list-count');
            PreSetCountElements.forEach(element => {
                element.textContent = numberOfPreSets;
            });
            const ComplaintsCountElements = document.querySelectorAll('.complaints-list-count');
            ComplaintsCountElements.forEach(element => {
                element.textContent = numberOfComplaints;
            });
            const CombinedCountElements = document.querySelectorAll('.combined-list-count');
            CombinedCountElements.forEach(element => {
                element.textContent = numberOfComplaints+numberOfPreSets;
            });

            const topItem = document.querySelector('#complaints li:first-child');
            if(topItem) {
                const itemId = topItem.getAttribute('id');
                const itemRecord = complaints.find(record => record.id === itemId) || preSet.find(record => record.id === itemId);
                if(itemRecord) {
                    const displayTime = formatDate(new Date(itemRecord.time));
                    updateAlertDetail(itemRecord.name, displayTime, itemRecord.email, itemRecord.type, itemRecord.immediacy, itemRecord.subject);
                    highlightItem(topItem);
                }
            }
        })
        .catch(error => console.error('Error:', error));
    }

    fetchData();
    setInterval(fetchData, 60000);  // Fetch new data every 60 seconds
});

function highlightItem(item) {
    highlightedItemId = item.id;
    let allItems = document.querySelectorAll('.thread');
    allItems.forEach((item) => item.style.backgroundColor = '');
    item.style.backgroundColor = '#ffce92';
}

function updateAlertDetail(name, time, email, type, immediacy, subject, resolved) {
    let alertDiv = document.querySelector('#Alerts-1');
    let alertSpans = alertDiv.querySelectorAll('span');

    alertSpans[0].textContent = time; // assuming this is the first span
    alertSpans[1].textContent = immediacy; // assuming this is the second span
    alertSpans[2].textContent = type; // assuming this is the third span 

    emailID = email;
    resolvedCurrent = resolved;
    let alertParagraph = document.querySelector('#alertDetails');
    alertParagraph.innerHTML = `${time}<br><br>${name} - ${email}<br><br>${type} - ${immediacy}<br><br>${subject}`;
    const markResolvedButton = document.querySelector('#markResolvedButton');
    markResolvedButton.textContent = resolvedCurrent == 1 ? 'Mark as Unresolved' : 'Mark as Resolved';
}

function toggleResolved() {
    resolvedCurrent = resolvedCurrent == 0 ? 1 : 0;

    fetch('SendResolvedMessage.php', {
        method: 'POST', // or 'GET'
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: highlightedItemId, resolved: resolvedCurrent }), // send the record data to the server
    })
  
    // Update the button text based on resolved status
    const markResolvedButton = document.querySelector('#markResolvedButton');
    markResolvedButton.textContent = resolvedCurrent == 1 ? 'Mark as Unresolved' : 'Mark as Resolved';
}

function reply() {
  const subject = "Reply to Request | myHive BIOME";
  const body = "Enter your reply message here";

  const mailtoLink = `mailto:${emailID}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  // Open the user's email client
  window.location.href = mailtoLink;
}
