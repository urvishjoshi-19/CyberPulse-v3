import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-primary-dark py-6 px-4 sm:px-6 lg:px-8 border-t border-gray-800">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center">
        <div className="flex items-center mb-4 md:mb-0">
          <div className="h-6 w-6 bg-accent rounded-md flex items-center justify-center mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white text-xs">
              <path d="M20 11.08V8l-6-6H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h6"/>
              <path d="M14 3v5h5M18 21v-6M15 18h6"/>
            </svg>
          </div>
          <p className="text-sm text-gray-400">© {new Date().getFullYear()} CyberPulse - Cybersecurity News Aggregator</p>
        </div>
        <div className="flex space-x-6">
          <Link href="/settings">
            <a className="text-gray-400 hover:text-white text-sm">Settings</a>
          </Link>
          <a href="https://thehackernews.com/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-sm">Source</a>
          <a href="#" className="text-gray-400 hover:text-white text-sm">API</a>
          <a href="#" className="text-gray-400 hover:text-white text-sm">About</a>
        </div>
      </div>
    </footer>
  );
}
