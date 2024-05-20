let urlMapping = {};
let pageRankMapping = {};
let tfidfMapping = {};
let invertIndexMapping = {};
let fileData = '';

window.onload = function () {
    fetchData('url_mapping.txt', urlMapping, ': ')
        .then(() => fetchData('page_rank.txt', pageRankMapping, '→', parseFloat))
        .then(() => fetchData('tfidf.txt', tfidfMapping, '→', parseFloat))
        .then(() => fetchInvertIndexData('Invert_Index.txt', invertIndexMapping))
        .then(() => fetch('Invert_Index.txt'))
        .then(response => response.text())
        .then(data => fileData = data.toLowerCase())
        .catch(error => console.error('Error loading data:', error));

    setupLabelClickHandlers();
    document.querySelector('input[value="invertIndex"]').parentElement.parentElement.classList.add('selected');
};

document.getElementById('searchForm').addEventListener('submit', function (event) {
    event.preventDefault();
    performSearch();
});

function fetchData(filename, mapping, delimiter, transform = v => v) {
    return fetch(filename)
        .then(response => response.text())
        .then(data => {
            data.split('\n').forEach(line => {
                const [key, value] = line.split(delimiter);
                if (key && value !== undefined) {
                    mapping[key.trim()] = transform(value.trim());
                }
            });
        });
}

function fetchInvertIndexData(filename, mapping) {
    return fetch(filename)
        .then(response => response.text())
        .then(data => {
            data.split('\n').forEach(line => {
                const [text, idsRanks] = line.split('\t');
                if (idsRanks) {
                    const parts = idsRanks.split(';');
                    parts.forEach(part => {
                        const [rank, id] = part.split('→').map(str => str.trim());
                        if (!isNaN(rank) && id) {
                            mapping[id] = parseFloat(rank);
                        }
                    });
                }
            });
        })
        .catch(error => console.error('Error parsing invert index data:', error));
}

function setupLabelClickHandlers() {
    document.querySelectorAll('label').forEach(label => {
        label.addEventListener('click', function () {
            document.querySelectorAll('.cursor-pointer').forEach(div => {
                div.classList.remove('selected');
            });
            this.parentNode.classList.add('selected');
        });
    });
}

function performSearch() {
    const results = document.getElementById('results');
    results.innerHTML = '';
    const searchQuery = document.getElementById('searchInput').value.trim().toLowerCase();
    const words = searchQuery.split(' ');

    const numbers = new Set();
    const ranks = {};

    fileData.split('\n').forEach(line => {
        words.forEach(word => {
            if (line.includes(word)) {
                const regex = /(\d+)→(\d+);/g;
                let match;
                while ((match = regex.exec(line)) !== null) {
                    const id = match[2];
                    const rank = parseFloat(match[1]);
                    if (!numbers.has(id)) {
                        numbers.add(id);
                        ranks[id] = rank;
                    } else {
                        ranks[id] += rank;
                    }
                }
            }
        });
    });

    const searchType = document.querySelector('input[name="radio"]:checked').value;
    const listItems = Array.from(numbers).map(number => {
        const li = document.createElement('li');
        li.classList.add('border', 'border-gray-300', 'rounded-md', 'p-4', 'mb-2', 'hover:shadow-md', 'bg-white');
        const a = document.createElement('a');
        a.href = urlMapping[number] || '#';
        a.textContent = urlMapping[number] || 'URL not found';
        li.appendChild(a);

        let rank;
        switch (searchType) {
            case 'pageRank':
                rank = pageRankMapping[number];
                break;
            case 'tfidf':
                rank = tfidfMapping[number];
                break;
            case 'invertIndex':
                rank = invertIndexMapping[number];
                break;
            default:
                rank = 0;
        }
        rank = ranks[number] || rank; // Update rank to aggregate rank if present

        console.log(`Number: ${number}, Rank: ${rank}`); // Debugging line
        return { li, rank: rank || 0 };
    });

    // Sort the list items in descending order based on rank
    listItems.sort((a, b) => b.rank - a.rank).forEach(item => {
        results.appendChild(item.li);
    });

    if (results.children.length === 0) {
        const div = document.createElement('div');
        div.textContent = 'No results found';
        results.appendChild(div);
    }
}
