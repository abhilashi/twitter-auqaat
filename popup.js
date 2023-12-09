// In popup.js

function isHandleInList(handle, list) {
    const listItems = list.getElementsByTagName('li');
    for (let item of listItems) {
        if (item.textContent.startsWith(handle)) {
            return true; // Handle found in the list
        }
    }
    return false; // Handle not found in the list
}

function addButtonsToListItem(listItem) {
    // Create plus button
    var plusButton = document.createElement('button');
    plusButton.textContent = '+';
    plusButton.onclick = function() { 
        console.log("clicked plus button");
        adjustAukaat(listItem, 3); 
    }; // Increment

    // Create minus button
    var minusButton = document.createElement('button');
    minusButton.textContent = '-';
    minusButton.onclick = function() { adjustAukaat(listItem, -3); }; // Decrement

    // Append buttons to list item
    listItem.appendChild(plusButton);
    listItem.appendChild(minusButton);
}

function addHandleToList(handle) {
    var list = document.getElementById('handlesList');

    if (!isHandleInList(handle, list)) {
        var listItem = document.createElement('li');

        /*
        chrome.storage.local.get(handle, function(result) {
            let stored = result.aukaat || {};
            console.log("Aukaat fetched");
        });*/
        listItem.textContent = handle + ": 15"; // Initial value

        addButtonsToListItem(listItem);
        // Append list item to list
        list.appendChild(listItem);
    }
}


function adjustAukaat(listItem, adjustment) {
    var parts = listItem.textContent.split(": ");
    var currentAukaat = parseInt(parts[1], 10);
    var newAukaat = currentAukaat + adjustment;

    console.log("adjustAukaat function called");

    listItem.textContent = parts[0] + ": " + newAukaat;

    console.log("sending message to adjustAukaat");
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, 
            {action: "AdjustAukaat", data: {"handle": parts[0], "aukaat": newAukaat}}
        );
    });

    // chrome.runtime.sendMessage({ type: "AdjustAukaat", data: parts[0]});
    addButtonsToListItem(listItem);
}

document.getElementById('loserButton').addEventListener('click', function() {
    // Initialize an empty array to hold the formatted loser data
    let losersData = [];

    // Fetch the list of losers from Gun DB
    // Replace with your actual Gun DB instance URL
    var gun = Gun('https://gun-manhattan.herokuapp.com/gun');
    var loserBoard = gun.get('loserBoard');

    loserBoard.map().once(function(data, username) {
        // Check if the data is valid and has the required properties
        if (data && data.username && data.aukaat) {
            losersData.push(`${data.username}: ${data.aukaat}`);
        }

        // Display the list in an alert dialog
        if (losersData.length > 0) {
            alert('Losers:\n' + losersData.join('\n'));
        } else {
            alert('No losers found.');
        }
    });
});

/* 
document.getElementById('broadcastButton').addEventListener('click', () => {
    const channel = 'aukaat'; // Set your channel
    const message = document.getElementById('messageInput').value;

    chrome.runtime.sendMessage({
        action: "sendMessage",
        channel: channel,
        message: message
    }, function(response) {
        console.log(response.status);
    });
});
*/


// Example usage
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.type === "AddHandleToPopup") {
        console.log("message type AddHandleToPopup received");
        addHandleToList(message.data);
    }
});

