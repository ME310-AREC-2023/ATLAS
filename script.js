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

let recordLocation = "";
let recordDuration = "";
let recordStartTime = "";
let displayTimeUpdate = "";
let recordSeverity = "";

// Selected tab within Alerts-1
let selectedTab = 'bVOC'; // Default value

function selectTab(tabName) {
    selectedTab = tabName;
    updateAlertDetail(tabName);
}


document.addEventListener('DOMContentLoaded', (event) => {
    function fetchData() {
        fetch('AlertFetch.php')
        .then(response => response.json())
        .then(data => {
            let urgentAlerts = [];
            let warnings = [];
            let pastAlerts = [];

            let currentDate = new Date();
            currentDate.setMinutes(currentDate.getMinutes() - currentDate.getTimezoneOffset()); // Convert to UTC
        
            data.forEach(record => {
                let recordDate = new Date(record.time);
                if (recordDate < currentDate) {
                    pastAlerts.push(record);
                } else if (parseInt(record.severity) > 20) {
                    urgentAlerts.push(record);
                } else {
                    warnings.push(record);
                }
            });

            urgentAlerts.sort((a, b) => {
                return new Date(b.time) - new Date(a.time);
            });

            warnings.sort((a, b) => {
                return new Date(b.time) - new Date(a.time);
            });

            pastAlerts.sort((a, b) => {
                return new Date(b.time) - new Date(a.time);
            });

            document.querySelector('#urgentList').innerHTML = ''; // Clear the existing list
            document.querySelector('#warningList').innerHTML = ''; // Clear the existing list
            document.querySelector('#pastAlertsList').innerHTML = ''; // Clear the existing list

            // Store the number of list items
            urgentAlerts.forEach(record => {
                let date = new Date(record.time);
                let displayTime = formatDate(date);
                let item = `<li id="${record.type}_${record.time}" class="thread" style="padding-top: 25px;" onclick="updateAlertDetail('${selectedTab}', '${record.location}', '${displayTime}', '${record.time}', '${record.duration}', '${record.severity}'); highlightItem(this, '${record.type}')"><div style="display: flex; justify-content: space-between;"><span class="time">${displayTime}</span><span class="title">${record.location}</span><span class="title"><strong>${record.severity}</strong></span></div></li>`;
                document.querySelector('#urgentList').innerHTML += item;
            });

            warnings.forEach(record => {
                let date = new Date(record.time);
                let displayTime = formatDate(date);
                let item = `<li id="${record.type}_${record.time}" class="thread" style="padding-top: 25px;" onclick="updateAlertDetail('${selectedTab}', '${record.location}', '${displayTime}', '${record.time}', '${record.duration}'); highlightItem(this, '${record.type}')"><div style="display: flex; justify-content: space-between;"><span class="time">${displayTime}</span><span class="title">${record.location}</span><span class="title"><strong>${record.severity}</strong></span></div></li>`;
                document.querySelector('#warningList').innerHTML += item;
            });

            pastAlerts.forEach(record => {
                let date = new Date(record.time);
                let displayTime = formatDate(date);
                let item = `<li id="${record.type}_${record.time}" class="thread" style="padding-top: 25px;" onclick="updateAlertDetail('${selectedTab}', '${record.location}', '${displayTime}', '${record.time}', '${record.duration}', '${record.severity}'); highlightItem(this, '${record.type}')"><div style="display: flex; justify-content: space-between;"><span class="time">${displayTime}</span><span class="title">${record.location}</span><span class="title"><strong>${record.severity}</strong></span></div></li>`;
                document.querySelector('#pastAlertsList').innerHTML += item;
            });

            if (highlightedItemId) {
                let item = document.getElementById(highlightedItemId);
                if (item) {
                    item.style.backgroundColor = '#ffce92';
                }
            }

            // Store the number of list items
            const numberOfUrgentAlerts = urgentAlerts.length;
            const numberOfWarnings = warnings.length;

            // Use this value in the HTML
            const UrgentCountElements = document.querySelectorAll('.urgent-list-count');
            UrgentCountElements.forEach(element => {
                element.textContent = numberOfUrgentAlerts;
            });
            const WarningCountElements = document.querySelectorAll('.warning-list-count');
            WarningCountElements.forEach(element => {
                element.textContent = numberOfWarnings;
            });
        })
        .catch(error => console.error('Error:', error));
    }

    fetchData();
    setInterval(fetchData, 300000);  // Fetch new data every 5 mins / 300 seconds

    // Change ventilation

    let increaseVentButton = document.getElementById("increaseVentButton");
    let decreaseVentButton = document.getElementById("decreaseVentButton");
    let ventilationCapacity = document.getElementById("ventilationCapacity");

    increaseVentButton.addEventListener("click", function() {
        let currentVal = parseInt(ventilationCapacity.textContent);
        if (currentVal < 100) {
            ventilationCapacity.textContent = (currentVal + 1) + '%';
        }
    });

    decreaseVentButton.addEventListener("click", function() {
        let currentVal = parseInt(ventilationCapacity.textContent);
        if (currentVal > 0) {
            ventilationCapacity.textContent = (currentVal - 1) + '%';
        }
    });

    // Change temperature

    let increaseTempButton = document.getElementById("increaseTempButton");
    let decreaseTempButton = document.getElementById("decreaseTempButton");
    let tempCapacity = document.getElementById("setTemp");

    increaseTempButton.addEventListener("click", function() {
        let currentVal = parseInt(tempCapacity.textContent);
        if (currentVal < 100) {
            tempCapacity.textContent = (currentVal + 1) + '˚C';
        }
    });

    decreaseTempButton.addEventListener("click", function() {
        let currentVal = parseInt(tempCapacity.textContent);
        if (currentVal > 0) {
            tempCapacity.textContent = (currentVal - 1) + '˚C';
        }
    });

    // Change RH

    let increaseRHButton = document.getElementById("increaseRHButton");
    let decreaseRHButton = document.getElementById("decreaseRHButton");
    let rhCapacity = document.getElementById("setRH");

    increaseRHButton.addEventListener("click", function() {
        let currentVal = parseInt(rhCapacity.textContent);
        if (currentVal < 100) {
            rhCapacity.textContent = (currentVal + 1) + '%';
        }
    });

    decreaseRHButton.addEventListener("click", function() {
        let currentVal = parseInt(rhCapacity.textContent);
        if (currentVal > 0) {
            rhCapacity.textContent = (currentVal - 1) + '%';
        }
    });

    // Update button to appear when other buttons are clicked
    let settingsChanged = false;
    let buttons = document.querySelectorAll('.btn');
    let checkbox = document.querySelector('input[type="checkbox"]');
    let saveSettingsButton = document.getElementById('saveSettings');

    buttons.forEach((button) => {
        button.addEventListener('click', () => {
            settingsChanged = true;
            saveSettingsButton.style.display = settingsChanged ? 'inline-block' : 'none';
            saveSettingsButton.innerText = 'Update Changes';
            saveSettingsButton.disabled = false;
        });
    });

    checkbox.addEventListener('change', () => {
        settingsChanged = true;
        saveSettingsButton.style.display = settingsChanged ? 'inline-block' : 'none';
        saveSettingsButton.innerText = 'Update Changes';
        saveSettingsButton.disabled = false;
    });

    saveSettingsButton.addEventListener('click', (event) => {
        event.preventDefault();
        saveSettingsButton.innerText = 'Update Sent!';
        saveSettingsButton.disabled = true;
    });

});

