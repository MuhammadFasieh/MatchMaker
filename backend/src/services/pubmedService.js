const axios = require('axios');

/**
 * Service for interacting with the PubMed API (E-utilities)
 */

// Base URLs for NCBI E-utilities
const ESEARCH_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi';
const EFETCH_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi';
const ESUMMARY_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi';

// Tool/email parameters for API requests
const DEFAULT_PARAMS = {
  tool: 'matchmaker-app',
  email: 'info@matchmaker.com', // Should be replaced with a real email
  retmode: 'json'
};

/**
 * Search PubMed for articles matching the query
 * @param {string} query - The search query
 * @param {number} limit - Maximum number of results to return
 * @returns {Promise<Object>} - Search results
 */
const searchPubMed = async (query, limit = 10) => {
  try {
    const response = await axios.get(ESEARCH_URL, {
      params: {
        ...DEFAULT_PARAMS,
        db: 'pubmed',
        term: query,
        retmax: limit
      }
    });

    return response.data;
  } catch (error) {
    console.error('PubMed search error:', error);
    throw new Error('Failed to search PubMed');
  }
};

/**
 * Fetch detailed information for a specific PubMed ID
 * @param {string} pmid - PubMed ID
 * @returns {Promise<Object>} - Article details
 */
const getArticleDetails = async (pmid) => {
  try {
    const response = await axios.get(ESUMMARY_URL, {
      params: {
        ...DEFAULT_PARAMS,
        db: 'pubmed',
        id: pmid
      }
    });

    return response.data;
  } catch (error) {
    console.error(`Error fetching PubMed article ${pmid}:`, error);
    throw new Error(`Failed to fetch PubMed article ${pmid}`);
  }
};

/**
 * Fetch full article data for multiple PubMed IDs
 * @param {Array<string>} pmids - Array of PubMed IDs
 * @returns {Promise<Object>} - Articles data
 */
const getArticlesByPMIDs = async (pmids) => {
  if (!pmids || pmids.length === 0) {
    return { result: {} };
  }

  try {
    const response = await axios.get(ESUMMARY_URL, {
      params: {
        ...DEFAULT_PARAMS,
        db: 'pubmed',
        id: pmids.join(',')
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching PubMed articles:', error);
    throw new Error('Failed to fetch PubMed articles');
  }
};

/**
 * Enrich a research product with data from PubMed
 * @param {Object} researchProduct - The research product to enrich
 * @returns {Promise<Object>} - Enriched research product
 */
const enrichResearchProduct = async (researchProduct) => {
  // Skip if no PMID or if it's not a publication type
  if (!researchProduct.pmid || 
      (researchProduct.type !== 'peer-reviewed' && 
       researchProduct.type !== 'non-peer-reviewed')) {
    return researchProduct;
  }

  try {
    const articleData = await getArticleDetails(researchProduct.pmid);
    if (!articleData || !articleData.result || !articleData.result[researchProduct.pmid]) {
      return researchProduct;
    }

    const article = articleData.result[researchProduct.pmid];

    // Enrich the research product with PubMed data
    return {
      ...researchProduct,
      title: researchProduct.title || article.title,
      journal: researchProduct.journal || article.fulljournalname,
      authors: researchProduct.authors || formatAuthors(article.authors),
      volume: researchProduct.volume || article.volume,
      issueNumber: researchProduct.issueNumber || article.issue,
      pages: researchProduct.pages || article.pages,
      yearPublished: researchProduct.yearPublished || article.pubdate?.split(' ')?.[0],
      pubmedEnriched: true
    };
  } catch (error) {
    console.error(`Error enriching research product with PMID ${researchProduct.pmid}:`, error);
    return researchProduct;
  }
};

/**
 * Format authors from PubMed format to our application format
 * @param {Array} authorsArray - Array of author objects from PubMed
 * @returns {string} - Formatted authors string
 */
const formatAuthors = (authorsArray) => {
  if (!authorsArray || !Array.isArray(authorsArray)) {
    return '';
  }

  return authorsArray
    .map(author => `${author.name}`)
    .join(', ');
};

module.exports = {
  searchPubMed,
  getArticleDetails,
  getArticlesByPMIDs,
  enrichResearchProduct
}; 