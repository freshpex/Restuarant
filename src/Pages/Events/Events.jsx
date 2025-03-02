import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { FaCalendar, FaClock, FaMapMarkerAlt, FaTicketAlt, FaAngleDown, FaAngleUp } from 'react-icons/fa';
import toast from 'react-hot-toast';

const showToast = (message, type) => {
  if (type === 'success') {
    toast.success(message);
  } else if (type === 'error') {
    toast.error(message);
  } else {
    toast(message, {
      icon: type === 'info' ? 'ℹ️' : '⚠️',
      style: {
        borderRadius: '10px',
        background: type === 'info' ? '#E0F2FE' : '#FEF3C7',
        color: type === 'info' ? '#1E40AF' : '#92400E',
      },
    });
  }
};

// Upcoming events data
const upcomingEvents = [
  {
    id: 1,
    title: "Culinary Masterclass: Nigerian Cuisine",
    date: "2023-06-15",
    time: "10:00 AM - 2:00 PM",
    location: "Tim's Kitchen HQ, Emaudo Campus",
    description: "Join our executive chef for an immersive masterclass on traditional Nigerian cuisine. Learn the secrets behind classic dishes and modern interpretations.",
    image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?q=80&w=2070&auto=format&fit=crop",
    tickets: {
      available: true,
      price: "₦5,000",
    }
  },
  {
    id: 2,
    title: "Food Festival: Taste of Edo",
    date: "2023-07-22",
    time: "11:00 AM - 6:00 PM",
    location: "University Main Square",
    description: "A celebration of Edo State's rich culinary heritage. Sample a variety of dishes from different regions, enjoy live cooking demonstrations, and participate in food competitions.",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2070&auto=format&fit=crop",
    tickets: {
      available: true,
      price: "₦2,500",
    }
  },
  {
    id: 3,
    title: "Healthy Cooking Workshop",
    date: "2023-08-05",
    time: "2:00 PM - 5:00 PM",
    location: "Tim's Kitchen HQ, Emaudo Campus",
    description: "Learn how to prepare nutritious and delicious meals on a student budget. Perfect for those looking to maintain a healthy lifestyle while at university.",
    image: "https://images.unsplash.com/photo-1466637574441-749b8f19452f?q=80&w=2080&auto=format&fit=crop",
    tickets: {
      available: true,
      price: "₦3,000",
    }
  }
];

// Past events data
const pastEvents = [
  {
    id: 101,
    title: "African Cuisine Night",
    date: "2023-04-18",
    location: "University Main Hall",
    image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=1980&auto=format&fit=crop",
    highlights: "A celebration of flavors from across the continent. Featured dishes from Nigeria, Ghana, Kenya and South Africa."
  },
  {
    id: 102,
    title: "Student Cooking Competition",
    date: "2023-02-25",
    location: "Campus Kitchen",
    image: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?q=80&w=2077&auto=format&fit=crop",
    highlights: "Students competed to create innovative dishes using limited ingredients. The winner received a scholarship and internship opportunity."
  },
  {
    id: 103,
    title: "Christmas Food Drive",
    date: "2022-12-20",
    location: "Tim's Kitchen and Community Centers",
    image: "https://images.unsplash.com/photo-1608877907149-a206d75ba011?q=80&w=1974&auto=format&fit=crop",
    highlights: "Annual charity event providing meals to 500+ families in the community during the holiday season."
  },
];