let highlightedItemId = null;

function highlightItem(item, type) {
    highlightedItemId = item.id;
    let allItems = document.querySelectorAll('.thread');
    allItems.forEach((item) => item.style.backgroundColor = '');
    item.style.backgroundColor = '#ffce92';

    // Split the record type into components
    const components = type.split(" ");

    // Hide all badges within the tabs
    document.querySelectorAll('#parameterDropdown .badge').forEach(badge => badge.style.visibility = 'hidden');

    // Show the badge corresponding to each component
    components.forEach(component => {
        const badges = document.querySelectorAll(`#parameterDropdown .badge-${component}`);
        badges.forEach(badge => badge.style.visibility = 'visible');
    });
}
  
function updateAlertDetail(type, location = recordLocation, displayTime = displayTimeUpdate, startTime = recordStartTime, duration = recordDuration, severity = recordSeverity) {
    let alertDiv = document.querySelector('#Alerts-1');
    let alertSpans = alertDiv.querySelectorAll('span');

    recordLocation = location;
    recordStartTime = startTime;
    recordDuration = duration;
    displayTimeUpdate = displayTime;
    recordSeverity = severity;
    let timeInterval = 3;

    alertSpans[0].textContent = displayTimeUpdate; // assuming this is the first span
    alertSpans[1].textContent = recordSeverity; // assuming this is the second span
    alertSpans[2].textContent = recordLocation; // assuming this is the third span

    const [datePart, timePart] = recordStartTime.split(' ');
    const [year, month, day] = datePart.split('-');
    const [hours, minutes, seconds] = timePart.split(':');
    
    const recordTime = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));
    const durationMilliseconds = recordDuration * 1000; // Convert duration to milliseconds
    const newTimeMilliseconds = recordTime.getTime() + durationMilliseconds;
    const newTime = new Date(newTimeMilliseconds);
    // const newTime = new Date(); // Get the current time

    // Time Interval Logic:

    if(recordDuration <= 540) {                                         // Duration less than 9 minutes
        timeInterval = 3;                                               // 3 seconds
    } else if(recordDuration > 540 && recordDuration <= 10800) {        // Duration between 9 minutes and 3 hrs
        timeInterval = recordDuration/180;                              // D/180
        timeInterval = parseFloat(timeInterval).toFixed(0);
    } else {                                                            // Duration above 3 hrs
        timeInterval = 60;                                              // 60 seconds
    }

    fetch('InfluxFetch.php', {
        method: 'POST', // or 'GET'
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: type, location: recordLocation, startTime: recordTime.toISOString(), endTime: newTime.toISOString(), timeInterval: timeInterval }), // send the record data to the server
    })
    .then(response => response.json())
    .then(data => {
        const records = data[0].records;
        
        // Extract x-axis values (_time) and y-axis values (_value) from the records
        const xValues = records.map(record => record.values._time);
        const yValues = records.map(record => record.values._value);

        // Clear existing chart if any
        d3.select('#scatterplot').selectAll('*').remove();
        const scatterplotContainer = d3.select('#scatterplot');

        // Define the dimensions of the SVG element and the margins
        const margin = { top: 20, right: 20, bottom: 40, left: 40 };
        const width = 600 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        // Create the SVG element
        const svg = scatterplotContainer.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left+6},${margin.top})`);

        // Parse the date-time strings into Date objects
        const parseDate = d3.utcParse('%Y-%m-%dT%H:%M:%SZ');
        const parsedXValues = xValues.map((d) => parseDate(d));

        // Define the x scale with the parsed dates
        const xScale = d3.scaleTime()
            .domain(d3.extent(parsedXValues)) // Assuming xValues is an array of date-time strings
            .range([0, width]);

        if(type === "humidity")
            maxyValue = 100;
        else if(type === "temp")
            maxyValue = 40;
        else
            maxyValue = d3.max(yValues);

        const yScale = d3.scaleLinear()
            .domain([0, maxyValue]) // Assuming yValues is an array of numerical values
            .range([height, 0]);    

        // Define the x and y axes
        const xAxis = d3.axisBottom(xScale)
            .tickFormat(d3.timeFormat('%H:%M'));
        const yAxis = d3.axisLeft(yScale);

        // Append the x axis
        svg.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(xAxis);

        // Append the y axis
        svg.append('g')
        .call(yAxis);

        // Set axis styles
        svg
        .append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${height})`)
        .style("color", "#000000") // Set the color to black
        .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat('%H:%M')))


        svg
        .append("g")
        .attr("class", "y-axis")
        .style("color", "#000000") // Set the color to black
        .call(d3.axisLeft(yScale));

        // Set label styles
        svg
        .append("text")
        .attr("class", "x-label")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 3)
        .style("text-anchor", "middle")
        .style("fill", "#000000") // Set the color to black
        .text("Time");

        svg
        .append("text")
        .attr("class", "y-label")
        .attr("x", -height/2)
        .attr("y", -35)
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "middle")
        .style("fill", "#000000") // Set the color to black
        .text(type);

        // Define the threshold values
        const thresholds = {
            eCO2: { min: 0, max: 1100 },
            temp: { min: 16, max: 28 },
            humidity: { min: 30, max: 50 },
            bVOC: { min: 0, max: 2.2 },
            iaq: { min: 0, max: 110 },
        };
  
    // Get the thresholds for the specific type
    const typeThresholds = thresholds[type];

    if (typeThresholds) {
      // Add a line for the minimum threshold
      svg
        .append('line')
        .attr('class', 'threshold-line')
        .attr('x1', 0)
        .attr('y1', yScale(typeThresholds.min))
        .attr('x2', width)
        .attr('y2', yScale(typeThresholds.min))
        .style('stroke', 'red')
        .style('stroke-dasharray', '2,2');

      // Add a line for the maximum threshold if it exists
      if (typeThresholds.max !== undefined) {
        svg
          .append('line')
          .attr('class', 'threshold-line')
          .attr('x1', 0)
          .attr('y1', yScale(typeThresholds.max))
          .attr('x2', width)
          .attr('y2', yScale(typeThresholds.max))
          .style('stroke', 'red')
          .style('stroke-dasharray', '2,2');
      }

      const yStart = yScale(typeThresholds.min);
      const yEnd = yScale(typeThresholds.max);
      // Add the shaded region
      svg
      .append('rect')
      .attr('class', 'threshold-shade')
      .attr('x', 0)
      .attr('y', yEnd)
      .attr('width', width)
      .attr('height', yStart - yEnd)
      .style('fill', '#4fae6091');
    
    }

    // Create a div for the tooltip
    const tooltip = d3.select('#scatterplot')
        .append('div')
        .style('position', 'absolute')
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "rgb(255,255,255,0.5)")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px")

    // Color the data points based on the thresholds
    const circles = svg.selectAll('dot')
      .data(parsedXValues)
      .enter()
      .append('circle')
      .attr("class", "myCircle")
      .attr('cx', (d) => xScale(d))
      .attr('cy', (d, i) => yScale(yValues[i]))
      .attr('r', 5)
      .attr('fill', (d, i) => {
        const value = yValues[i];
        if (value > typeThresholds.max || value < typeThresholds.min) {
            return 'red';
        }
        else {
            return 'steelblue';
        }
      })
        // Add event handlers for the tooltip
        .on('mouseover', (event, d) => {
            tooltip.style('opacity', 1);
        })
        .on('mousemove', (event, d, i) => {
            const k = parsedXValues.indexOf(d);
            const dateFormat = d3.timeFormat('%H:%M:%S');
            const dateDisplay = dateFormat(d);
            const [x, y] = d3.pointer(event, svg.node());
            tooltip.html(`Time: ${dateDisplay}<br>Value: ${parseFloat(yValues[k]).toFixed(2)}`)
                .style('top', (y+100) + 'px')
                .style('left', (x+70) + 'px');
        })
        .on('mouseout', (event, d) => {
            tooltip.style('opacity', 0);
        });

    // Define the line generator function
    const line = d3.line()
    .x((d, i) => xScale(d))
    .y((d, i) => yScale(yValues[i]));

    // Remove the circles
    //svg.selectAll('circle').remove();

    // Append lines for each pair of points
    for (let i = 1; i < parsedXValues.length; i++) {
        const value1 = yValues[i-1];
        const value2 = yValues[i];
        let color = 'steelblue';

        // Determine the color of the line
        if (value1 > typeThresholds.max || value1 < typeThresholds.min || value2 > typeThresholds.max || value2 < typeThresholds.min) {
            color = 'red';
        }

        svg.append('line')
            .attr('x1', xScale(parsedXValues[i-1]))
            .attr('y1', yScale(value1))
            .attr('x2', xScale(parsedXValues[i]))
            .attr('y2', yScale(value2))
            .style('stroke', color)
            .style('stroke-width', 2);
    }

    })
    .catch((error) => {
    console.error('Error:', error);
    });
}
  
