#!/usr/bin/env python3
import requests
from bs4 import BeautifulSoup
import json
import re
from datetime import datetime
import sys

def scrape_hacker_news():
    try:
        # URL to scrape
        url = "https://thehackernews.com/"
        
        # Send a GET request to the URL
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()  # Raise an exception for HTTP errors
        
        # Parse the HTML content using BeautifulSoup
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Find all articles on the page
        articles = soup.find_all('div', class_='body-post')
        
        # List to store article data
        article_data = []
        
        # Process each article
        for article in articles:
            # Skip any ads or irrelevant blocks
            if article.find('span', class_='sponsored'):
                continue
                
            try:
                # Extract article URL
                url_element = article.find('a', href=True)
                if not url_element:
                    continue
                article_url = url_element['href']
                
                # Extract article title
                title_element = article.find('h2', class_='home-title')
                if not title_element:
                    continue
                title = title_element.text.strip()
                
                # Extract article summary/description
                summary_element = article.find('div', class_='home-desc')
                summary = summary_element.text.strip() if summary_element else ""
                
                # Extract date of publication
                date_element = article.find('div', class_='item-label')
                date = ""
                if date_element:
                    date_text = date_element.text.strip()
                    # Try to parse the date
                    date_match = re.search(r'(\w+ \d+, \d+)', date_text)
                    if date_match:
                        date = date_match.group(1)
                    else:
                        date = datetime.now().strftime('%B %d, %Y')
                else:
                    date = datetime.now().strftime('%B %d, %Y')
                
                # Extract image URL
                image_element = article.find('img')
                image_url = ""
                if image_element and 'src' in image_element.attrs:
                    image_url = image_element['src']
                
                # Extract tags/categories
                tags = []
                tags_element = article.find('div', class_='item-label')
                if tags_element:
                    # Try to find common cybersecurity tags in the title and summary
                    all_text = (title + " " + summary).lower()
                    possible_tags = [
                        "malware", "ransomware", "phishing", "data breach", 
                        "vulnerability", "exploit", "zero-day", "cve", 
                        "hackers", "apt", "attack", "security", "privacy",
                        "threat", "patch", "update", "windows", "android",
                        "apple", "ios", "linux", "cloud", "browser", "chrome",
                        "firefox", "edge", "safari", "microsoft", "google",
                        "amazon", "aws", "azure", "cybercrime", "ddos",
                        "encryption", "blockchain", "cryptocurrency", "bitcoin"
                    ]
                    
                    for tag in possible_tags:
                        if tag in all_text:
                            tags.append(tag.capitalize())
                    
                    # If no tags were found, add a default tag
                    if not tags:
                        tags.append("Cybersecurity")
                
                # Create article object
                article_obj = {
                    "title": title,
                    "summary": summary,
                    "url": article_url,
                    "date": date,
                    "tags": tags,
                    "image_url": image_url
                }
                
                article_data.append(article_obj)
            
            except Exception as e:
                print(f"Error processing an article: {e}", file=sys.stderr)
                continue
        
        # Return data as JSON
        return json.dumps(article_data)
    
    except Exception as e:
        print(f"Error scraping Hacker News: {e}", file=sys.stderr)
        return json.dumps([])

if __name__ == "__main__":
    result = scrape_hacker_news()
    print(result)