const EventCard = ({ event, isPast = false }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [registrationEmail, setRegistrationEmail] = useState('');
  const [registrationName, setRegistrationName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleRegistration = (e) => {
    e.preventDefault();
    setIsRegistering(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsRegistering(false);
      showToast(`Successfully registered for ${event.title}! Check your email for details.`, 'success');
      setRegistrationEmail('');
      setRegistrationName('');
    }, 1500);
  };

  const formattedDate = new Date(event.date).toLocaleDateString('en-GB', {
    day: 'numeric', 
    month: 'long', 
    year: 'numeric'
  });

  if (isPast) {
    return (
      <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
        <div className="h-48 overflow-hidden">
          <img 
            src={event.image} 
            alt={event.title} 
            className="w-full h-full object-cover transition-transform hover:scale-105"
          />
        </div>
        <div className="p-5">
          <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
          <p className="text-gray-500 flex items-center gap-1 mb-3">
            <FaCalendar />
            <span>{formattedDate}</span>
          </p>
          <p className="text-gray-500 flex items-center gap-1 mb-3">
            <FaMapMarkerAlt />
            <span>{event.location}</span>
          </p>
          <p className="text-gray-700">{event.highlights}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-lg border border-gray-200">
      <div className="md:flex">
        <div className="md:w-1/3 h-64 md:h-auto overflow-hidden">
          <img 
            src={event.image} 
            alt={event.title} 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="md:w-2/3 p-6">
          <div className="flex justify-between items-start">
            <h3 className="text-2xl font-bold mb-3 text-gray-800">{event.title}</h3>
            <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-3 py-1 rounded-full">Upcoming</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <p className="flex items-center gap-2 text-gray-600">
              <FaCalendar className="text-yellow-600" />
              <span>{formattedDate}</span>
            </p>
            <p className="flex items-center gap-2 text-gray-600">
              <FaClock className="text-yellow-600" />
              <span>{event.time}</span>
            </p>
            <p className="flex items-center gap-2 text-gray-600">
              <FaMapMarkerAlt className="text-yellow-600" />
              <span>{event.location}</span>
            </p>
            <p className="flex items-center gap-2 text-gray-600">
              <FaTicketAlt className="text-yellow-600" />
              <span>{event.tickets.available ? `${event.tickets.price} - Available` : 'Sold Out'}</span>
            </p>
          </div>
          
          <div className={`transition-all duration-300 overflow-hidden ${showDetails ? 'max-h-[1000px]' : 'max-h-20'}`}>
            <p className="text-gray-700 mb-4">{event.description}</p>
            
            {event.tickets.available && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-3">Register for this event</h4>
                <form onSubmit={handleRegistration}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor={`name-${event.id}`} className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                      <input
                        type="text"
                        id={`name-${event.id}`}
                        value={registrationName}
                        onChange={(e) => setRegistrationName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor={`email-${event.id}`} className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        id={`email-${event.id}`}
                        value={registrationEmail}
                        onChange={(e) => setRegistrationEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className={`px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors ${isRegistering ? 'opacity-70 cursor-not-allowed' : ''}`}
                    disabled={isRegistering}
                  >
                    {isRegistering ? 'Registering...' : 'Register Now'}
                  </button>
                </form>
              </div>
            )}
          </div>
          
          <button
            className="mt-4 flex items-center gap-1 text-yellow-600 hover:text-yellow-700 transition-colors"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Show Less' : 'Show More'}
            {showDetails ? <FaAngleUp /> : <FaAngleDown />}
          </button>
        </div>
      </div>
    </div>
  );
};

const Events = () => {
  return (
    <>
      <Helmet>
        <title>Tim's Kitchen | Events & Workshops</title>
        <meta name="description" content="Join us for culinary events, workshops, and food festivals at Tim's Kitchen." />
      </Helmet>
      
      {/* Hero Section */}
      <div className="bg-[#121212] relative h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-800/70 to-black/70 z-10"></div>
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop"
            alt="Events background" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="text-center relative z-20">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Events & Workshops</h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto">
            Join us for culinary experiences, workshops, and food festivals throughout the year.
          </p>
        </div>
      </div>

      {/* Upcoming Events Section */}
      <div className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Upcoming Events</h2>
          
          <div className="space-y-8">
            {upcomingEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <EventCard event={event} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Past Events Section */}
      <div className="bg-white py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Past Events</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pastEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <EventCard event={event} isPast={true} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Host an Event CTA */}
      <div className="bg-yellow-600 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Want to Host Your Own Event?</h2>
            <p className="text-lg text-white/90 mb-8">
              Tim's Kitchen offers catering services and venue rental for private events, celebrations, and corporate functions. 
              Our team will work with you to create the perfect culinary experience for your guests.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/contact" 
                className="px-6 py-3 bg-white text-yellow-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                Contact Us
              </a>
              <a 
                href="tel:+2349041801170" 
                className="px-6 py-3 bg-yellow-700 text-white font-medium rounded-lg hover:bg-yellow-800 transition-colors"
              >
                Call Us Now
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Signup */}
      <div className="bg-gray-100 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Stay Updated on Future Events</h2>
            <p className="text-gray-600 mb-6">
              Subscribe to our newsletter to get notified about upcoming events, workshops, and special offers.
            </p>
            <form className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-grow px-4 py-3 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-600"
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
              By subscribing, you agree to receive emails from Tim's Kitchen. You can unsubscribe at any time.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Events;