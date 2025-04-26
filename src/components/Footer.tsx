import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-neutral-200 py-6 md:py-4">
      <div className="container mx-auto px-4 md:px-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start">
            <Link to="/" className="text-primary-700 font-semibold">
              OctoGSign
            </Link>
            <span className="text-neutral-500 text-sm ml-2">© {new Date().getFullYear()}</span>
          </div>
          
          <div className="mt-4 md:mt-0">
            <ul className="flex items-center justify-center md:justify-end space-x-4 text-sm">
              <li>
                <Link to="/privacy" className="text-neutral-600 hover:text-neutral-900">
                  Privacy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-neutral-600 hover:text-neutral-900">
                  Terms
                </Link>
              </li>
              <li>
                <Link to="/compliance" className="text-neutral-600 hover:text-neutral-900">
                  Compliance
                </Link>
              </li>
              <li>
                <Link to="/security" className="text-neutral-600 hover:text-neutral-900">
                  Security
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;