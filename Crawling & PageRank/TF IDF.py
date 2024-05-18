import math

def parse_inverted_index(filename):
    """
    This function parses an inverted index file and creates a dictionary for TF-IDF calculation.

    Args:
        filename: Path to the inverted index text file.

    Returns:
        A dictionary where the key is a word and the value is another dictionary containing page numbers as keys and occurrence counts as values.
    """
    inverted_index = {}
    with open(filename, 'r', encoding="utf-8") as f:
        for line in f:
            word, data = line.strip().split()

            inverted_index[word] = {}

            for occurrence_data in data.split(';'):
                if occurrence_data == '':
                    continue
                count, page_num = occurrence_data.strip().split('→')
                page_num = int(page_num)
                count = int(count)

                inverted_index[word][page_num] = count

    return inverted_index

def parse_word_count_per_page(filename):
    """
    This function parses a word count per page file and creates a dictionary for TF-IDF calculation.

    Args:
        filename: Path to the word count per page text file.

    Returns:
        A dictionary where the key is the page number and the value is the total word count on that page.
    """
    word_counts = {}
    with open(filename, 'r', encoding="utf-8") as f:
        for line in f:
            page_num, total_words = line.strip().split('→')
            page_num = int(page_num)
            total_words = int(total_words)
            word_counts[page_num] = total_words

    return word_counts

def calculate_tfidf(inverted_index, word_counts):
    """
    This function calculates TF-IDF scores for each word in the inverted index.

    Args:
        inverted_index: A dictionary where the key is a word and the value is another dictionary containing page numbers as keys and occurrence counts as values.
        word_counts: A dictionary where the key is the page number and the value is the total word count on that page.

    Returns:
        A dictionary where the key is a word and the value is another dictionary containing page numbers as keys and TF-IDF scores as values.
    """
    tfidf_scores = {}

    for word, page_data in inverted_index.items():
        tfidf_scores[word] = {}
        document_frequency = len(page_data)

        idf = math.log(10000 / document_frequency) + 1  # IDF calculation

        for page_num, count in page_data.items():
            total_words = word_counts.get(page_num, 0)
            tf = count / total_words if total_words > 0 else 0

            tfidf = tf * idf
            tfidf_scores[word][page_num] = tfidf

    return tfidf_scores

def save_tfidf_to_file(tfidf_scores, filename):
    """
    This function saves the TF-IDF scores to a text file in the specified format.

    Args:
        tfidf_scores: A dictionary where the key is a word and the value is another dictionary containing page numbers as keys and TF-IDF scores as values.
        filename: Path to the output text file.
    """
    with open(filename, 'w', encoding="utf-8") as f:
        for word, page_scores in tfidf_scores.items():
            scores = ';'.join([f"{page_num}:{score:.6f}" for page_num, score in page_scores.items()])
            f.write(f"{word} → {scores};\n")

# Example usage
word_counts = parse_word_count_per_page("S:\\project\\word_counts.txt")
inverted_index = parse_inverted_index("S:\\project\\file.txt")
tfidf_scores = calculate_tfidf(inverted_index, word_counts)

save_tfidf_to_file(tfidf_scores, "S:\\project\\tfidf_scores.txt")

# Access data
""" word = "academy"
if word in tfidf_scores:
    for page_num, score in tfidf_scores[word].items():
        print(f"TF-IDF score for '{word}' on page {page_num}: {score}") """