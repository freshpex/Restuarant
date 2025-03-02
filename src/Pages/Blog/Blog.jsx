import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { FaCalendar, FaUser, FaClock, FaSearch, FaTag } from 'react-icons/fa';
import toast from 'react-hot-toast';

const blogPosts = [
    {
        id: 1,
        title: "The Secret to Perfect Nigerian Jollof Rice",
        excerpt: "Discover the authentic techniques and ingredients that make Nigerian Jollof Rice stand out from other variants in West Africa.",
        content: `
            <p>Jollof rice is more than just a dish in Nigeria — it's a cultural icon that sparks passionate debates across West Africa. What makes Nigerian Jollof special is the particular blend of smoky flavor, perfectly cooked rice, and the rich tomato-based sauce.</p>
            
            <h3>The Essential Ingredients</h3>
            <p>The foundation of great Jollof starts with long-grain parboiled rice, fresh tomatoes, red bell peppers, scotch bonnet peppers, and onions. These ingredients create the iconic deep red color and complex flavor profile that Nigerian Jollof is known for.</p>
            
            <h3>The "Party Jollof" Technique</h3>
            <p>The distinctive smoky flavor of Nigerian Jollof comes from what locals call "party Jollof" — rice cooked over firewood or allowed to develop a slightly burned bottom layer called "bottom pot." This imparts a unique taste that simply cannot be replicated with regular stovetop cooking.</p>
            
            <h3>Regional Variations</h3>
            <p>From Lagos to Kaduna, regional variations add unique twists to the basic recipe. Some areas add dried crayfish for umami depth, while others incorporate more ginger and garlic. In the coastal regions, seafood additions are common.</p>
        `,
        author: "Chef Adeola Johnson",
        date: "2023-05-15",
        readTime: "8 min read",
        category: "Nigerian Cuisine",
        image: "https://images.unsplash.com/photo-1634482899180-13304dbd3a86?q=80&w=2070&auto=format&fit=crop",
        featured: true
    },
    {
        id: 2,
        title: "Farm to Table: Supporting Local Agriculture at Tim's Kitchen",
        excerpt: "How we're working with local farmers to bring the freshest ingredients to your plate while supporting sustainable farming practices.",
        content: `
            <p>At Tim's Kitchen, we believe that great food begins with great ingredients. That's why we've developed strong relationships with local farmers and producers to ensure we serve only the freshest, most flavorful ingredients possible.</p>
            
            <h3>Our Local Partners</h3>
            <p>From the lush vegetable farms of Edo State to the small-scale poultry operations in neighboring communities, our ingredients travel only short distances from farm to table. We source over 75% of our produce from farms within a 50km radius of our restaurant.</p>
            
            <h3>Sustainable Practices</h3>
            <p>We prioritize partnerships with farmers who practice sustainable agriculture. This means minimal pesticide use, responsible water management, and ethical treatment of livestock. These practices not only produce better-tasting food but help preserve our environment for generations to come.</p>
            
            <h3>Economic Impact</h3>
            <p>By purchasing directly from local farmers, we're helping to build a more resilient local economy. For every ₦10,000 spent on local food, approximately ₦8,000 remains in the community, compared to just ₦2,500 when buying from larger commercial suppliers.</p>
        `,
        author: "Tim Okoye",
        date: "2023-06-02",
        readTime: "6 min read",
        category: "Sustainability",
        image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=2070&auto=format&fit=crop",
        featured: true
    },
    {
        id: 3,
        title: "Understanding Nigerian Spices and Their Health Benefits",
        excerpt: "Delve into the vibrant world of Nigerian spices and learn how they not only enhance flavor but also offer remarkable health benefits.",
        content: `
            <p>Nigerian cuisine is characterized by its complex, bold flavors, largely derived from a rich variety of indigenous spices and herbs. Beyond adding delicious taste to dishes, these spices have been used for generations for their medicinal properties.</p>
            
            <h3>Uziza: The Pepper with Anti-inflammatory Properties</h3>
            <p>Uziza seeds and leaves add a distinctive peppery flavor to soups and stews. Research has shown they contain compounds with anti-inflammatory and antimicrobial properties. Traditionally used to aid digestion and relieve stomach discomfort.</p>
            
            <h3>Uda (Negro Pepper): The Natural Preservative</h3>
            <p>This aromatic spice serves dual purposes in Nigerian cooking: it adds a musky, peppery flavor while acting as a natural preservative. Rich in antioxidants, Uda has been linked to improved cardiovascular health and respiratory function.</p>
            
            <h3>Ehuru (Calabash Nutmeg): The Digestive Aid</h3>
            <p>With a nutmeg-like flavor that's slightly more intense, Ehuru has been traditionally used to treat digestive disorders and reduce flatulence. Modern research suggests it may have antimicrobial properties that help fight foodborne pathogens.</p>
        `,
        author: "Dr. Nkechi Adebanjo",
        date: "2023-04-18",
        readTime: "10 min read",
        category: "Health",
        image: "https://images.unsplash.com/photo-1532336414791-78b61a6bb707?q=80&w=2070&auto=format&fit=crop"
    },
    {
        id: 4,
        title: "The Art of Nigerian Soups: Beyond Egusi and Okra",
        excerpt: "Exploring the diverse world of Nigerian soups that don't always get international recognition but deserve a place on your dining table.",
        content: `
            <p>When most people think of Nigerian soups, Egusi and Okra quickly come to mind. However, the country's soup heritage goes far beyond these popular options, with each region boasting unique specialties that reflect local ingredients and cultural influences.</p>
            
            <h3>Ofe Nsala: The White Soup</h3>
            <p>Originating from the eastern part of Nigeria, Ofe Nsala (White Soup) is traditionally made with catfish, chicken, or goat meat, and thickened with yam. Unlike many Nigerian soups, it doesn't contain palm oil, giving it its distinctive clear appearance. The flavor comes from utazi leaves, uziza seeds, and ehuru.</p>
            
            <h3>Miyan Kuka: Baobab Leaf Soup</h3>
            <p>A northern Nigerian delicacy, Miyan Kuka utilizes dried baobab leaves to create a soup with a unique sour taste. Often prepared with dried fish and beef, this soup is highly nutritious, with baobab providing high levels of vitamin C, calcium, and antioxidants.</p>
            
            <h3>Banga: Palm Fruit Soup</h3>
            <p>Originating from the Delta region, Banga soup is made from palm fruit extract. The complex extraction process yields a rich, flavorful base that's then seasoned with unique spices like beletete and obenetete. The soup pairs exceptionally well with starchy sides like pounded yam or garri.</p>
        `,
        author: "Chef Folake Adeyemi",
        date: "2023-03-30",
        readTime: "7 min read",
        category: "Nigerian Cuisine",
        image: "https://images.unsplash.com/photo-1583608564370-0cac947b4aeb?q=80&w=1970&auto=format&fit=crop"
    },
    {
        id: 5,
        title: "Campus Cooking 101: Nutritious Meals on a Student Budget",
        excerpt: "Practical advice for university students looking to eat healthy without breaking the bank or sacrificing study time.",
        content: `
            <p>Being a student means juggling classes, social life, and often limited funds. But eating well doesn't have to be expensive or time-consuming. Here at Tim's Kitchen, we've compiled our best advice for students looking to maintain a nutritious diet without breaking the bank.</p>
            
            <h3>Bulk Cooking Strategies</h3>
            <p>Designate one day a week (perhaps Sunday) for meal preparation. Cook large batches of versatile base ingredients like rice, beans, or pasta that can be transformed into different meals throughout the week with simple additions and sauces.</p>
            
            <h3>Student-Friendly Superfoods</h3>
            <p>Incorporate cost-effective nutritional powerhouses: eggs provide protein and B-vitamins at a fraction of meat prices; canned sardines offer omega-3 fatty acids; and locally grown vegetables like ugu (fluted pumpkin leaves) and okra deliver essential vitamins and minerals.</p>
            
            <h3>Equipment Worth Investing In</h3>
            <p>A good rice cooker, a sharp knife, and a quality pot can transform your cooking experience. These basic items allow you to prepare a wide variety of dishes without needing extensive kitchen tools. Consider sharing costs with roommates for less frequently used items.</p>
        `,
        author: "Amaka Obi",
        date: "2023-05-22",
        readTime: "5 min read",
        category: "Student Life",
        image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop"
    },
    {
        id: 6,
        title: "The Evolution of Nigerian Street Food on University Campuses",
        excerpt: "How traditional street food is adapting to meet the tastes and needs of today's university students.",
        content: `
            <p>Street food has always been the heartbeat of Nigerian food culture, offering affordable, quick, and flavorful options. On university campuses, this tradition continues to evolve, blending classic recipes with modern innovations to meet changing student preferences.</p>
            
            <h3>From Roadside to Campus Kiosks</h3>
            <p>What once existed primarily as informal roadside stands has evolved into organized food kiosks and small cafeterias across university grounds. These establishments maintain the spirit and flavors of street food while meeting higher hygiene standards and offering more comfortable dining environments.</p>
            
            <h3>Fusion Innovations</h3>
            <p>Today's campus vendors are experimenting with fusion concepts: suya wraps that combine traditional spiced grilled meat with Lebanese-inspired flatbreads; jollof pasta that marries Italian format with Nigerian flavors; and smoothie bowls topped with local fruits and tiger nuts.</p>
            
            <h3>Technology Integration</h3>
            <p>Many campus food vendors now accept mobile payments and offer pre-ordering through WhatsApp or dedicated apps, allowing students to minimize wait times between classes. Some have developed loyal followings through creative social media marketing on platforms like Instagram and TikTok.</p>
        `,
        author: "Emeka Nwanze",
        date: "2023-02-14",
        readTime: "6 min read",
        category: "Food Trends",
        image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1974&auto=format&fit=crop"
    }
];

