import { debugFetch } from './debugUtils';

// Your markup percentage - modify as needed
const MARKUP_PERCENTAGE = 30;

/**
 * Calculate a domain price with your markup applied
 * 
 * @param {number} basePrice - The original domain price
 * @returns {string} - The price with markup, formatted to 2 decimal places
 */
export const calculatePriceWithMarkup = (basePrice) => {
  const markup = (basePrice * MARKUP_PERCENTAGE) / 100;
  return (basePrice + markup).toFixed(2);
};

/**
 * Mock API function to simulate domain availability check
 * Can be replaced with a real API integration when needed
 * 
 * @param {string} domainName - The domain name to check
 * @param {Array<string>} additionalTlds - Additional TLDs to check
 * @returns {Promise<Array>} - Domain availability results
 */
export const checkDomainAvailability = async (domainName, additionalTlds = []) => {
    try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Default TLDs to check if none provided
        const defaultTlds = ['.vercel.app', '.app', '.com', '.net', '.org', '.io', '.co', '.store', '.shop', '.online', '.tech', '.dev', '.site', '.xyz', '.me', '.ai'];
        const tlds = additionalTlds.length > 0 ? additionalTlds : defaultTlds;
        
        const results = [];
        
        // Process the main domain
        let domain = domainName;
        if (!domain.includes('.')) {
            domain = domain + '.com';
        }
        
        // Get the base domain name without TLD
        const baseName = domain.includes('.')
            ? domain.split('.')[0]
            : domain;
        
        // First add .vercel.app - always available for $30
        results.push({
            domain: baseName + '.vercel.app',
            available: true,
            basePrice: 23.08, // $30 after markup
            price: '30.00',
        });
        
        // Then add .app for $60
        const appDomain = baseName + '.app';
        results.push({
            domain: appDomain,
            available: Math.random() > 0.3,
            basePrice: 46.15, // $60 after markup
            price: '60.00',
        });
        
        // Now add the main domain if it's not .vercel.app or .app
        if (!domain.endsWith('.vercel.app') && !domain.endsWith('.app')) {
            const isAvailable = Math.random() > 0.5;
            const basePrice = Math.floor(Math.random() * 30) + 120; // More expensive: $120-150
            
            results.push({
                domain,
                available: isAvailable,
                basePrice,
                price: calculatePriceWithMarkup(basePrice),
            });
        }
        
        // Check additional TLDs
        for (const tld of tlds) {
            // Skip if already handled or is the main domain's TLD
            if (tld === '.vercel.app' || tld === '.app' || domain.endsWith(tld)) continue;
            
            const domainWithTld = baseName + tld;
            const isAvailable = Math.random() > 0.3;
            const basePrice = Math.floor(Math.random() * 40) + 80; // Costlier: $80-120
            
            results.push({
                domain: domainWithTld,
                available: isAvailable,
                basePrice,
                price: calculatePriceWithMarkup(basePrice),
            });
        }
        
        return results;
    } catch (error) {
        console.error('Error checking domain availability:', error);
        throw new Error('Failed to check domain availability');
    }
};

/**
 * For a future implementation, you could integrate with a real domain API
 * This is a placeholder for that functionality
 */
export const checkRealDomainAvailability = async (domainName) => {
  try {
    // This would be replaced with an actual API call
    // Example using an API like Namecheap, GoDaddy, or a domain reseller API
    
    // const response = await debugFetch(`https://api.example.com/domain/check?name=${encodeURIComponent(domainName)}`, {
    //   headers: {
    //     'Authorization': `Bearer ${API_KEY}`,
    //     'Content-Type': 'application/json'
    //   }
    // });
    
    // if (!response.ok) {
    //   throw new Error('Domain API request failed');
    // }
    
    // const data = await response.json();
    // return {
    //   domain: domainName,
    //   available: data.available,
    //   basePrice: data.price,
    //   price: calculatePriceWithMarkup(data.price)
    // };
    
    // For now, return mock data
    return checkDomainAvailability(domainName);
  } catch (error) {
    console.error('Error with domain API:', error);
    throw error;
  }
};

/**
 * This function could be used to calculate renewal fees with extra markup
 * 
 * @param {number} basePrice - The original domain price
 * @returns {string} - The renewal price with markup
 */
export const calculateRenewalPrice = (basePrice) => {
  // Add a higher markup for renewals (example: 40% instead of 30%)
  const renewalMarkup = (basePrice * 40) / 100;
  return (basePrice + renewalMarkup).toFixed(2);
};

export default {
  checkDomainAvailability,
  checkRealDomainAvailability,
  calculatePriceWithMarkup,
  calculateRenewalPrice
};