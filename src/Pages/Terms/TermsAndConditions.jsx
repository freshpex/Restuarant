import React from 'react';
import { Helmet } from 'react-helmet';
import Header2 from '../Header/Header2';

const TermsAndConditions = () => {
  return (
    <>
      <Helmet><title>Tim's Kitchen | Terms & Conditions</title></Helmet>
      <Header2 />
      
      {/* Banner section */}
      <div className="w-full relative">
        <img 
          className="w-full h-[400px] bg-center bg-cover object-cover brightness-75" 
          src="https://png.pngtree.com/thumb_back/fh260/back_our/20190621/ourmid/pngtree-black-meat-western-food-banner-background-image_194600.jpg" 
          alt="Terms and Conditions Banner" 
        />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full text-center">
          <h1 className="text-white text-4xl md:text-5xl font-bold tracking-wider">Terms & Conditions</h1>
        </div>
      </div>
      
      {/* Content section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl">
          <div className="bg-white p-6 md:p-8 rounded-lg shadow-md">
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">1. Introduction</h2>
              <p className="text-gray-700 mb-4">
                Welcome to Tim's Kitchen. These Terms and Conditions govern your use of our website, mobile application, 
                and services offered by Tim's Kitchen. By accessing or using our platform, you agree to be bound by 
                these Terms and Conditions.
              </p>
            </section>
            
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">2. Agreement to Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing or using our services, you agree to be bound by these Terms and Conditions. If you do not 
                agree to these Terms, you should not use our services. Your continued use of our platform following any 
                changes to these Terms constitutes your acceptance of those changes.
              </p>
            </section>
            
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">3. User Accounts</h2>
              <p className="text-gray-700 mb-4">
                To use certain features of our platform, you may be required to create an account. You are responsible 
                for maintaining the confidentiality of your account information and for all activities that occur under 
                your account. You agree to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Provide accurate and complete information when creating your account</li>
                <li>Update your account information as needed to maintain its accuracy</li>
                <li>Keep your account password secure and confidential</li>
                <li>Notify us immediately of any unauthorized access to your account</li>
              </ul>
              <p className="text-gray-700">
                We reserve the right to suspend or terminate accounts that violate these Terms or for any other reason 
                at our sole discretion.
              </p>
            </section>
            
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">4. Ordering and Payment</h2>
              <p className="text-gray-700 mb-4">
                When placing an order through our platform, you agree to provide accurate and complete information 
                regarding the order and payment. All prices listed are in Nigerian Naira (₦) and are inclusive of 
                applicable taxes.
              </p>
              <p className="text-gray-700 mb-4">
                We accept various payment methods as indicated on our platform. By submitting payment information, 
                you represent and warrant that you are authorized to use the payment method provided.
              </p>
            </section>
            
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">5. Food Safety and Allergies</h2>
              <p className="text-gray-700 mb-4">
                We take food safety seriously. However, we cannot guarantee that our foods are allergen-free. If you have 
                food allergies or special dietary requirements, please contact us directly before placing your order.
              </p>
              <p className="text-gray-700">
                By placing an order, you acknowledge that you are aware of the ingredients used in the preparation of 
                the food items you order.
              </p>
            </section>
            
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">6. Delivery Terms</h2>
              <p className="text-gray-700 mb-4">
                Delivery times provided are estimates and are not guaranteed. Delays may occur due to factors outside 
                our control such as traffic conditions, weather, or high order volumes.
              </p>
              <p className="text-gray-700">
                You agree to provide accurate delivery information and ensure that someone is available to receive the 
                order at the specified delivery address.
              </p>
            </section>
            
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">7. Cancellation Policy</h2>
              <p className="text-gray-700 mb-4">
                You may cancel an order before it has been prepared. Once an order is in preparation, cancellations 
                may not be possible. Please contact us immediately if you wish to cancel an order.
              </p>
            </section>
            
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">8. Refunds</h2>
              <p className="text-gray-700 mb-4">
                Refunds may be issued at our discretion if:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>The order was not delivered within a reasonable time from the estimated delivery time</li>
                <li>The food quality was significantly below our standards</li>
                <li>The order was incorrect or incomplete</li>
              </ul>
              <p className="text-gray-700">
                Refund requests must be made within 24 hours of receiving the order.
              </p>
            </section>
            
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">9. Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                Tim's Kitchen shall not be liable for any indirect, incidental, special, consequential, or punitive 
                damages arising out of or related to your use of our services.
              </p>
              <p className="text-gray-700">
                Our liability is limited to the amount paid by you for the specific order in question.
              </p>
            </section>
            
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">10. Changes to Terms</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right to modify these Terms and Conditions at any time. Changes will be effective 
                immediately upon posting on our platform. Your continued use of our services after any changes 
                constitutes your acceptance of the revised Terms.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">11. Contact Information</h2>
              <p className="text-gray-700">
                If you have any questions about these Terms and Conditions, please contact us at:
                <br />
                Email: info@timskitchen.com
                <br />
                Phone: +234 904 180 1170
              </p>
            </section>

            {/* New section about prohibited activities */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">12. Prohibited Activities and Fraud Prevention</h2>
              <p className="text-gray-700 mb-4">
                Tim's Kitchen has a zero-tolerance policy for illegal or fraudulent activities. The following actions are strictly prohibited:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Making fraudulent orders or payments</li>
                <li>Using stolen payment methods or unauthorized payment information</li>
                <li>Attempting to manipulate, bypass, or exploit our ordering, payment, or delivery systems</li>
                <li>Creating multiple accounts to abuse promotions, discounts, or referral programs</li>
                <li>Providing false information regarding orders, deliveries, or refund requests</li>
                <li>Engaging in any activity that violates local, state, or federal laws</li>
                <li>Reselling our products without explicit written permission</li>
                <li>Using our platform to distribute illegal or prohibited items</li>
              </ul>
              <p className="text-gray-700 mb-4">
                <strong>Consequences:</strong> Any violation of these prohibitions may result in:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Immediate termination of your account</li>
                <li>Cancellation of orders without refund</li>
                <li>Reporting of the activity to appropriate law enforcement authorities</li>
                <li>Legal action to recover any damages or losses</li>
                <li>Permanent prohibition from using our services in the future</li>
              </ul>
              <p className="text-gray-700">
                Tim's Kitchen employs various monitoring technologies and fraud detection systems to protect our business 
                and legitimate customers. We reserve the right to refuse service to anyone suspected of engaging in 
                prohibited activities.
              </p>
            </section>

            <div className="mt-10 pt-6 border-t border-gray-200">
              <p className="text-gray-500 text-sm text-center">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TermsAndConditions;