const categories = [
    "All",
    "Nigerian Cuisine",
    "Health",
    "Sustainability",
    "Student Life",
    "Food Trends"
];

const Blog = () => {
    const [activeCategory, setActiveCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredPosts, setFilteredPosts] = useState(blogPosts);
    const [subscriberEmail, setSubscriberEmail] = useState("");

    useEffect(() => {
        // Filter posts based on category and search query
        let result = [...blogPosts];
        
        if (activeCategory !== "All") {
            result = result.filter(post => post.category === activeCategory);
        }
        
        if (searchQuery.trim() !== "") {
            const query = searchQuery.toLowerCase();
            result = result.filter(post => 
                post.title.toLowerCase().includes(query) || 
                post.excerpt.toLowerCase().includes(query) ||
                post.author.toLowerCase().includes(query)
            );
        }
        
        setFilteredPosts(result);
    }, [activeCategory, searchQuery]);

    const handleSubscribe = (e) => {
        e.preventDefault();
        toast.success(`Thank you for subscribing! We've sent a confirmation to ${subscriberEmail}.`);
        setSubscriberEmail("");
    };

    const featuredPosts = blogPosts.filter(post => post.featured);

    return (
        <>
            <Helmet>
                <title>Tim's Kitchen | Food Blog</title>
                <meta name="description" content="Read our latest articles on Nigerian cuisine, health benefits of local ingredients, sustainable food practices, and campus cooking tips." />
            </Helmet>
            
            {/* Hero Section */}
            <div className="bg-[#121212] relative h-[50vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-800/70 to-black/70 z-10"></div>
                <div className="absolute inset-0 z-0">
                    <img 
                        src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=2074&auto=format&fit=crop"
                        alt="Blog header" 
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="text-center relative z-20">
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Tim's Kitchen Blog</h1>
                    <p className="text-xl text-gray-200 max-w-2xl mx-auto">
                        Stories, recipes, and insights from our culinary journey
                    </p>
                </div>
            </div>

            {/* Featured Posts */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">Featured Articles</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        {featuredPosts.map(post => (
                            <motion.div 
                                key={post.id}
                                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <div className="md:flex h-full">
                                    <div className="md:w-2/5 h-52 md:h-auto">
                                        <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="p-6 md:w-3/5 flex flex-col justify-between">
                                        <div>
                                            <span className="text-yellow-600 font-medium text-sm uppercase tracking-wide">{post.category}</span>
                                            <h3 className="text-xl font-bold mt-1 mb-3">{post.title}</h3>
                                            <p className="text-gray-600">{post.excerpt}</p>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                            <div className="flex items-center">
                                                <span className="text-gray-500 text-sm flex items-center">
                                                    <FaUser className="mr-2 text-yellow-500" />
                                                    {post.author}
                                                </span>
                                            </div>
                                            <span className="text-gray-500 text-sm flex items-center">
                                                <FaClock className="mr-2 text-yellow-500" />
                                                {post.readTime}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Search and Categories */}
            <section className="bg-white py-8 border-b">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="w-full md:w-2/5 mb-4 md:mb-0">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search articles..."
                                    className="w-full py-2 px-4 pl-10 border border-gray-300 rounded-lg focus:ring focus:ring-yellow-200 focus:border-yellow-500"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                            </div>
                        </div>
                        
                        <div className="w-full md:w-3/5 overflow-x-auto">
                            <div className="flex space-x-3 md:justify-end">
                                {categories.map(category => (
                                    <button
                                        key={category}
                                        className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                                            activeCategory === category 
                                                ? 'bg-yellow-600 text-white' 
                                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                        }`}
                                        onClick={() => setActiveCategory(category)}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Blog Posts */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    {filteredPosts.length === 0 ? (
                        <div className="text-center py-16">
                            <h3 className="text-xl text-gray-600">No articles found matching your search</h3>
                            <button 
                                className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-md"
                                onClick={() => {
                                    setSearchQuery('');
                                    setActiveCategory('All');
                                }}
                            >
                                Clear filters
                            </button>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredPosts.map((post, index) => (
                                <motion.div 
                                    key={post.id} 
                                    className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div className="h-48 overflow-hidden">
                                        <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform hover:scale-105" />
                                    </div>
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-3 py-1 rounded-full flex items-center">
                                                <FaTag className="mr-1" /> {post.category}
                                            </span>
                                            <span className="text-gray-500 text-sm flex items-center">
                                                <FaCalendar className="mr-1" /> {post.date}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold mb-2">{post.title}</h3>
                                        <p className="text-gray-600 mb-4">{post.excerpt}</p>
                                        <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
                                            <span className="text-sm text-gray-600">{post.author}</span>
                                            <span className="text-sm text-gray-600">{post.readTime}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
            
            {/* Newsletter Section */}
            <section className="bg-yellow-50 py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-2xl mx-auto text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Subscribe to Our Newsletter</h2>
                        <p className="text-gray-600 mb-6">
                            Stay updated with our latest recipes, cooking tips, and food stories delivered directly to your inbox.
                        </p>
                        <form className="flex flex-col sm:flex-row gap-2" onSubmit={handleSubscribe}>
                            <input
                                type="email"
                                placeholder="Your email address"
                                className="flex-grow px-4 py-3 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-600"
                                value={subscriberEmail}
                                onChange={(e) => setSubscriberEmail(e.target.value)}
                                required
                            />
                            <button 
                                type="submit" 
                                className="bg-yellow-600 text-white px-6 py-3 rounded-r-lg hover:bg-yellow-700 transition-colors"
                            >
                                Subscribe
                            </button>
                        </form>
                        <p className="mt-4 text-xs text-gray-500">
                            We respect your privacy. Unsubscribe at any time.
                        </p>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Blog;