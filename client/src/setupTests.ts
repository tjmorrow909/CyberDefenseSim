console.log('setupTests loaded');
import '@testing-library/jest-dom';

// Mock window.matchMedia for all tests
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = function (query) {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: function () {},
      removeListener: function () {},
      addEventListener: function () {},
      removeEventListener: function () {},
      dispatchEvent: function () {
        return false;
      }, // Must return boolean
    } as MediaQueryList;
  };
}
