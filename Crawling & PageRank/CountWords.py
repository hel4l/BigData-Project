import os

def count_words_in_files(directory_path, output_file_path):
    with open(output_file_path, 'w', encoding='utf-8') as output_file:  # Specify 'utf-8' encoding for output file
        for filename in os.listdir(directory_path):
            file_path = os.path.join(directory_path, filename)
            if os.path.isfile(file_path):
                with open(file_path, 'r', encoding='utf-8') as file:  # Specify 'utf-8' encoding
                    contents = file.read()
                    word_count = len(contents.split())
                    filename_without_extension, _ = os.path.splitext(filename)  # Remove the .txt extension
                    output_file.write(f"{filename_without_extension} → {word_count}\n")

# Use the function
directory_path = 'D:\\Collage\\Projects\\BigData-Project\\CrawledData'  # Replace with your directory path
output_file_path = 'word_counts.txt'  # Replace with your output file path
count_words_in_files(directory_path, output_file_path)