import React from 'react';
import { Brain, Code, Database } from 'lucide-react';
import { motion } from 'framer-motion';

const About: React.FC = () => {
  const services = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "LLMs & Gen AI",
      description: "Proficient in LangChain, LangGraph, Crew AI, and building Agentic Workflows for intelligent systems."
    },
    {
      icon: <Code className="w-8 h-8" />,
      title: "Applied ML & DL",
      description: "End-to-end project experience across NLP and Computer Vision domains with production focus."
    },
    {
      icon: <Database className="w-8 h-8" />,
      title: "MLOps Systems",
      description: "Focus on production-grade pipelines, model deployment, and monitoring for scalable ML."
    }
  ];

  const stats = [
    { number: "50", symbol: "+", label: "Completed Projects" },
    { number: "95", symbol: "%", label: "Client Satisfaction" },
    { number: "3", symbol: "+", label: "Years of Experience" }
  ];

  return (
    <section id="about" className="py-20 bg-slate-900">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Left Side - Services */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="space-y-8">
                {services.map((service, index) => (
                  <div key={index} className="flex items-start space-x-6 group">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-slate-800 border border-slate-700 rounded-lg flex items-center justify-center text-violet-400 group-hover:bg-violet-500 group-hover:text-white transition-all duration-300">
                        {service.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-100 mb-2">{service.title}</h3>
                      <p className="text-slate-400 leading-relaxed">{service.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right Side - About Content */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-5xl font-bold text-slate-50 mb-8">About Me</h2>
              <p className="text-slate-400 text-lg leading-relaxed mb-8">
                Hi there! I'm Sushovan Saha — a passionate Machine Learning practitioner with deep interests in 
                Natural Language Processing, Computer Vision, and the transformative capabilities of Large Language Models. 
                I hold an M.Tech in Data Science from IIT Guwahati and I'm currently a Kaggle Notebook Expert.
              </p>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 mb-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center bg-slate-800/50 p-4 rounded-lg border border-slate-800">
                    <div className="text-4xl font-bold text-slate-50 mb-2">
                      {stat.number}
                      <span className="text-violet-400">{stat.symbol}</span>
                    </div>
                    <p className="text-slate-400 text-sm uppercase tracking-wider">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;