import React from 'react';
import { Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="text-2xl font-bold text-slate-50 mb-4">
                Sushovan Saha
              </div>
              <p className="text-slate-400 mb-4 leading-relaxed">
                AI Developer passionate about Machine Learning, NLP, Computer Vision, 
                and building intelligent systems that solve real-world challenges.
              </p>
              <p className="text-slate-500 text-sm">
                © 2024 Sushovan Saha. All rights reserved.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-slate-100">Quick Links</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#home" className="hover:text-violet-400 transition-colors">Home</a></li>
                <li><a href="#about" className="hover:text-violet-400 transition-colors">About</a></li>
                <li><a href="#projects" className="hover:text-violet-400 transition-colors">Projects</a></li>
                <li><a href="#contact" className="hover:text-violet-400 transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-slate-100">Expertise</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-violet-400 transition-colors">Machine Learning</a></li>
                <li><a href="#" className="hover:text-violet-400 transition-colors">NLP & LLMs</a></li>
                <li><a href="#" className="hover:text-violet-400 transition-colors">Computer Vision</a></li>
                <li><a href="#" className="hover:text-violet-400 transition-colors">MLOps</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-8 text-center">
            <div className="flex items-center justify-center space-x-2 text-slate-500">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-violet-500" />
              <span>and lots of coffee</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;