// MQTT to send alert to sensor box!

// Connect to the MQTT broker
const client = mqtt.connect('ws://192.168.10.103:9001');

client.on('connect', () => {
  console.log('connected to MQTT broker');

  document.getElementById('saveSettings').addEventListener('click', function () {
    // get the checkbox
    const checkbox = document.querySelector('input[type="checkbox"]');

    // Get the last part of recordLocation
    const recordLocationParts = recordLocation.split('/');
    const location = recordLocationParts[recordLocationParts.length - 1];

    let message = {
        "effect": "Fast Pulse",
        "state": checkbox.checked ? "ON" : "OFF",  // Send "ON" if checked, else "OFF"
        "brightness": 255,
        "color": {
            "r": 255,
            "g": 0,
            "b": 0
        }
    };

    let client = mqtt.connect('ws://192.168.10.103:9001');  // replace 9001 with your port if different

    client.on('connect', function () {
        console.log('Connected to MQTT broker');
        // Use location in the MQTT topic
        client.publish(`lights/${location}/upper-ring`, JSON.stringify(message));
        client.publish(`lights/${location}/lower-ring`, JSON.stringify(message));
        console.log('Message sent');
        client.end();  // Close connection after sending the message
    });
});

});

client.on('error', (err) => {
  console.error('Failed to connect to MQTT broker:', err);
});
