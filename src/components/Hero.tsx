import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const Hero: React.FC = () => {
  const technologies = [
    'Python', 'PyTorch', 'TensorFlow', 'LangChain', 'OpenCV', 'Scikit-learn', 'AWS'
  ];

  return (
    <section id="home" className="min-h-screen bg-slate-900 relative overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,#3e3e3e,transparent)]"></div>
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen pt-24 pb-12">
          {/* Left Content */}
          <motion.div 
            className="text-left"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight text-slate-50">
              Hello
              <span className="text-violet-400">.</span>
              <br />
              I'm Sushovan
              <br />
              <span className="text-5xl md:text-6xl">AI Developer</span>
            </h1>
            
            <motion.p 
              className="max-w-lg text-lg text-slate-400 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              I build intelligent and scalable AI solutions, transforming complex data into impactful products.
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4 mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <button className="bg-violet-600 text-white px-8 py-4 rounded-md hover:bg-violet-700 transition-all duration-300 font-medium flex items-center justify-center gap-2">
                <span>Get In Touch</span>
                <ArrowRight size={20} />
              </button>
              <button className="border-2 border-slate-600 text-slate-300 px-8 py-4 rounded-md hover:bg-slate-800 hover:border-slate-700 transition-all duration-300 font-medium">
                My resume
              </button>
            </motion.div>
            
            {/* Technologies */}
            <motion.div 
              className="flex flex-wrap gap-x-6 gap-y-2 text-slate-400"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              {technologies.map((tech, index) => (
                <span key={index} className="text-sm font-medium hover:text-violet-400 transition-colors cursor-default">
                  {tech}
                </span>
              ))}
            </motion.div>
          </motion.div>
          
          {/* Right Content - Profile Image */}
          <motion.div 
            className="hidden lg:flex justify-center items-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative w-96 h-96">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600 to-indigo-800 rounded-full blur-2xl opacity-40 animate-pulse"></div>
              <div className="relative w-full h-full rounded-full bg-slate-800/50 border border-slate-700 p-2 flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden shadow-inner">
                  <div className="w-80 h-80 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-violet-400 text-8xl font-black shadow-lg tracking-tighter">
                    SS
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;