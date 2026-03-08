import { useState, useEffect, useRef } from 'react';
import { FaGlobe, FaChevronDown } from 'react-icons/fa';

const LanguageSelector = ({ selectedLanguage = 'en', onLanguageChange, variant = 'default' }) => {
  
  const [isOpen, setIsOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(selectedLanguage);
  const dropdownRef = useRef(null);

  // Language data
  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
    { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
    { code: 'bn', name: 'বাংলা', flag: '🇮🇳' },
    { code: 'mr', name: 'मराठी', flag: '🇮🇳' }
  ];

  // Load selected language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage);
      if (onLanguageChange) {
        onLanguageChange(savedLanguage);
      }
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Handle language selection
  const handleLanguageSelect = (languageCode) => {
    setCurrentLanguage(languageCode);
    setIsOpen(false);
    
    // Save to localStorage
    localStorage.setItem('selectedLanguage', languageCode);
    
    // Call parent callback
    if (onLanguageChange) {
      onLanguageChange(languageCode);
    }
  };

  // Get current language object
  const getCurrentLanguageObject = () => {
    return languages.find(lang => lang.code === currentLanguage) || languages[0];
  };

  const currentLang = getCurrentLanguageObject();
  const isNavbar = variant === 'navbar';

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      
      {/* DROPDOWN BUTTON */}
      <button
        onClick={toggleDropdown}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 ${
          isNavbar
            ? 'bg-white/15 hover:bg-white/25 text-white border border-white/30 font-bold'
            : 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 shadow-md hover:shadow-lg'
        }`}
      >
        <FaGlobe className={isNavbar ? 'text-white' : 'text-purple-400'} />
        <span className="text-lg">{currentLang.flag}</span>
        <span className={isNavbar ? 'font-bold' : 'font-medium'}>{currentLang.name}</span>
        <FaChevronDown 
          className={`text-sm ${isNavbar ? 'text-white/90' : 'text-gray-400'} transition-transform ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`} 
        />
      </button>

      {/* DROPDOWN MENU */}
      {isOpen && (
        <div className="absolute top-full mt-2 right-0 min-w-full bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-fadeIn">
          <div className="py-1">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageSelect(language.code)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all ${
                  currentLanguage === language.code
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700'
                }`}
              >
                <span className="text-2xl">{language.flag}</span>
                <span className="font-medium text-base">{language.name}</span>
                {currentLanguage === language.code && (
                  <span className="ml-auto text-purple-600 dark:text-purple-400">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
