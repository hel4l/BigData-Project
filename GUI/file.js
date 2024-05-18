let urlMapping = {};
let pageRankMapping = {};
let tfidfMapping = {};
let fileData = '';

window.onload = function () {
    fetch('url_mapping.txt')
        .then(response => response.text())
        .then(data => {
            const lines = data.split('\n');
            lines.forEach(line => {
                const [number, url] = line.split(': ');
                urlMapping[number] = url; // Convert to lowercase if needed
            });

            return fetch('page_rank.txt');
        })
        .then(response => response.text())
        .then(data => {
            const lines = data.split('\n');
            lines.forEach(line => {
                const [number, rank] = line.split('→');
                pageRankMapping[number] = parseFloat(rank);
            });

            return fetch('tfidf.txt');
        })
        .then(response => response.text())
        .then(data => {
            const lines = data.split('\n');
            lines.forEach(line => {
                const [number, tfidf] = line.split('→');
                tfidfMapping[number] = parseFloat(tfidf);
            });

            return fetch('Invert_Index.txt');
        })
        .then(response => response.text())
        .then(data => {
            fileData = data.toLowerCase(); // Convert to lowercase
        });

    const labels = document.querySelectorAll('label');
    labels.forEach(label => {
        label.addEventListener('click', function () {
            const divs = document.querySelectorAll('.cursor-pointer');
            divs.forEach(div => {
                div.classList.remove('selected');
            });

            this.parentNode.classList.add('selected');
        });
    });

    // Set the tfidf radio button's parent div as selected by default
    document.querySelector('input[value="tfidf"]').parentElement.parentElement.classList.add('selected');
}

document.getElementById('searchForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const results = document.getElementById('results');
    results.innerHTML = ''; // Clear previous results
    const searchInput = document.getElementById('searchInput');
    const searchQuery = searchInput.value.trim().toLowerCase();

    const words = searchQuery.split(' ');
    const numbers = new Set();
    const lines = fileData.split('\n');
    words.forEach(word => {
        lines.forEach(line => {
            if (line.includes(word)) {
                const regex = /→(\d+);/g;
                let match;
                while ((match = regex.exec(line)) !== null) {
                    numbers.add(match[1]);
                }
            }
        });
    });

    const searchType = document.querySelector('input[name="radio"]:checked').value;

    const listItems = [];
    numbers.forEach(number => {
        const li = document.createElement('li');
        li.classList.add('border', 'border-gray-300', 'rounded-md', 'p-4', 'mb-2', 'hover:shadow-md', 'bg-white');
        const a = document.createElement('a');
        a.href = urlMapping[number] || '#';
        a.textContent = urlMapping[number] || 'URL not found';

        li.appendChild(a);
        const rank = searchType === 'pageRank' ? pageRankMapping[number] : tfidfMapping[number];
        listItems.push({ li, rank: rank || 0 });
    });

    listItems.sort((a, b) => b.rank - a.rank);

    listItems.forEach(item => {
        results.appendChild(item.li);
    });

    if (results.children.length === 0) {
        const div = document.createElement('div');
        div.textContent = 'No results found';
        results.appendChild(div);
    }
});
