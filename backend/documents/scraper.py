"""
Web scraping module for extracting content from URLs
"""

import logging
from typing import Optional
from urllib.parse import urlparse

logger = logging.getLogger(__name__)


class WebScraper:
    """Scrape and extract text content from web pages"""
    
    # Request timeout in seconds
    TIMEOUT = 10
    
    # Maximum response size (50MB)
    MAX_RESPONSE_SIZE = 50 * 1024 * 1024
    
    @staticmethod
    def scrape_url(url: str) -> str:
        """
        Scrape content from a URL and extract readable text
        
        Args:
            url: URL to scrape
            
        Returns:
            Extracted text content from the webpage
            
        Raises:
            ImportError: If requests or BeautifulSoup are not installed
            ValueError: If URL is invalid
            Exception: If scraping fails
        """
        try:
            import requests
            from bs4 import BeautifulSoup
        except ImportError:
            raise ImportError(
                "requests and beautifulsoup4 are required for web scraping. "
                "Install with: pip install requests beautifulsoup4"
            )
        
        # Validate URL
        try:
            result = urlparse(url)
            if not all([result.scheme, result.netloc]):
                raise ValueError(f"Invalid URL: {url}")
        except Exception as e:
            raise ValueError(f"Invalid URL: {url}") from e
        
        try:
            logger.info(f"Scraping URL: {url}")
            
            # Fetch the page
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            
            response = requests.get(
                url,
                headers=headers,
                timeout=WebScraper.TIMEOUT,
                allow_redirects=True
            )
            
            # Check response size
            if len(response.content) > WebScraper.MAX_RESPONSE_SIZE:
                raise ValueError(f"Response too large: {len(response.content)} bytes")
            
            # Raise for bad status
            response.raise_for_status()
            
            # Parse HTML
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Remove script and style elements
            for script in soup(["script", "style", "meta", "noscript"]):
                script.decompose()
            
            # Get text
            text = soup.get_text()
            
            # Clean up whitespace
            lines = (line.strip() for line in text.splitlines())
            chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
            text = '\n'.join(chunk for chunk in chunks if chunk)
            
            logger.info(f"Successfully scraped URL: {len(text)} characters extracted")
            
            if not text or len(text.strip()) < 50:
                logger.warning(f"Scraped content is very short ({len(text)} chars). URL may have required JavaScript rendering.")
            
            return text
            
        except ImportError:
            raise
        except Exception as e:
            logger.error(f"Error scraping URL {url}: {str(e)}")
            raise
    
    @staticmethod
    def validate_url(url: str) -> bool:
        """
        Validate if URL is properly formatted
        
        Args:
            url: URL to validate
            
        Returns:
            True if URL is valid, False otherwise
        """
        try:
            result = urlparse(url)
            return all([result.scheme in ['http', 'https'], result.netloc])
        except Exception:
            return False


def scrape_url(url: str) -> str:
    """
    Convenience function to scrape a URL
    
    Args:
        url: URL to scrape
        
    Returns:
        Extracted text content
    """
    return WebScraper.scrape_url(url)
