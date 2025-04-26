import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  CheckCircle, 
  FileCheck, 
  Smartphone, 
  Languages, 
  ServerCog,
  ArrowRight,
  Globe,
  Users,
  Landmark,
  Building2,
  Upload
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const features = [
    {
      icon: <Shield className="h-10 w-10 text-primary-700" />,
      title: 'Secure Signatures',
      description: 'Digital signatures compliant with Indian IT Act 2000 with multi-level encryption.'
    },
    {
      icon: <CheckCircle className="h-10 w-10 text-primary-700" />,
      title: 'Aadhaar Integration',
      description: 'Seamless Aadhaar eSign and DSC support for legally binding documentation.'
    },
    {
      icon: <FileCheck className="h-10 w-10 text-primary-700" />,
      title: 'Tamper-Proof',
      description: 'Blockchain-verified document integrity and comprehensive audit trails.'
    },
    {
      icon: <Smartphone className="h-10 w-10 text-primary-700" />,
      title: 'Mobile Responsive',
      description: 'Sign documents on any device with our responsive design.'
    },
    {
      icon: <Languages className="h-10 w-10 text-primary-700" />,
      title: 'Multi-language Support',
      description: 'Interface available in major Indian languages for wider accessibility.'
    },
    {
      icon: <ServerCog className="h-10 w-10 text-primary-700" />,
      title: 'Government Compliant',
      description: 'Follows all Indian regulatory requirements for digital documentation.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header/Navigation */}
      <header className="bg-white border-b border-neutral-200">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <div className="bg-primary-700 text-white p-1 rounded">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                  </svg>
                </div>
                <span className="ml-2 text-xl font-semibold text-primary-800">OctoGSign</span>
              </Link>
            </div>
            
            <div className="hidden md:block">
              <div className="flex items-center space-x-4">
                <Link to="/#features" className="text-neutral-700 hover:text-primary-700">Features</Link>
                <Link to="/#solutions" className="text-neutral-700 hover:text-primary-700">Solutions</Link>
                <Link to="/#pricing" className="text-neutral-700 hover:text-primary-700">Pricing</Link>
                <Link to="/#about" className="text-neutral-700 hover:text-primary-700">About</Link>
                <Link to="/login" className="btn btn-outline">Login</Link>
                <Link to="/register" className="btn btn-primary">Sign Up</Link>
              </div>
            </div>
            
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-neutral-700 hover:text-neutral-900 focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden py-2 border-t border-neutral-200">
              <div className="flex flex-col space-y-2 pb-3">
                <Link to="/#features" className="px-3 py-2 text-neutral-700 hover:text-primary-700">Features</Link>
                <Link to="/#solutions" className="px-3 py-2 text-neutral-700 hover:text-primary-700">Solutions</Link>
                <Link to="/#pricing" className="px-3 py-2 text-neutral-700 hover:text-primary-700">Pricing</Link>
                <Link to="/#about" className="px-3 py-2 text-neutral-700 hover:text-primary-700">About</Link>
                <div className="pt-2 flex flex-col space-y-2">
                  <Link to="/login" className="btn btn-outline text-center">Login</Link>
                  <Link to="/register" className="btn btn-primary text-center">Sign Up</Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary-700 to-primary-800 text-white py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
                Secure Document Signing for India's Digital Future
              </h1>
              <p className="text-lg md:text-xl opacity-90 mb-8">
                The most secure and compliant e-signing platform built specifically for Indian regulations with blockchain verification.
              </p>
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
                <Link to="/register" className="btn bg-accent-600 text-neutral-900 hover:bg-accent-700 text-base px-6 py-3">
                  Get Started Free
                </Link>
                <Link to="/demo" className="btn bg-transparent text-white border border-white hover:bg-white/10 text-base px-6 py-3">
                  Request a Demo
                </Link>
              </div>
              <div className="mt-6 flex items-center justify-center lg:justify-start space-x-2">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-white text-primary-800 flex items-center justify-center text-xs font-bold border-2 border-primary-700">IN</div>
                  <div className="w-8 h-8 rounded-full bg-white text-primary-800 flex items-center justify-center text-xs font-bold border-2 border-primary-700">DS</div>
                  <div className="w-8 h-8 rounded-full bg-white text-primary-800 flex items-center justify-center text-xs font-bold border-2 border-primary-700">BC</div>
                </div>
                <span className="text-sm opacity-90">Trusted by 1000+ Indian businesses</span>
              </div>
            </div>
            <div className="hidden lg:block relative">
              <div className="bg-white p-6 rounded-lg shadow-xl transform rotate-1 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-primary-700 flex items-center justify-center text-white">
                      <FileCheck className="h-5 w-5" />
                    </div>
                    <span className="ml-2 font-semibold">Sales Contract.pdf</span>
                  </div>
                  <span className="bg-success-50 text-success-700 text-xs px-2 py-1 rounded-full">Ready to sign</span>
                </div>
                <div className="border border-neutral-200 rounded p-3 mb-4 text-neutral-700 text-sm">
                  Preview of document with signature blocks highlighted...
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-neutral-200 overflow-hidden">
                      <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Signer" className="w-full h-full object-cover" />
                    </div>
                    <div className="ml-2">
                      <p className="font-medium">Rahul Sharma</p>
                      <p className="text-neutral-500 text-xs">Waiting for signature</p>
                    </div>
                  </div>
                  <button className="bg-primary-700 text-white px-3 py-1 rounded-md text-xs">Sign Now</button>
                </div>
                <div className="mt-4 pt-3 border-t border-neutral-200 flex items-center text-xs text-neutral-500">
                  <Shield className="h-4 w-4 text-primary-700 mr-1" />
                  <span>Secured with blockchain verification</span>
                </div>
              </div>
              <div className="absolute top-8 right-8 transform rotate-3 bg-white p-6 rounded-lg shadow-lg w-64">
                <div className="flex items-center mb-3">
                  <div className="bg-success-50 text-success-700 p-2 rounded-full">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <span className="ml-2 font-medium">Aadhaar Verified</span>
                </div>
                <div className="h-1 w-full bg-neutral-200 rounded-full mb-2">
                  <div className="h-1 rounded-full bg-success-500 w-3/4"></div>
                </div>
                <p className="text-xs text-neutral-500">Compliant with Indian IT Act 2000</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Trusted By Section */}
      <section className="py-10 bg-neutral-50">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-center text-neutral-700 text-sm font-medium uppercase tracking-wider mb-6">Trusted By Industry Leaders</h2>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            <div className="text-neutral-400 flex items-center">
              <Building2 className="h-6 w-6 mr-2" />
              <span className="font-bold text-lg">TechCorp</span>
            </div>
            <div className="text-neutral-400 flex items-center">
              <Landmark className="h-6 w-6 mr-2" />
              <span className="font-bold text-lg">FinBank</span>
            </div>
            <div className="text-neutral-400 flex items-center">
              <Globe className="h-6 w-6 mr-2" />
              <span className="font-bold text-lg">GlobalTech</span>
            </div>
            <div className="text-neutral-400 flex items-center">
              <Users className="h-6 w-6 mr-2" />
              <span className="font-bold text-lg">HealthCare</span>
            </div>
            <div className="text-neutral-400 flex items-center">
              <Building2 className="h-6 w-6 mr-2" />
              <span className="font-bold text-lg">EduGroup</span>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Features built for Indian businesses</h2>
            <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
              Our platform is designed with security, compliance and ease of use as the top priorities for Indian organizations.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200 hover:shadow-md transition-shadow"
              >
                <div className="p-2 bg-primary-50 rounded-lg inline-block mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-neutral-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-16 bg-neutral-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How TrustSign Works</h2>
            <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
              A simple, secure and compliant process from document upload to verification.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-white w-16 h-16 rounded-full shadow-md flex items-center justify-center mx-auto mb-4 border-2 border-primary-100">
                <Upload className="h-8 w-8 text-primary-700" />
              </div>
              <h3 className="text-lg font-semibold mb-2">1. Upload Document</h3>
              <p className="text-neutral-600">Upload your document and set up the signing workflow.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-white w-16 h-16 rounded-full shadow-md flex items-center justify-center mx-auto mb-4 border-2 border-primary-100">
                <Users className="h-8 w-8 text-primary-700" />
              </div>
              <h3 className="text-lg font-semibold mb-2">2. Add Signers</h3>
              <p className="text-neutral-600">Invite all parties required to sign the document.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-white w-16 h-16 rounded-full shadow-md flex items-center justify-center mx-auto mb-4 border-2 border-primary-100">
                <FileCheck className="h-8 w-8 text-primary-700" />
              </div>
              <h3 className="text-lg font-semibold mb-2">3. Sign Securely</h3>
              <p className="text-neutral-600">Use Aadhaar eSign or DSC to securely sign documents.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-white w-16 h-16 rounded-full shadow-md flex items-center justify-center mx-auto mb-4 border-2 border-primary-100">
                <Shield className="h-8 w-8 text-primary-700" />
              </div>
              <h3 className="text-lg font-semibold mb-2">4. Verify & Store</h3>
              <p className="text-neutral-600">Documents are blockchain verified and securely stored.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-primary-700 text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to transform your document workflows?</h2>
            <p className="text-lg opacity-90 mb-8">
              Join thousands of Indian businesses that trust TrustSign for secure, compliant, and efficient document signing.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/register" className="btn bg-accent-600 text-neutral-900 hover:bg-accent-700 text-base px-6 py-3">
                Start Your Free Trial
              </Link>
              <Link to="/contact" className="btn bg-transparent text-white border border-white hover:bg-white/10 text-base px-6 py-3">
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-400 py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="bg-white p-1 rounded">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary-700">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                  </svg>
                </div>
                <span className="ml-2 text-xl font-semibold text-white">OctoGSign</span>
              </div>
              <p className="mb-4">
                Secure document e-signing platform built specifically for the Indian market.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-white transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                  </svg>
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link to="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link to="/solutions" className="hover:text-white transition-colors">Solutions</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link to="/security" className="hover:text-white transition-colors">Security</Link></li>
                <li><Link to="/compliance" className="hover:text-white transition-colors">Compliance</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link to="/guides" className="hover:text-white transition-colors">Guides</Link></li>
                <li><Link to="/api" className="hover:text-white transition-colors">API Documentation</Link></li>
                <li><Link to="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link to="/webinars" className="hover:text-white transition-colors">Webinars</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-neutral-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p>© {new Date().getFullYear()} OctoGSign. All rights reserved.</p>
            <div className="mt-4 md:mt-0 flex items-center">
              <span className="mr-2">Available in:</span>
              <button className="px-2 py-1 bg-neutral-800 rounded text-sm mx-1 hover:bg-neutral-700">English</button>
              <button className="px-2 py-1 bg-neutral-800 rounded text-sm mx-1 hover:bg-neutral-700">हिन्दी</button>
              <button className="px-2 py-1 bg-neutral-800 rounded text-sm mx-1 hover:bg-neutral-700">தமிழ்</button>
              <button className="px-2 py-1 bg-neutral-800 rounded text-sm mx-1 hover:bg-neutral-700">తెలుగు</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;