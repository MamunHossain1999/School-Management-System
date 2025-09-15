import React from 'react';
import ImageSlider from '../components/common/ImageSlider';

const TestSlider: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Beautiful Image Slider
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Experience our stunning image slider with smooth transitions, auto-play functionality, and responsive design.
          </p>
        </div>

        {/* Main Slider */}
        <div className="max-w-6xl mx-auto mb-16">
          <ImageSlider />
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Auto-Play</h3>
            <p className="text-gray-600 text-sm">Automatic slide transitions with customizable intervals</p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Responsive</h3>
            <p className="text-gray-600 text-sm">Perfectly adapts to all screen sizes and devices</p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2M7 4h10M7 4l-2 16h14L17 4M9 9v6M15 9v6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Interactive</h3>
            <p className="text-gray-600 text-sm">Navigation arrows, dots, and touch/swipe support</p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Smooth</h3>
            <p className="text-gray-600 text-sm">Buttery smooth animations and transitions</p>
          </div>
        </div>

        {/* Additional Slider Variants */}
        <div className="space-y-16">
          {/* Compact Slider */}
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">
              Compact Version
            </h2>
            <div className="max-w-4xl mx-auto">
              <ImageSlider 
                className="h-64 md:h-80"
                autoPlayInterval={3000}
                showArrows={false}
              />
            </div>
          </div>

          {/* No Auto-play Slider */}
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">
              Manual Navigation
            </h2>
            <div className="max-w-4xl mx-auto">
              <ImageSlider 
                className="h-64 md:h-80"
                autoPlay={false}
                showDots={false}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 py-8">
          <p className="text-gray-500">
            Built with React, TypeScript, and Tailwind CSS
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestSlider;
