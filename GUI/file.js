// Create a new Map
let urlMap = new Map();
let invertIndexMap = new Map();
let tfidfScoresMap = new Map();
let pageRankMap = new Map();
let pagemapping = {};
// Fetch the data from url_mapping.txt
fetch('url_mapping.txt')
    .then(response => response.text())
    .then(data => {
        // Split the data into lines
        let lines = data.split('\n');
        // Process each line
        for (let line of lines) {
            // Split the line into link ID and URL
            let [linkId, url] = line.split(': ');
            // Add to the map
            urlMap.set(linkId, url);
        }
        // Print the map
        console.log(urlMap);
    })
    .then(() => {
        // Fetch the data from Invert_Index.txt
        return fetch('Invert_Index.txt')
            .then(response => response.text())
            .then(data => {
                // Split the data into lines
                let lines = data.split('\n');
                // Process each line
                for (let line of lines) {
                    // Check if line contains a tab
                    if (line.includes('\t')) {
                        // Split the line into word and its associated ids and values
                        let [word, idsAndValues] = line.split('\t');
                        // Check if idsAndValues is defined before trying to split it
                        if (idsAndValues) {
                            // Split ids and values into separate entities
                            let idsAndValuesMap = new Map();
                            idsAndValues.split(';').forEach(idAndValue => {
                                // Check if idAndValue contains '→' before trying to split it
                                if (idAndValue.includes('→')) {
                                    let [value, id] = idAndValue.split('→');
                                    idsAndValuesMap.set(id, value);
                                }
                            });
                            // Add to the map
                            invertIndexMap.set(word, idsAndValuesMap);
                        }
                    }
                }
                // Print the map
                console.log(invertIndexMap);
            });
    })
    .then(() => {
        // Fetch the data from tfidf_scores.txt
        return fetch('tfidf_scores.txt')
            .then(response => response.text())
            .then(data => {
                // Check if data is defined before trying to split it
                if (data) {
                    // Split the data into lines
                    let lines = data.split('\n');
                    // Process each line
                    for (let line of lines) {
                        // Split the line into word and its associated ids and values
                        let [word, idsAndValues] = line.split(' → ');
                        // Check if idsAndValues is defined before trying to split it
                        if (idsAndValues) {
                            // Split ids and values into separate entities
                            let idsAndValuesMap = new Map();
                            idsAndValues.split(';').forEach(idAndValue => {
                                let [id, value] = idAndValue.split(':');
                                idsAndValuesMap.set(id, parseFloat(value));
                            });
                            // Add to the map
                            tfidfScoresMap.set(word, idsAndValuesMap);
                        }
                    }
                    // Print the map
                    console.log(tfidfScoresMap);
                }
            });
    })
    .then(() => {
        // Create a new Map that is a copy of tfidfScoresMap
        for (let [key, value] of tfidfScoresMap) {
            pageRankMap.set(key, new Map(value));
        }

        // Fetch the data from page_rank.txt
        return fetch('page_rank.txt')
            .then(response => response.text())
            .then(data => {
                // Split the data into lines
                let lines = data.split('\n');
                // Process each line
                for (let line of lines) {
                    // Split the line into id and its associated value
                    let [id, value] = line.split('→');
                    pagemapping[id] = value;
                }
                //loop throw pageRankMap and update the values
                for (let [word, idsAndValues] of pageRankMap) {
                    for (let [id, value] of idsAndValues) {
                        // Check if id is in pagemapping
                        if (pagemapping[id]) {
                            // Update the value
                            idsAndValues.set(id, parseFloat(pagemapping[id]));
                        }
                    }
                }

                // Print the map
                console.log(pageRankMap);
            });
    })
    .catch((error) => {
        console.error('Error:', error);
    });


// Initialize a variable to store the selected label's value
let selectedLabelValue = 'invertIndex';

// Get all radio buttons
const radioButtons = document.querySelectorAll('input[type="radio"][name="radio"]');

// Add event listener to each radio button
radioButtons.forEach(radio => {
    radio.addEventListener('change', function() {
        // Reset all labels' background color
        radioButtons.forEach(r => {
            r.parentElement.classList.remove('bg-gray-500');
            r.parentElement.classList.add('bg-gray-300');
        });

        // Change the selected radio button's parent label background color
        if (this.checked) {
            this.parentElement.classList.remove('bg-gray-300');
            this.parentElement.classList.add('bg-gray-500');

            // Store the selected label's value in the variable
            selectedLabelValue = this.value;
        }
    });
});
//checked

// search-form element
const searchForm = document.getElementById('search-form');

// Add event listener to the search form
searchForm.addEventListener('submit', function(event) {
    // Prevent the default form submission
    event.preventDefault();

    // Get the search query from the input field
    const searchQuery = document.getElementById('search-query').value;
    console.log(searchQuery);
    console.log(selectedLabelValue);
    // Get the search results
    const searchResults = getSearchResults(searchQuery, selectedLabelValue);

    // Display the search results
    displaySearchResults(searchResults);
}); // Added closing parenthesis here

// Function to get search results

function getSearchResults(searchQuery, searchType) {
    // splite the search query into words
    const words = searchQuery.split(' ');

    // make variable to store the search results id and score
    let searchResults = new Map();

    // loop throw the words
    // check the search type if it is tfidf or page rank or inverted index
    // get the search results and store it in the searchResults variable

    if (searchType === 'tfidf') {
        for (let word of words) {
            if (tfidfScoresMap.has(word)) {
                for (let [id, value] of tfidfScoresMap.get(word)) {
                    if (searchResults.has(id)) {
                        searchResults.set(id, searchResults.get(id) + value);
                    } else {
                        searchResults.set(id, value);
                    }
                }
            }
        }
    } else if (searchType === 'pagerank') {
        for (let word of words) {
            if (pageRankMap.has(word)) {
                for (let [id, value] of pageRankMap.get(word)) {
                    if (searchResults.has(id)) {
                        searchResults.set(id, searchResults.get(id) + value);
                    } else {
                        searchResults.set(id, value);
                    }
                }
            }
        }
    } else if (searchType === 'invertIndex') {
        for (let word of words) {
            if (invertIndexMap.has(word)) {
                for (let [id, value] of invertIndexMap.get(word)) {
                    if (searchResults.has(id)) {
                        searchResults.set(id, searchResults.get(id) + value);
                    } else {
                        searchResults.set(id, value);
                    }
                }
            }
        }
    }

    // sort the search results by score
    searchResults = new Map([...searchResults.entries()].sort((a, b) => b[1] - a[1]));

    return searchResults;
}

// Function to display search results

function displaySearchResults(searchResults) {
    const searchResultsContainer = document.getElementById('search-results');

    if(searchResultsContainer) {
        searchResultsContainer.innerHTML = '';

        if (searchResults.size === 0) {
            const paragraph = document.createElement('p');
            paragraph.textContent = 'No results found';
            searchResultsContainer.appendChild(paragraph);
        } else {
            for (let [id, score] of searchResults) {
                const div = document.createElement('div');
                div.setAttribute('class', 'border border-gray-300 p-4 my-4');

                const heading = document.createElement('h2');
                heading.setAttribute('class', 'text-xl font-semibold');
                heading.textContent = urlMap.get(id);
                div.appendChild(heading);

                const paragraph = document.createElement('p');
                paragraph.textContent = `Score: ${score}`;
                div.appendChild(paragraph);

                searchResultsContainer.appendChild(div);
            }
        }
    } else {
        console.error("Element with id 'search-results' not found");
    }
}
